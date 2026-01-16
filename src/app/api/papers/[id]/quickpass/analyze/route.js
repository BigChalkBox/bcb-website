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
 * Analyze questions for ambiguity
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
 * Determine overall safety
 */
function determineOverallSafety(analysis) {
    const { ambiguity, or_conflicts, marks_effort, duplicates, evaluation_smoothness } = analysis;

    // Critical: high severity ambiguity
    const hasHighAmbiguity = ambiguity.flags.some((f) => f.severity === "high");
    if (hasHighAmbiguity) return false;

    // Critical: OR conflicts
    if (!or_conflicts.safe) return false;

    // Critical: evaluation smoothness issues
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
        qp.ambiguity.flags.length +
        qp.or_conflicts.issues.length +
        qp.marks_effort.warnings.length +
        qp.duplicates.pairs.length +
        (qp.evaluation_smoothness?.issues?.length || 0)
    );
}

/**
 * Count critical issues
 */
function countCritical(intelligence) {
    const qp = intelligence.quickpass;
    const highAmbiguity = qp.ambiguity.flags.filter(
        (f) => f.severity === "high"
    ).length;
    const orIssues = qp.or_conflicts.issues.length;
    return highAmbiguity + orIssues;
}

/**
 * POST /api/papers/[id]/quickpass/analyze
 */
export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Allow questions to be passed in the request body (for Step 1 before finalization)
        let questions = body.questions;

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

        console.log(`[QuickPass] Analyzing ${questions.length} questions...${previousAnalysis ? ' (with previous context)' : ''}`);

        // Run all checks in parallel, passing previous results for consistency
        const [ambiguity, orConflicts, marksEffort, duplicates, evaluationSmoothness] =
            await Promise.all([
                analyzeAmbiguity(questions, previousAnalysis?.ambiguity?.flags || []),
                validateOrQuestions(questions, previousAnalysis?.or_conflicts?.issues || []),
                checkMarksEffort(questions, previousAnalysis?.marks_effort?.warnings || []),
                detectDuplicates(questions, previousAnalysis?.duplicates?.pairs || []),
                checkEvaluationSmoothness(questions, previousAnalysis?.evaluation_smoothness?.issues || []),
            ]);

        const intelligence = {
            quickpass: {
                analyzed_at: new Date().toISOString(),
                ambiguity,
                or_conflicts: orConflicts,
                marks_effort: marksEffort,
                duplicates,
                evaluation_smoothness: evaluationSmoothness,
                samples_generated: false, // Will be updated when samples are generated
                overall_safe: determineOverallSafety({
                    ambiguity,
                    or_conflicts: orConflicts,
                    marks_effort: marksEffort,
                    duplicates,
                    evaluation_smoothness: evaluationSmoothness,
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
