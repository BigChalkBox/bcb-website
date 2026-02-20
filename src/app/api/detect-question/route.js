import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

export const runtime = "nodejs";

/**
 * API to detect question number OR objective answers page from a cropped image
 * POST /api/detect-question
 * Body: { image: base64-encoded PNG }
 * Returns: { 
 *   success: true, 
 *   page_type: "objective" | "subjective",
 *   question_no: "1" | null (only for subjective pages)
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
You are a precise OCR assistant. The image shows the top section of an exam answer sheet.

Your tasks:
1. First, check if the header contains "OBJECTIVE ANSWERS" or "Objective Answers" or similar text indicating this is a dedicated page for objective question answers.
2. If it's an objective answers page, return page_type as "objective".
3. If it's a regular answer page, detect the number written next to "Q. No" (or "Question Number").

Return valid JSON:
{
  "page_type": "objective" | "subjective",
  "question_no": <number or null if unclear or if page_type is "objective">
}

Examples:
- Header says "OBJECTIVE ANSWERS" → { "page_type": "objective", "question_no": null }
- Header shows "Q. No: 3" → { "page_type": "subjective", "question_no": "3" }
- Regular answer page without clear question number → { "page_type": "subjective", "question_no": null }`;

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

        let page_type = "subjective";
        let question_no = null;

        try {
            let cleanJson = rawText;
            if (cleanJson.startsWith("```json")) cleanJson = cleanJson.slice(7);
            if (cleanJson.startsWith("```")) cleanJson = cleanJson.slice(3);
            if (cleanJson.endsWith("```")) cleanJson = cleanJson.slice(0, -3);
            cleanJson = cleanJson.trim();
            const parsed = JSON.parse(cleanJson);

            page_type = parsed?.page_type || "subjective";
            question_no = parsed?.question_no || null;

            // Normalize page_type
            if (page_type !== "objective") {
                page_type = "subjective";
            }
        } catch {
            // Fallback: check for "objective" keyword in raw response
            if (rawText.toLowerCase().includes("objective")) {
                page_type = "objective";
            } else {
                // Try to extract question number
                const match = rawText.match(/\d+/);
                question_no = match ? match[0] : null;
            }
        }

        return NextResponse.json({ success: true, page_type, question_no });
    } catch (err) {
        console.error("❌ Question detection error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
