// src/app/api/papers/[id]/quickpass/analyze/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Stage 1: Check Spelling & Grammar
 * Returns corrected text for one-click fix
 */
async function checkSpellingGrammar(questions) {
    const questionsText = questions
        .map((q, i) => `Q${i + 1}: ${q.text}`)
        .join("\n\n");

    const prompt = `You are a professional proofreader. Check these exam questions for SPELLING and GRAMMAR errors only.

${questionsText}

For each question with errors, provide:
1. The question ID
2. List of specific errors found
3. The FULLY CORRECTED text (ready to replace the original)

Return ONLY valid JSON (no markdown):
{
  "spelling_errors": [
    {
      "qid": "Q1",
      "errors": ["'Defne' should be 'Define'", "'calulate' should be 'calculate'"],
      "corrected_text": "The full corrected question text here"
    }
  ]
}

If no spelling/grammar errors, return: {"spelling_errors": []}`;

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0 },
        });

        let rawText = "";
        if (response.text) {
            rawText = response.text.trim();
        } else if (response.candidates?.length) {
            rawText = response.candidates[0].content?.parts?.[0]?.text?.trim() || "";
        }

        rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        const result = JSON.parse(rawText);

        return {
            errors: result.spelling_errors || [],
            safe: (result.spelling_errors || []).length === 0,
        };
    } catch (err) {
        console.error("Spelling check error:", err);
        return { errors: [], safe: true, error: err.message };
    }
}

/**
 * Stage 2: Check Language & Clarity
 * Returns rewritten suggestions for confusing questions
 */
async function checkClarity(questions) {
    const questionsText = questions
        .map((q, i) => `Q${i + 1} (${q.marks} marks): ${q.text}`)
        .join("\n\n");

    const prompt = `As an experienced examiner, check these questions for LANGUAGE CLARITY issues.

${questionsText}

Flag questions where:
- The sentence structure is confusing or hard to follow
- Technical jargon is used without explanation
- The question is poorly worded or awkward to read
- Instructions are unclear or could be stated more simply

For each issue, provide a REWRITTEN version that is clearer.

Return ONLY valid JSON (no markdown):
{
  "clarity_issues": [
    {
      "qid": "Q1",
      "issue": "The sentence structure is confusing - multiple nested clauses make it hard to understand",
      "original_text": "the original question text",
      "suggested_text": "A clearer, rewritten version of the question"
    }
  ]
}

If all questions are clear, return: {"clarity_issues": []}`;

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0 },
        });

        let rawText = "";
        if (response.text) {
            rawText = response.text.trim();
        } else if (response.candidates?.length) {
            rawText = response.candidates[0].content?.parts?.[0]?.text?.trim() || "";
        }

        rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        const result = JSON.parse(rawText);

        return {
            issues: result.clarity_issues || [],
            safe: (result.clarity_issues || []).length === 0,
        };
    } catch (err) {
        console.error("Clarity check error:", err);
        return { issues: [], safe: true, error: err.message };
    }
}

/**
 * Stage 3: Analyze questions for ambiguity
 */
async function analyzeAmbiguity(questions, previousFlags = []) {
    const questionsText = questions
        .map((q, i) => `Q${i + 1} (${q.marks} marks): ${q.text}`)
        .join("\n\n");

    const previousContext = previousFlags.length > 0
        ? `\n\nPREVIOUS ANALYSIS (maintain consistency unless questions changed):\n${JSON.stringify(previousFlags, null, 2)}\n\nOnly add NEW issues if you find them. Remove issues from previous analysis if the question text has been fixed.`
        : '';

    const prompt = `As an experienced examiner, check these questions for CLARITY ISSUES that could cause student disputes.

${questionsText}${previousContext}

Flag questions where:
- Students can interpret the question in multiple ways
- The expected scope or depth is not defined
- Key terms are vague and need definition
- The question is too broad or open-ended

Use SIMPLE TEACHER LANGUAGE. Examples:
- "This question is too broad - students won't know how much to write"
- "Students can interpret this in multiple ways"
- "Expected scope is not defined - what exactly should students cover?"
- "The term 'discuss' needs more specific direction"

Return ONLY valid JSON (no markdown):
{
  "ambiguous_questions": [
    {
      "qid": "Q1",
      "severity": "high" | "medium" | "low",
      "issue": "simple teacher language description",
      "suggestion": "simple fix in teacher language"
    }
  ]
}

If all questions are clear, return: {"ambiguous_questions": []}`;

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0 },
        });

        let rawText = "";
        if (response.text) {
            rawText = response.text.trim();
        } else if (response.candidates?.length) {
            rawText = response.candidates[0].content?.parts?.[0]?.text?.trim() || "";
        }

        // Clean markdown fences
        rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

        const result = JSON.parse(rawText);
        const flags = result.ambiguous_questions || [];

        return {
            flags,
            safe: flags.filter((f) => f.severity === "high").length === 0,
        };
    } catch (err) {
        console.error("Ambiguity analysis error:", err);
        return { flags: [], safe: true, error: err.message };
    }
}

/**
 * Validate OR questions for fairness
 */
async function validateOrQuestions(questions, previousIssues = []) {
    // Build pairs: each question marked as OR pairs with the NEXT question in the full list
    const pairs = [];

    for (let i = 0; i < questions.length; i++) {
        if (questions[i].isOr && i + 1 < questions.length) {
            pairs.push([questions[i], questions[i + 1]]);
        }
    }

    if (pairs.length === 0) {
        return { issues: [], safe: true };
    }

    const pairsText = pairs
        .map(
            ([q1, q2], i) =>
                `Pair ${i + 1}:
Option A (${q1.marks} marks): ${q1.text}
Option B (${q2.marks} marks): ${q2.text}`
        )
        .join("\n\n");

    const prompt = `As an experienced examiner, check if these OR question pairs are FAIR to students.

${pairsText}

Students will complain if:
- One OR option is clearly easier than the other
- One takes much more time to answer
- One is more straightforward while the other is vague
- The difficulty level is unequal

Use SIMPLE TEACHER LANGUAGE. Examples:
- "Option A is much easier - students will always pick it"
- "Option B takes twice as long to answer"
- "One tests recall, the other tests application - unfair choice"
- "Both options are fair and well-balanced" (if no issues)

Return ONLY valid JSON (no markdown):
{
  "or_conflicts": [
    {
      "pair": ["Q1", "Q2"],
      "issue": "simple teacher language description",
      "recommendation": "simple fix in teacher language"
    }
  ]
}

If all OR pairs are fair, return: {"or_conflicts": []}`;

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0 },
        });

        let rawText = "";
        if (response.text) {
            rawText = response.text.trim();
        } else if (response.candidates?.length) {
            rawText = response.candidates[0].content?.parts?.[0]?.text?.trim() || "";
        }

        rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        const result = JSON.parse(rawText);

        return {
            issues: result.or_conflicts || [],
            safe: (result.or_conflicts || []).length === 0,
        };
    } catch (err) {
        console.error("OR validation error:", err);
        return { issues: [], safe: true, error: err.message };
    }
}

/**
 * Check marks vs effort fairness
 */
async function checkMarksEffort(questions, previousWarnings = []) {
    const questionsText = questions
        .map((q, i) => `Q${i + 1}: ${q.text}\nMarks: ${q.marks}`)
        .join("\n\n");

    const prompt = `As an experienced examiner, check if MARKS ALLOCATION is justified for each question.

${questionsText}

Flag questions where:
- The marks are too high for a simple question
- The marks are too low for a complex question  
- The effort required doesn't match the marks given
- This will cause problems during moderation

Use SIMPLE TEACHER LANGUAGE. Examples:
- "This 6-mark question only needs 3 marks - it's just recall"
- "This 4-mark question is too heavy - needs at least 6 marks"
- "Marks are justified for the complexity level"
- "External moderator will question this allocation"

Return ONLY valid JSON (no markdown):
{
  "effort_warnings": [
    {
      "qid": "Q1",
      "allocated_marks": 6,
      "recommended_marks": 3,
      "reason": "simple teacher language explanation"
    }
  ]
}

If all marks are justified, return: {"effort_warnings": []}`;

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0 },
        });

        let rawText = "";
        if (response.text) {
            rawText = response.text.trim();
        } else if (response.candidates?.length) {
            rawText = response.candidates[0].content?.parts?.[0]?.text?.trim() || "";
        }

        rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        const result = JSON.parse(rawText);

        return {
            warnings: result.effort_warnings || [],
            safe: (result.effort_warnings || []).length === 0,
        };
    } catch (err) {
        console.error("Marks-effort check error:", err);
        return { warnings: [], safe: true, error: err.message };
    }
}

/**
 * Detect duplicate questions
 */
async function detectDuplicates(questions, previousPairs = []) {
    const questionsText = questions
        .map((q, i) => `Q${i + 1} (${q.qid}): ${q.text}`)
        .join("\n\n");

    const prompt = `As an experienced examiner, check if any questions TEST THE SAME THING.

${questionsText}

Flag pairs where:
- Two questions test the same concept or skill
- Answering one essentially answers the other
- Students get "free marks" from repetition
- The paper loses quality due to overlap

Use SIMPLE TEACHER LANGUAGE. Examples:
- "These two questions test the same concept - students get free marks"
- "Q3 is basically a subset of Q7"
- "Both questions require the same formula/theorem"
- "This overlap reduces paper quality"

Return ONLY valid JSON (no markdown):
{
  "duplicates": [
    {
      "pair": ["Q1", "Q5"],
      "overlap_type": "same_concept",
      "explanation": "simple teacher language description"
    }
  ]
}

If no duplicates found, return: {"duplicates": []}`;

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0 },
        });

        let rawText = "";
        if (response.text) {
            rawText = response.text.trim();
        } else if (response.candidates?.length) {
            rawText = response.candidates[0].content?.parts?.[0]?.text?.trim() || "";
        }

        rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        const result = JSON.parse(rawText);

        return {
            pairs: result.duplicates || [],
            safe: (result.duplicates || []).length === 0,
        };
    } catch (err) {
        console.error("Duplicate detection error:", err);
        return { pairs: [], safe: true, error: err.message };
    }
}

/**
 * Check evaluation smoothness - will questions cause marking inconsistency?
 */
async function checkEvaluationSmoothness(questions, previousWarnings = []) {
    const questionsText = questions
        .map((q, i) => `Q${i + 1} (${q.marks} marks): ${q.text}`)
        .join("\n\n");

    const previousContext = previousWarnings.length > 0
        ? `\n\nPREVIOUS ANALYSIS (maintain consistency):\n${JSON.stringify(previousWarnings, null, 2)}\n\nOnly flag NEW issues or remove fixed ones.`
        : '';

    const prompt = `As an experienced examiner, analyze these questions for MARKING CONSISTENCY issues.

${questionsText}${previousContext}

Flag questions that will cause problems during evaluation:
- Questions with no clear expected answer (too open-ended)
- Questions where students can give wildly different valid answers
- Questions that will be hard to mark consistently across evaluators
- Questions with subjective scoring ("discuss", "comment" without clear scope)

Use SIMPLE TEACHER LANGUAGE in your responses. Examples:
- "This question is too open-ended - students will give 10 different answers"
- "Hard to mark consistently - no clear right answer"
- "Examiners will disagree on what deserves full marks"

Return ONLY valid JSON (no markdown):
{
  "smoothness_issues": [
    {
      "qid": "Q1",
      "issue": "simple teacher language description",
      "risk": "Students will answer differently, causing marking disputes"
    }
  ]
}

If all questions can be marked consistently, return: {"smoothness_issues": []}`;

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0 },
        });

        let rawText = "";
        if (response.text) {
            rawText = response.text.trim();
        } else if (response.candidates?.length) {
            rawText = response.candidates[0].content?.parts?.[0]?.text?.trim() || "";
        }

        rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        const result = JSON.parse(rawText);
        const issues = result.smoothness_issues || [];

        return {
            issues,
            safe: issues.length === 0,
        };
    } catch (err) {
        console.error("Evaluation smoothness check error:", err);
        return { issues: [], safe: true, error: err.message };
    }
}

/**
 * Check Difficulty Distribution - Balanced easy/medium/hard mix
 */
async function checkDifficultyDistribution(questions) {
    const questionsText = questions
        .map((q, i) => `Q${i + 1} (${q.marks} marks): ${q.text}`)
        .join("\n\n");

    const prompt = `As an experienced examiner, classify each question's DIFFICULTY LEVEL for an average student.

${questionsText}

For each question, assign difficulty:
- **Easy**: Basic recall, straightforward application, minimal thinking
- **Medium**: Requires understanding, multi-step problem, moderate complexity
- **Hard**: Complex analysis, synthesis, creative problem-solving

Consider:
- Cognitive demands (not just Bloom's level)
- Time and effort required
- Common student struggles

Ideal distribution for balanced paper:
- Easy: 30% (confidence builders)
- Medium: 50% (core assessment)
- Hard: 20% (differentiation)

Return ONLY valid JSON (no markdown):
{
  "difficulty_classification": [
    {
      "qid": "Q1",
      "difficulty": "easy" | "medium" | "hard",
      "reasoning": "brief explanation",
      "marks": 5
    }
  ],
  "progression_check": {
    "starts_easy": true,
    "has_gradual_increase": true,
    "hard_questions_clustered": false,
    "notes": "description of progression pattern"
  }
}`;

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0 },
        });

        let rawText = "";
        if (response.text) {
            rawText = response.text.trim();
        } else if (response.candidates?.length) {
            rawText = response.candidates[0].content?.parts?.[0]?.text?.trim() || "";
        }

        rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        const result = JSON.parse(rawText);

        // Calculate distribution
        const distribution = { easy: 0, medium: 0, hard: 0 };
        const marksByDifficulty = { easy: 0, medium: 0, hard: 0 };
        const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

        result.difficulty_classification?.forEach(q => {
            const difficulty = q.difficulty.toLowerCase();
            distribution[difficulty]++;
            marksByDifficulty[difficulty] += q.marks || 0;
        });

        const percentageByDifficulty = {
            easy: totalMarks > 0 ? (marksByDifficulty.easy / totalMarks * 100) : 0,
            medium: totalMarks > 0 ? (marksByDifficulty.medium / totalMarks * 100) : 0,
            hard: totalMarks > 0 ? (marksByDifficulty.hard / totalMarks * 100) : 0
        };

        // Generate warnings
        const warnings = [];

        // Ideal ranges: Easy 20-40%, Medium 40-60%, Hard 10-30%
        if (percentageByDifficulty.easy < 20) {
            warnings.push({
                type: 'too_few_easy',
                message: `Only ${Math.round(percentageByDifficulty.easy)}% easy questions - students may struggle to gain momentum`,
                severity: 'medium',
                recommendation: 'Add more easy questions at the start (aim for 25-35%)'
            });
        }

        if (percentageByDifficulty.easy > 45) {
            warnings.push({
                type: 'too_many_easy',
                message: `${Math.round(percentageByDifficulty.easy)}% easy questions - paper may lack rigor`,
                severity: 'medium',
                recommendation: 'Replace some easy questions with medium-level ones'
            });
        }

        if (percentageByDifficulty.hard > 35) {
            warnings.push({
                type: 'too_many_hard',
                message: `${Math.round(percentageByDifficulty.hard)}% hard questions - may demoralize students`,
                severity: 'high',
                recommendation: 'Reduce hard questions to 15-25% for better balance'
            });
        }

        if (percentageByDifficulty.hard < 10 && totalMarks > 40) {
            warnings.push({
                type: 'too_few_hard',
                message: `Only ${Math.round(percentageByDifficulty.hard)}% hard questions - limited differentiation`,
                severity: 'low',
                recommendation: 'Add challenging questions to distinguish top performers'
            });
        }

        // Check progression
        const progression = result.progression_check;
        if (!progression?.starts_easy) {
            warnings.push({
                type: 'poor_start',
                message: 'Paper starts with difficult questions - may cause student anxiety',
                severity: 'high',
                recommendation: 'Begin with 1-2 easy questions to build confidence'
            });
        }

        if (progression?.hard_questions_clustered) {
            warnings.push({
                type: 'clustering',
                message: 'Hard questions clustered together - uneven difficulty curve',
                severity: 'medium',
                recommendation: 'Distribute hard questions throughout the paper'
            });
        }

        return {
            classification: result.difficulty_classification,
            distribution,
            marksByDifficulty,
            percentageByDifficulty,
            progression: progression,
            warnings,
            safe: warnings.filter(w => w.severity === 'high').length === 0,
        };
    } catch (err) {
        console.error('Difficulty distribution check error:', err);
        return {
            warnings: [],
            safe: true,
            error: err.message
        };
    }
}

/**
 * Check Time Feasibility - Does paper fit in exam duration?
 */
async function checkTimeFeasibility(questions, examDuration = null, bloomsData = null) {
    // If no exam duration specified, try to infer or use default (3 hours = 180 minutes)
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    const defaultDuration = totalMarks > 60 ? 180 : 120; // 3 hours for >60 marks, else 2 hours
    const duration = examDuration || defaultDuration;

    // Build questions text enriched with Bloom's level and OR pair info
    const bloomsLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
    const classifiedQuestions = bloomsData?.questionsClassified || [];

    const questionsText = questions
        .map((q, i) => {
            let line = `Q${i + 1} (${q.marks} marks): ${q.text}`;

            // Tag OR pairs
            if (q.isOr && i + 1 < questions.length) {
                line += `\n   [⚡ OR PAIR START — student chooses between Q${i + 1} and Q${i + 2}]`;
            } else if (i > 0 && questions[i - 1]?.isOr) {
                line += `\n   [⚡ OR PAIR OPTION — alternative to Q${i}]`;
            }

            // Try to find Bloom's level from classification data
            const classified = classifiedQuestions[i] || q;
            const bloomsLevel = classified.bloomsLevel || q.bloomsLevel || null;
            if (bloomsLevel && bloomsLevel >= 1 && bloomsLevel <= 6) {
                line += `\n   [Bloom's Level: ${bloomsLevel} - ${bloomsLevels[bloomsLevel - 1]}]`;
            }
            return line;
        })
        .join("\n\n");

    // Build Bloom's context section for the prompt
    const bloomsContext = bloomsData ? `

BLOOM'S TAXONOMY CONTEXT:
Each question has been classified by Bloom's taxonomy level. Use this to guide your time estimates:

| Bloom's Level | Cognitive Demand | Time Impact |
|---|---|---|
| L1 - Remember | Recall facts, definitions | Fastest - minimal thinking, mostly writing |
| L2 - Understand | Explain, summarize, interpret | Slightly more - needs comprehension |
| L3 - Apply | Use formulas, solve problems, calculate | Moderate - needs computation/working |
| L4 - Analyze | Compare, contrast, break down | More time - requires critical thinking |
| L5 - Evaluate | Judge, justify, argue | High - needs reasoning and evidence |
| L6 - Create | Design, construct, synthesize | Highest - needs original thinking |

IMPORTANT RULES:
- L1 (Remember) questions: A student should need ~1-1.5 min per mark (quick recall)
- L2 (Understand) questions: ~1.5-2 min per mark (needs explanation)
- L3 (Apply) questions: ~2-2.5 min per mark (calculations, working steps)
- L4 (Analyze) questions: ~2.5-3 min per mark (comparison, critical thinking)
- L5 (Evaluate) questions: ~3-3.5 min per mark (judgment + justification)
- L6 (Create) questions: ~3-4 min per mark (original design/synthesis)

Also consider:
- Questions involving CALCULATIONS or NUMERICAL WORK need extra time for working steps
- Questions requiring DIAGRAMS or GRAPHS need extra 2-3 minutes
- Questions with MULTIPLE PARTS should sum sub-part times
- Case-study or passage-based questions need extra reading time` : '';

    // Build OR questions context
    const hasOrQuestions = questions.some(q => q.isOr);
    const orContext = hasOrQuestions ? `

OR QUESTIONS — CRITICAL RULE:
Some questions are marked as "OR PAIR". This means the student ONLY answers ONE of the two options, NOT both.
- For total_estimated_time: count ONLY the SHORTER option from each OR pair
- Still estimate time for BOTH options individually in time_estimates
- Mark OR pair questions with "is_or_pair": true in the response
- The total time should reflect what a student ACTUALLY spends (one option per OR pair)` : '';

    const prompt = `As an experienced examiner, estimate the TIME REQUIRED for an average student to complete each question.

${questionsText}

Exam Duration: ${duration} minutes
Total Marks: ${totalMarks}${bloomsContext}${orContext}

For each question, estimate:
1. Time to read and understand (minutes)
2. Time to formulate/think/calculate (minutes)  
3. Time to write the answer (minutes)
4. Total time needed (minutes)

Then check if the paper is TIME FEASIBLE:
- Total estimated time vs. exam duration
- Pacing issues (some questions too time-heavy for their marks)
- Students need buffer time (10-15%) for planning/review
- Flag any question where time-per-mark ratio is unusually high or low

Return ONLY valid JSON (no markdown):
{
  "time_estimates": [
    {
      "qid": "Q1",
      "read_time": 2,
      "think_time": 3,
      "write_time": 5,
      "total_time": 10,
      "marks": 5,
      "blooms_level": 3,
      "has_calculations": true,
      "reasoning": "Apply-level question with numerical computation, needs working steps"
    }
  ],
  "total_estimated_time": 120,
  "exam_duration": ${duration},
  "warnings": [
    {
      "type": "insufficient_time" | "uneven_pacing" | "time_heavy_question" | "too_fast_for_level",
      "message": "simple teacher language description",
      "severity": "high" | "medium" | "low"
    }
  ]
}`;

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0 },
        });

        let rawText = "";
        if (response.text) {
            rawText = response.text.trim();
        } else if (response.candidates?.length) {
            rawText = response.candidates[0].content?.parts?.[0]?.text?.trim() || "";
        }

        rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        const result = JSON.parse(rawText);

        // Additional analysis
        let totalTime = result.total_estimated_time || 0;

        // Server-side OR pair correction: count the average of both options
        const timeEstimates = result.time_estimates || [];
        if (hasOrQuestions && timeEstimates.length > 0) {
            let correctedTotal = 0;
            let i = 0;
            while (i < questions.length) {
                const est = timeEstimates[i];
                if (questions[i]?.isOr && i + 1 < questions.length) {
                    // OR pair: count the average of both options
                    const optionA = est?.total_time || 0;
                    const optionB = timeEstimates[i + 1]?.total_time || 0;
                    correctedTotal += Math.round((optionA + optionB) / 2);
                    i += 2; // skip both options
                } else if (i > 0 && questions[i - 1]?.isOr) {
                    // Already handled as part of the OR pair above
                    i++;
                } else {
                    correctedTotal += est?.total_time || 0;
                    i++;
                }
            }
            totalTime = correctedTotal;
        }

        const bufferTime = duration * 0.15; // 15% buffer
        const availableTime = duration - bufferTime;

        const warnings = result.warnings || [];

        // Check if total time exceeds available time
        if (totalTime > availableTime) {
            const excess = Math.round(totalTime - availableTime);
            warnings.push({
                type: 'insufficient_time',
                message: `Students need ~${Math.round(totalTime)} mins but only have ${Math.round(availableTime)} mins after buffer`,
                severity: 'high',
                recommendation: `Reduce scope by ${excess} minutes or extend exam duration`
            });
        }

        // Check for extremely time-heavy questions
        const avgTimePerMark = totalTime / totalMarks;
        result.time_estimates?.forEach(est => {
            const timePerMark = est.total_time / est.marks;
            if (timePerMark > avgTimePerMark * 1.5) {
                warnings.push({
                    type: 'time_heavy_question',
                    message: `${est.qid} requires ${est.total_time} mins for ${est.marks} marks (${Math.round(timePerMark)} mins/mark)`,
                    severity: 'medium',
                    recommendation: 'Consider reducing complexity or increasing marks'
                });
            }
        });

        return {
            timeEstimates: result.time_estimates,
            totalEstimatedTime: totalTime,
            examDuration: duration,
            bufferTime: Math.round(bufferTime),
            warnings,
            safe: warnings.filter(w => w.severity === 'high').length === 0,
        };
    } catch (err) {
        console.error('Time feasibility check error:', err);
        return {
            warnings: [],
            safe: true,
            error: err.message
        };
    }
}

/**
 * Check Bloom's Taxonomy - Cognitive Level Distribution
 */
async function checkBloomsTaxonomy(questions, previousWarnings = []) {
    const { classifyQuestions, analyzeBloomsDistribution } = await import('@/lib/bloom-classifier');

    try {
        // Classify questions if not already classified
        const needsClassification = questions.some(q => !q.bloomsLevel);

        let classifiedQuestions;
        if (needsClassification) {
            console.log('[Bloom\'s] Classifying questions...');
            classifiedQuestions = await classifyQuestions(questions);
        } else {
            classifiedQuestions = questions;
        }

        // Analyze distribution
        const analysis = analyzeBloomsDistribution(classifiedQuestions);

        // Generate warnings based on distribution
        const warnings = [];

        // Check for over-reliance on Remember level
        if (analysis.percentageByLevel[1] > 40) {
            warnings.push({
                type: 'remember_heavy',
                message: `Over-reliance on "Remember" level (${Math.round(analysis.percentageByLevel[1])}% of marks)`,
                severity: 'high',
                recommendation: 'Balance with higher-order thinking questions (Analyze, Evaluate, Create)'
            });
        }

        // Check for limited higher-order thinking
        const hotPct = analysis.percentageByLevel[4] + analysis.percentageByLevel[5] + analysis.percentageByLevel[6];
        if (hotPct < 10) {
            warnings.push({
                type: 'low_hot',
                message: `Limited higher-order thinking questions (${Math.round(hotPct)}% of marks)`,
                severity: 'medium',
                recommendation: 'Add questions at Analyze/Evaluate/Create levels for OBE compliance'
            });
        }

        // Check for low average cognitive level
        if (analysis.avgCognitiveLevel < 2.5) {
            warnings.push({
                type: 'low_average',
                message: `Average cognitive level is low (${analysis.avgCognitiveLevel.toFixed(2)} / 6.0)`,
                severity: 'medium',
                recommendation: 'Aim for average ≥ 2.5 for balanced assessment'
            });
        }

        // Check for complete absence of higher levels
        if (analysis.percentageByLevel[5] === 0 && analysis.percentageByLevel[6] === 0) {
            warnings.push({
                type: 'missing_top_levels',
                message: 'No "Evaluate" or "Create" level questions',
                severity: 'low',
                recommendation: 'Consider adding at least one higher-order question'
            });
        }

        return {
            distribution: analysis.distribution,
            marksByLevel: analysis.marksByLevel,
            percentageByLevel: analysis.percentageByLevel,
            avgCognitiveLevel: analysis.avgCognitiveLevel,
            warnings,
            safe: warnings.filter(w => w.severity === 'high').length === 0,
            questionsClassified: classifiedQuestions
        };

    } catch (err) {
        console.error('Bloom\'s Taxonomy check error:', err);
        return {
            distribution: null,
            warnings: [],
            safe: true,
            error: err.message
        };
    }
}

/**
 * Determine overall safety
 */
function determineOverallSafety(analysis) {
    const { ambiguity, or_conflicts, marks_effort, duplicates, evaluation_smoothness } = analysis;

    // Critical: high severity ambiguity (only check if ambiguity analysis was run)
    if (ambiguity?.flags) {
        const hasHighAmbiguity = ambiguity.flags.some((f) => f.severity === "high");
        if (hasHighAmbiguity) return false;
    }

    // Critical: OR conflicts (only check if or_conflicts analysis was run)
    if (or_conflicts && !or_conflicts.safe) return false;

    // Critical: evaluation smoothness issues (only check if evaluation_smoothness analysis was run)
    if (evaluation_smoothness && !evaluation_smoothness.safe) return false;

    // Warnings only (not critical)
    return true;
}

/**
 * Count warnings
 */
function countWarnings(intelligence) {
    const qp = intelligence.quickpass;
    return (
        (qp.ambiguity?.flags?.length || 0) +
        (qp.or_conflicts?.issues?.length || 0) +
        (qp.marks_effort?.warnings?.length || 0) +
        (qp.duplicates?.pairs?.length || 0) +
        (qp.evaluation_smoothness?.issues?.length || 0) +
        (qp.difficulty?.warnings?.length || 0) +
        (qp.time?.warnings?.length || 0) +
        (qp.blooms?.warnings?.length || 0)
    );
}

/**
 * Count critical issues
 */
function countCritical(intelligence) {
    const qp = intelligence.quickpass;
    const highAmbiguity = (qp.ambiguity?.flags || []).filter(
        (f) => f.severity === "high"
    ).length;
    const orIssues = qp.or_conflicts?.issues?.length || 0;
    return highAmbiguity + orIssues;
}

/**
 * POST /api/papers/[id]/quickpass/analyze
 * 
 * Body: {
 *   questions: [...],
 *   checks: ["typos", "readability", "unclear", "or_balance", "marks", "duplicates", "grading"]
 * }
 * If checks not provided, runs ALL checks.
 */
export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Allow questions to be passed in the request body (for Step 1 before finalization)
        let questions = body.questions;

        // Get selected checks (default: all)
        const ALL_CHECKS = ["typos", "readability", "unclear", "or_balance", "marks", "duplicates", "grading", "blooms", "time", "difficulty"];
        const selectedChecks = body.checks && body.checks.length > 0
            ? body.checks.filter(c => ALL_CHECKS.includes(c))
            : ALL_CHECKS;

        // Extract previous analysis for consistency (AI will see what it previously found)
        const previousAnalysis = body.previousAnalysis?.quickpass || null;

        // If questions not provided in body, try to load from database
        if (!questions) {
            const { data: paper, error: paperError } = await supabase
                .from("papers")
                .select("*")
                .eq("id", id)
                .single();

            if (paperError || !paper) {
                return NextResponse.json(
                    { success: false, error: "Paper not found" },
                    { status: 404 }
                );
            }

            questions = paper.paper_data?.questions || [];
        }

        if (!questions || questions.length === 0 || !Array.isArray(questions)) {
            return NextResponse.json(
                { success: false, error: "No questions to analyze" },
                { status: 400 }
            );
        }

        console.log(`[QuickPass] Running checks: ${selectedChecks.join(", ")} on ${questions.length} questions`);

        // Build promises only for selected checks
        const checkPromises = {};

        if (selectedChecks.includes("typos")) {
            checkPromises.typos = checkSpellingGrammar(questions);
        }
        if (selectedChecks.includes("readability")) {
            checkPromises.readability = checkClarity(questions);
        }
        if (selectedChecks.includes("unclear")) {
            checkPromises.unclear = analyzeAmbiguity(questions, previousAnalysis?.unclear?.flags || []);
        }
        if (selectedChecks.includes("or_balance")) {
            checkPromises.or_balance = validateOrQuestions(questions, previousAnalysis?.or_balance?.issues || []);
        }
        if (selectedChecks.includes("marks")) {
            checkPromises.marks = checkMarksEffort(questions, previousAnalysis?.marks?.warnings || []);
        }
        if (selectedChecks.includes("duplicates")) {
            checkPromises.duplicates = detectDuplicates(questions, previousAnalysis?.duplicates?.pairs || []);
        }
        if (selectedChecks.includes("grading")) {
            checkPromises.grading = checkEvaluationSmoothness(questions, previousAnalysis?.grading?.issues || []);
        }
        if (selectedChecks.includes("difficulty")) {
            checkPromises.difficulty = checkDifficultyDistribution(questions);
        }
        // Run Bloom's FIRST if both blooms and time are selected (time depends on blooms)
        let bloomsResult = null;
        const checksResult = {};
        if (selectedChecks.includes("blooms")) {
            console.log('[QuickPass] Running Bloom\'s taxonomy first (needed for time estimation)...');
            bloomsResult = await checkBloomsTaxonomy(questions, previousAnalysis?.blooms?.warnings || []);
            checksResult.blooms = bloomsResult;

            // Update questions with classification if available
            if (bloomsResult?.questionsClassified) {
                questions = bloomsResult.questionsClassified;
            }
        }

        // Now run time with Bloom's data if available
        if (selectedChecks.includes("time")) {
            checkPromises.time = checkTimeFeasibility(questions, body.examDuration, bloomsResult);
        }

        // Run selected checks in parallel
        const checkKeys = Object.keys(checkPromises);
        const results = await Promise.all(Object.values(checkPromises));

        // Map results back to keys (won't overwrite pre-computed blooms)
        checkKeys.forEach((key, idx) => {
            checksResult[key] = results[idx];
        });

        // If Bloom's was analyzed and questions were classified, update the questions array
        if (checksResult.blooms?.questionsClassified) {
            questions = checksResult.blooms.questionsClassified;

            // Save updated questions with Bloom's levels back to database
            await supabase
                .from("papers")
                .update({
                    paper_data: {
                        ...body.paper_data,
                        questions
                    }
                })
                .eq("id", id);
        }

        // Build intelligence object with new naming
        const intelligence = {
            quickpass: {
                analyzed_at: new Date().toISOString(),
                checks_run: selectedChecks,

                // Results with new simple names
                typos: checksResult.typos || null,
                readability: checksResult.readability || null,
                unclear: checksResult.unclear || null,
                or_balance: checksResult.or_balance || null,
                marks: checksResult.marks || null,
                duplicates: checksResult.duplicates || null,
                grading: checksResult.grading || null,
                difficulty: checksResult.difficulty ? {
                    classification: checksResult.difficulty.classification,
                    distribution: checksResult.difficulty.distribution,
                    marksByDifficulty: checksResult.difficulty.marksByDifficulty,
                    percentageByDifficulty: checksResult.difficulty.percentageByDifficulty,
                    progression: checksResult.difficulty.progression,
                    warnings: checksResult.difficulty.warnings,
                    safe: checksResult.difficulty.safe
                } : null,
                time: checksResult.time ? {
                    timeEstimates: checksResult.time.timeEstimates,
                    totalEstimatedTime: checksResult.time.totalEstimatedTime,
                    examDuration: checksResult.time.examDuration,
                    bufferTime: checksResult.time.bufferTime,
                    warnings: checksResult.time.warnings,
                    safe: checksResult.time.safe
                } : null,
                blooms: checksResult.blooms ? {
                    distribution: checksResult.blooms.distribution,
                    marksByLevel: checksResult.blooms.marksByLevel,
                    percentageByLevel: checksResult.blooms.percentageByLevel,
                    avgCognitiveLevel: checksResult.blooms.avgCognitiveLevel,
                    questionsClassified: checksResult.blooms.questionsClassified,
                    warnings: checksResult.blooms.warnings,
                    safe: checksResult.blooms.safe
                } : null,

                // Legacy compatibility mapping
                spelling: checksResult.typos || null,
                clarity: checksResult.readability || null,
                ambiguity: checksResult.unclear || null,
                or_conflicts: checksResult.or_balance || null,
                marks_effort: checksResult.marks || null,
                evaluation_smoothness: checksResult.grading || null,

                // Grouped moderation object
                moderation: {
                    or_conflicts: checksResult.or_balance || null,
                    marks_effort: checksResult.marks || null,
                    duplicates: checksResult.duplicates || null,
                    evaluation_smoothness: checksResult.grading || null,
                },

                samples_generated: false,
                overall_safe: determineOverallSafety({
                    ambiguity: checksResult.unclear,
                    or_conflicts: checksResult.or_balance,
                    marks_effort: checksResult.marks,
                    duplicates: checksResult.duplicates,
                    evaluation_smoothness: checksResult.grading,
                }),
            },
        };

        // Save to database
        const { error: updateError } = await supabase
            .from("papers")
            .update({ intelligence, mode: "quickpass" })
            .eq("id", id);

        if (updateError) {
            console.error("Failed to save intelligence:", updateError);
            return NextResponse.json(
                { success: false, error: "Failed to save analysis" },
                { status: 500 }
            );
        }

        console.log("[QuickPass] Analysis complete");

        return NextResponse.json({
            success: true,
            intelligence,
            checks_run: selectedChecks,
            total_warnings: countWarnings(intelligence),
            critical_issues: countCritical(intelligence),
        });
    } catch (err) {
        console.error("QuickPass analysis error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
