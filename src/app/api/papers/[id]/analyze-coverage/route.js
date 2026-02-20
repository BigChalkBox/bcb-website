// src/app/api/papers/[id]/analyze-coverage/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Map questions to curriculum topics using AI
 */
async function mapQuestionsToTopics(questions, curriculum) {
    const topicsFlat = [];

    // Safety check for curriculum structure
    if (!curriculum?.units || !Array.isArray(curriculum.units)) {
        console.error("[Coverage] Invalid curriculum structure - no units array");
        console.log("[Coverage] Curriculum structure:", JSON.stringify(curriculum).substring(0, 500));
        return { mappings: [], error: "Invalid curriculum structure" };
    }

    curriculum.units.forEach(unit => {
        if (!unit?.topics || !Array.isArray(unit.topics)) {
            console.warn(`[Coverage] Unit "${unit?.name}" has no topics array`);
            return;
        }
        unit.topics.forEach(topic => {
            topicsFlat.push({
                id: topic.id,
                name: topic.name,
                unit: unit.name,
            });
        });
    });

    console.log(`[Coverage] Flattened ${topicsFlat.length} topics for mapping`);

    if (topicsFlat.length === 0) {
        console.error("[Coverage] No topics found in curriculum to map against");
        return { mappings: [], error: "No topics in curriculum" };
    }

    const prompt = `You are analyzing exam questions against a course syllabus.

SYLLABUS TOPICS:
${topicsFlat.map(t => `- ${t.id}: ${t.name} (${t.unit})`).join('\n')}

QUESTIONS:
${questions.map((q, i) => `Q${i + 1} (${q.marks} marks): ${q.text?.substring(0, 300)}`).join('\n\n')}

For each question, identify which topic(s) it tests. Return ONLY valid JSON:
{
  "mappings": [
    {
      "question_index": 0,
      "mapped_topics": ["${topicsFlat[0]?.id || 'topic-id'}"],
      "confidence": 0.85,
      "reasoning": "Brief explanation"
    }
  ]
}

Rules:
- Map each question to 1-3 most relevant topics
- Use the EXACT topic IDs from the list above (e.g., "${topicsFlat[0]?.id || 'u1-t1'}")
- Confidence 0.0-1.0 based on how well the question tests the topic
- If a question doesn't match any topic, use empty array for mapped_topics
- IMPORTANT: Return mappings for ALL ${questions.length} questions`;

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0 },
        });

        let rawText = response.text?.trim() ||
            response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        console.log("[Coverage] Raw AI response length:", rawText.length);

        // Extract JSON from markdown code blocks if present
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            rawText = jsonMatch[1].trim();
        }

        const parsed = JSON.parse(rawText);

        console.log(`[Coverage] Parsed ${parsed.mappings?.length || 0} mappings from AI`);

        return parsed;
    } catch (err) {
        console.error("Mapping error:", err);
        console.error("Raw response that failed to parse:", err.message);
        return { mappings: [], error: err.message };
    }
}

/**
 * Analyze questions using Bloom's Taxonomy
 */
async function analyzeBloomsTaxonomy(questions) {
    const prompt = `Analyze these exam questions according to Bloom's Taxonomy cognitive levels.

BLOOM'S LEVELS (from lowest to highest):
1. Remember - Recall facts, terms, basic concepts (keywords: define, list, name, recall)
2. Understand - Explain ideas or concepts (keywords: describe, explain, summarize)
3. Apply - Use information in new situations (keywords: calculate, solve, demonstrate)
4. Analyze - Draw connections, examine parts (keywords: compare, contrast, examine)
5. Evaluate - Justify a decision, critique (keywords: assess, argue, critique, judge)
6. Create - Produce new or original work (keywords: design, construct, develop)

QUESTIONS:
${questions.map((q, i) => `Q${i + 1} (${q.marks} marks): ${q.text?.substring(0, 400)}`).join('\n\n')}

Classify each question. Return ONLY valid JSON:
{
  "questions": [
    {
      "index": 0,
      "level": "Apply",
      "reasoning": "Question asks to calculate/solve..."
    }
  ],
  "distribution": {
    "Remember": 0,
    "Understand": 2,
    "Apply": 3,
    "Analyze": 1,
    "Evaluate": 0,
    "Create": 0
  },
  "insights": {
    "quality": "Good/Average/Poor",
    "summary": "Overall assessment of paper quality",
    "suggestions": ["Suggestion 1", "Suggestion 2"]
  }
}

Be critical and accurate. A well-balanced paper should have questions across multiple cognitive levels.`;

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0 },
        });

        let rawText = response.text?.trim() ||
            response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        // Extract JSON from markdown code blocks if present
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            rawText = jsonMatch[1].trim();
        }

        return JSON.parse(rawText);
    } catch (err) {
        console.error("Bloom's analysis error:", err);
        return {
            questions: [],
            distribution: {},
            insights: { quality: "Unknown", summary: "Analysis failed", suggestions: [] },
            error: err.message
        };
    }
}

/**
 * Calculate coverage percentages with advanced analytics including CO-level
 */
function calculateCoverage(questions, curriculum, mappings) {
    // Total paper marks
    const totalPaperMarks = questions.reduce((sum, q) => sum + (parseInt(q.marks) || 0), 0);

    // Initialize topic coverage
    const topicCoverage = {};
    let totalSyllabusWeight = 0;

    curriculum.units.forEach(unit => {
        unit.topics.forEach(topic => {
            topicCoverage[topic.id] = {
                id: topic.id,
                name: topic.name,
                unit: unit.name,
                unitId: unit.id,
                expectedWeight: topic.weight || 0,
                coveredMarks: 0,
                questions: [],
            };
            totalSyllabusWeight += topic.weight || 0;
        });
    });

    // Add marks from mapped questions
    mappings.mappings?.forEach(m => {
        const question = questions[m.question_index];
        if (!question) return;

        const marksPerTopic = (parseInt(question.marks) || 0) / (m.mapped_topics?.length || 1);

        m.mapped_topics?.forEach(topicId => {
            if (topicCoverage[topicId]) {
                // Use 100% of marks (no confidence weighting) for deterministic calculation
                topicCoverage[topicId].coveredMarks += marksPerTopic;
                topicCoverage[topicId].questions.push({
                    index: m.question_index + 1,
                    text: question.text?.substring(0, 80) + (question.text?.length > 80 ? '...' : ''),
                    marks: question.marks,
                    confidence: m.confidence,
                });
            }
        });
    });

    // Calculate unit-level coverage with weightage analysis
    const unitAnalysis = curriculum.units.map(unit => {
        const unitTopics = unit.topics.map(t => topicCoverage[t.id]);
        const unitExpectedWeight = unit.weight || unitTopics.reduce((sum, t) => sum + t.expectedWeight, 0);

        // Calculate actual marks allocated to this unit
        const unitActualMarks = unitTopics.reduce((sum, t) => sum + t.coveredMarks, 0);
        const unitActualPercent = totalPaperMarks > 0 ? Math.min(100, Math.round((unitActualMarks / totalPaperMarks) * 100)) : 0;

        // Expected percentage based on syllabus weight
        const unitExpectedPercent = totalSyllabusWeight > 0 ? Math.round((unitExpectedWeight / totalSyllabusWeight) * 100) : 0;

        // Deviation (positive = over-represented, negative = under-represented)
        const deviation = unitActualPercent - unitExpectedPercent;

        // Topic-level details with status
        const topicDetails = unitTopics.map(t => {
            const topicExpectedPercent = totalSyllabusWeight > 0 ? Math.round((t.expectedWeight / totalSyllabusWeight) * 100) : 0;
            const topicActualPercent = totalPaperMarks > 0 ? Math.min(100, Math.round((t.coveredMarks / totalPaperMarks) * 100)) : 0;

            // Status based on whether topic has any questions mapped
            let status = 'missing'; // ❌
            if (t.questions.length > 0) {
                status = t.coveredMarks >= 5 ? 'covered' : 'partial'; // ✅ or ⚠️
            }

            return {
                ...t,
                expectedPercent: topicExpectedPercent,
                actualPercent: topicActualPercent,
                status,
            };
        });

        // Coverage = percentage of topics in this unit that have questions
        const topicsWithQuestions = topicDetails.filter(t => t.questions.length > 0).length;
        const coverage = unitTopics.length > 0 ? Math.round((topicsWithQuestions / unitTopics.length) * 100) : 0;

        return {
            id: unit.id,
            name: unit.name,
            mappedCOs: unit.mappedCOs || [],
            expectedPercent: unitExpectedPercent,
            actualPercent: unitActualPercent,
            deviation,
            coverage,
            topics: topicDetails,
        };
    });

    // ========== CO-LEVEL ANALYSIS ==========
    // Only run CO analysis if explicitly enabled in curriculum
    const coMappingEnabled = curriculum.coMappingEnabled === true;
    const courseOutcomes = curriculum.courseOutcomes || [];

    let coAnalysis = null;

    if (coMappingEnabled && courseOutcomes.length > 0) {
        console.log("[Coverage] CO mapping enabled, running CO analysis...");

        // Check if any units have mappedCOs
        const hasExplicitMappings = unitAnalysis.some(u => u.mappedCOs && u.mappedCOs.length > 0);

        // If no explicit mappings and CO mapping is enabled but no mappings set, skip
        if (!hasExplicitMappings) {
            console.log("[Coverage] CO mapping enabled but no unit mappings found, skipping CO analysis");
        } else {
            // Calculate CO analysis using explicit mappings only (no auto-mapping)
            coAnalysis = courseOutcomes.map(co => {
                // Find all units mapped to this CO
                const mappedUnits = unitAnalysis.filter(u =>
                    u.mappedCOs?.includes(co.id) || u.mappedCOs?.includes(co.code)
                );

                if (mappedUnits.length === 0) {
                    return {
                        id: co.id,
                        code: co.code,
                        description: co.description,
                        coverage: 0,
                        actualPercent: 0,
                        expectedPercent: 0,
                        mappedUnits: [],
                        status: 'not_mapped',
                    };
                }

                // Calculate CO coverage from mapped units
                const totalUnitWeight = mappedUnits.reduce((sum, u) => sum + u.expectedPercent, 0);

                let coCoverage;
                if (totalUnitWeight > 0) {
                    coCoverage = Math.round(mappedUnits.reduce((sum, u) => sum + (u.coverage * u.expectedPercent), 0) / totalUnitWeight);
                } else {
                    coCoverage = Math.round(mappedUnits.reduce((sum, u) => sum + u.coverage, 0) / mappedUnits.length);
                }

                const coActualPercent = mappedUnits.reduce((sum, u) => sum + u.actualPercent, 0);
                const coExpectedPercent = totalUnitWeight > 0 ? totalUnitWeight : Math.round(100 / (curriculum.units?.length || 1) * mappedUnits.length);

                let status = 'missing';
                if (coCoverage >= 70) status = 'covered';
                else if (coCoverage >= 30) status = 'partial';

                return {
                    id: co.id,
                    code: co.code,
                    description: co.description,
                    coverage: coCoverage,
                    actualPercent: coActualPercent,
                    expectedPercent: coExpectedPercent,
                    mappedUnits: mappedUnits.map(u => ({ id: u.id, name: u.name, coverage: u.coverage })),
                    status,
                };
            });
        }
    } else {
        console.log("[Coverage] CO mapping not enabled, skipping CO analysis");
    }

    // Overall coverage = percentage of all topics that have at least one question
    const allTopics = Object.values(topicCoverage);
    const topicsWithQuestions = allTopics.filter(t => t.questions.length > 0).length;
    const overallCoverage = allTopics.length > 0 ? Math.round((topicsWithQuestions / allTopics.length) * 100) : 0;

    // Uncovered topics
    const uncoveredTopics = Object.values(topicCoverage)
        .filter(t => t.coveredMarks === 0)
        .map(t => ({ id: t.id, name: t.name, unit: t.unit, weight: t.expectedWeight }));

    // Generate actionable recommendations
    const recommendations = generateRecommendations(unitAnalysis, uncoveredTopics, totalPaperMarks);

    return {
        overall: overallCoverage,
        units: unitAnalysis,
        coAnalysis, // Will be null if not enabled
        coMappingEnabled, // Add flag so UI knows
        courseOutcomes,
        uncoveredTopics,
        totalTopics: Object.keys(topicCoverage).length,
        coveredTopics: Object.values(topicCoverage).filter(t => t.coveredMarks > 0).length,
        totalPaperMarks,
        recommendations,
        mappings: mappings.mappings || [],
    };
}


/**
 * Generate actionable recommendations for improving coverage
 */
function generateRecommendations(unitAnalysis, uncoveredTopics, totalPaperMarks) {
    const recommendations = [];

    // Check for significantly under-represented units
    unitAnalysis.forEach(unit => {
        if (unit.deviation <= -15) {
            const marksNeeded = Math.round((Math.abs(unit.deviation) / 100) * totalPaperMarks);
            recommendations.push({
                type: 'under_represented',
                severity: 'warning',
                unit: unit.name,
                message: `${unit.name} is under-represented (${unit.actualPercent}% vs expected ${unit.expectedPercent}%)`,
                suggestion: `Add approximately ${marksNeeded} marks of questions from this unit`,
            });
        }
    });

    // Check for over-represented units
    unitAnalysis.forEach(unit => {
        if (unit.deviation >= 15) {
            recommendations.push({
                type: 'over_represented',
                severity: 'info',
                unit: unit.name,
                message: `${unit.name} is over-represented (${unit.actualPercent}% vs expected ${unit.expectedPercent}%)`,
                suggestion: `Consider reducing questions from this unit or adding to other units`,
            });
        }
    });

    // Critical missing topics
    if (uncoveredTopics.length > 0) {
        const topMissing = uncoveredTopics.slice(0, 3).map(t => t.name).join(', ');
        recommendations.push({
            type: 'missing_topics',
            severity: 'error',
            message: `${uncoveredTopics.length} topics have no questions`,
            suggestion: `Priority topics to add: ${topMissing}`,
        });
    }

    // Perfect coverage
    if (recommendations.length === 0) {
        recommendations.push({
            type: 'balanced',
            severity: 'success',
            message: 'Paper has balanced coverage across the syllabus',
            suggestion: 'Good job! The paper covers topics proportionally',
        });
    }

    return recommendations;
}

/**
 * POST /api/papers/[id]/analyze-coverage
 */
export async function POST(req, { params }) {
    try {
        const { id } = await params;

        // Get questions from request body (for unfinalized papers) or database
        let body = {};
        try {
            body = await req.json();
        } catch (e) {
            // No body provided, will use database questions
        }

        // Get paper
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

        // Get linked curriculum
        if (!paper.curriculum_id) {
            return NextResponse.json(
                { success: false, error: "No curriculum linked to this paper. Add curriculum in Step 0." },
                { status: 400 }
            );
        }

        const { data: curriculum, error: currError } = await supabase
            .from("curricula")
            .select("*")
            .eq("id", paper.curriculum_id)
            .single();

        if (currError || !curriculum) {
            return NextResponse.json(
                { success: false, error: "Curriculum not found" },
                { status: 404 }
            );
        }

        // Use questions from body (local) or database (finalized)
        const questions = body.questions || paper.paper_data?.questions || [];

        if (questions.length === 0) {
            return NextResponse.json(
                { success: false, error: "No questions to analyze" },
                { status: 400 }
            );
        }

        console.log(`[Coverage] Analyzing ${questions.length} questions against curriculum...`);
        console.log(`[Coverage] Curriculum has ${curriculum.structured_topics?.units?.length || 0} units`);

        // Count total topics
        const totalTopics = curriculum.structured_topics?.units?.reduce(
            (sum, u) => sum + (u.topics?.length || 0), 0
        ) || 0;
        console.log(`[Coverage] Total topics in curriculum: ${totalTopics}`);

        // Map questions to topics AND analyze Bloom's taxonomy in parallel
        const [mappings, blooms] = await Promise.all([
            mapQuestionsToTopics(questions, curriculum.structured_topics),
            analyzeBloomsTaxonomy(questions)
        ]);

        // Log mapping results
        console.log(`[Coverage] Mappings received: ${mappings.mappings?.length || 0} question mappings`);
        if (mappings.error) {
            console.error(`[Coverage] Mapping error: ${mappings.error}`);
        }

        // Log a sample mapping for debugging
        if (mappings.mappings?.length > 0) {
            console.log(`[Coverage] Sample mapping:`, JSON.stringify(mappings.mappings[0]));
        }

        // Calculate coverage
        const coverage = calculateCoverage(questions, curriculum.structured_topics, mappings);

        // Store results
        const { error: updateError } = await supabase
            .from("papers")
            .update({ coverage_analysis: { ...coverage, blooms } })
            .eq("id", id);

        if (updateError) {
            console.error("Failed to save coverage:", updateError);
        }

        console.log(`[Coverage] Analysis complete: ${coverage.overall}% overall (${coverage.coveredTopics}/${coverage.totalTopics} topics), Bloom's quality: ${blooms.insights?.quality}`);

        return NextResponse.json({
            success: true,
            coverage,
            blooms,
        });
    } catch (err) {
        console.error("Coverage analysis error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/papers/[id]/analyze-coverage
 * Get stored coverage analysis
 */
export async function GET(req, { params }) {
    try {
        const { id } = await params;

        const { data: paper, error } = await supabase
            .from("papers")
            .select("coverage_analysis, curriculum_id")
            .eq("id", id)
            .single();

        if (error || !paper) {
            return NextResponse.json(
                { success: false, error: "Paper not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            coverage: paper.coverage_analysis,
            hasCurriculum: !!paper.curriculum_id,
        });
    } catch (err) {
        console.error("Get coverage error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
