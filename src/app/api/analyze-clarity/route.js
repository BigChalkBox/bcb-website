// src/app/api/analyze-clarity/route.js
import { NextResponse } from "next/server";
import { generateContentWithFallback, extractTextFromResponse, cleanLLMOutput } from "@/lib/gemini";

/**
 * POST /api/analyze-clarity
 * Analyzes question clarity based on the sample answer(s) and marks
 * 
 * Body: {
 *   question: string,
 *   marks: number,
 *   samples: [{ answer: string, answerImages?: string[] }]
 * }
 * 
 * Returns: {
 *   isUnambiguous: boolean,
 *   suggestedQuestion: string,
 *   issues: string[],
 *   reasoning: string
 * }
 */
export async function POST(req) {
    try {
        const body = await req.json();
        const { question, marks, samples = [] } = body;

        if (!question?.trim()) {
            return NextResponse.json(
                { success: false, error: "Question text is required" },
                { status: 400 }
            );
        }

        if (!samples.length || !samples.some(s => s.answer?.trim())) {
            return NextResponse.json(
                { success: false, error: "At least one sample answer is required" },
                { status: 400 }
            );
        }

        // Build the sample answers text
        const samplesText = samples
            .filter(s => s.answer?.trim())
            .map((s, i) => `Sample Answer ${i + 1}:\n${s.answer}`)
            .join("\n\n");

        // Build the prompt for clarity analysis
        const prompt = `You are an expert exam question reviewer. Your task is to analyze a question and its sample answer(s) to determine if the question is clear, unambiguous, and complete.

QUESTION TO ANALYZE:
"${question}"

MARKS ALLOCATED: ${marks}

SAMPLE ANSWER(S):
${samplesText}

ANALYSIS TASK:
1. Read the question and sample answer(s) carefully
2. Determine if the question is clear and unambiguous
3. Check if a student could reasonably interpret the question differently and give a valid but different answer
4. Check if the question mentions everything needed to arrive at the sample answer
5. Check if the marks allocated match the expected depth of the answer

Return ONLY a JSON object with NO markdown fences, NO code blocks, NO extra text. Just the raw JSON:

{
  "isUnambiguous": true or false,
  "suggestedQuestion": "improved question text if issues found, or the original question if it's fine",
  "issues": ["list of specific issues found, each as a string"],
  "reasoning": "brief explanation of your analysis"
}

IMPORTANT:
- If the question is clear and complete, set isUnambiguous to true and return the original question as suggestedQuestion with empty issues array
- If there are problems, suggest a specific improved version of the question that addresses all issues
- Be specific in the issues - mention exactly what's missing or ambiguous
- The suggested question should be a drop-in replacement, not just advice`;

        // Use fallback-enabled generation
        const contents = [
            {
                role: "user",
                parts: [{ text: prompt }],
            },
        ];

        const { response, model } = await generateContentWithFallback({
            contents,
            preferredModel: "gemini-2.5-flash",
            maxRetries: 2,
            baseDelay: 1000,
        });

        // Extract text from response
        const rawText = extractTextFromResponse(response);
        console.log(`Clarity Analysis RAW OUTPUT (model: ${model}):`, rawText);

        console.log("Clarity Analysis RAW OUTPUT:", rawText);

        // Parse the JSON response
        let result;
        try {
            // Clean common LLM artifacts
            const cleaned = rawText
                .replace(/```json|```/g, "")
                .replace(/^\s*\n/gm, "")
                .trim();
            result = JSON.parse(cleaned);
        } catch (parseError) {
            console.error("Failed to parse clarity analysis:", parseError);
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to parse analysis result",
                    raw: rawText
                },
                { status: 500 }
            );
        }

        // Validate the result structure
        const analysis = {
            isUnambiguous: Boolean(result.isUnambiguous),
            suggestedQuestion: result.suggestedQuestion || question,
            issues: Array.isArray(result.issues) ? result.issues : [],
            reasoning: result.reasoning || ""
        };

        return NextResponse.json({
            success: true,
            analysis
        });

    } catch (err) {
        console.error("Clarity analysis error:", err);
        return NextResponse.json(
            { success: false, error: "Analysis failed", details: String(err) },
            { status: 500 }
        );
    }
}
