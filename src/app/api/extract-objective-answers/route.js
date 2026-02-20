import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

export const runtime = "nodejs";

/**
 * Extract objective answers from a dedicated objective answers page
 * POST /api/extract-objective-answers
 * Body: { image: base64-encoded image of the objective answers page }
 * Returns: { 
 *   success: true, 
 *   answers: { "1": "A", "2": "C", "3": "True", ... } 
 * }
 */
export async function POST(req) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json(
                { success: false, error: "Missing image data" },
                { status: 400 }
            );
        }

        // Remove data URL prefix if present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

        const prompt = `
You are a precise OCR assistant. This image shows a student's objective answers page from an exam.
The page contains a vertical list of question labels with answer lines where students have written their answers.
Each entry has a question label (like Q1, Q2, or Q1a, Q1b for sub-questions) and the student's answer.

Your task: Extract ALL visible answers and return them as a JSON object.

Return valid JSON in this format:
{
  "answers": {
    "1": "A",
    "1a": "B",
    "1b": "True", 
    "2": "C",
    "3a": "42",
    "3b": "Newton",
    ...
  }
}

Rules:
- The keys are question labels as strings (e.g., "1", "2", "1a", "1b", "2a")
- Keep the label exactly as shown (preserve letters for sub-questions)
- The values are the student's answers
- For MCQ answers, extract just the letter (A, B, C, D)
- For True/False, extract "True" or "False"
- For fill-in-the-blank or short answers, extract the written text
- If an answer line is empty or unclear, use null
- If the answer is crossed out or changed, use the final visible answer
- Extract answers in order as they appear on the page

If no answers are visible, return: { "answers": {} }`;

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        { inlineData: { mimeType: "image/png", data: base64Data } },
                        { text: prompt },
                    ],
                },
            ],
        });

        let rawText = response.text ? response.text.trim() : "";
        if (!rawText && response.candidates?.length) {
            rawText = response.candidates[0]?.content?.parts?.[0]?.text?.trim() || "";
        }

        let answers = {};

        try {
            let cleanJson = rawText;
            if (cleanJson.startsWith("```json")) cleanJson = cleanJson.slice(7);
            if (cleanJson.startsWith("```")) cleanJson = cleanJson.slice(3);
            if (cleanJson.endsWith("```")) cleanJson = cleanJson.slice(0, -3);
            cleanJson = cleanJson.trim();

            const parsed = JSON.parse(cleanJson);
            answers = parsed?.answers || {};

            // Ensure all keys are strings
            const normalizedAnswers = {};
            for (const [key, value] of Object.entries(answers)) {
                normalizedAnswers[String(key)] = value;
            }
            answers = normalizedAnswers;

        } catch (err) {
            console.warn("Failed to parse objective answers JSON:", err.message);
            console.log("Raw response:", rawText);
        }

        console.log("🔍 Extraction Debug:");
        console.log("Raw Text:", rawText?.substring(0, 100) + "...");
        console.log("Parsed Keys:", Object.keys(answers));

        console.log(`📝 Extracted ${Object.keys(answers).length} objective answers`);
        return NextResponse.json({ success: true, answers });

    } catch (err) {
        console.error("❌ Objective answer extraction error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
