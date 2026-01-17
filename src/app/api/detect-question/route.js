import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

export const runtime = "nodejs";

/**
 * Simple API to detect question number from a cropped image
 * POST /api/detect-question
 * Body: { image: base64-encoded PNG }
 * Returns: { success: true, question_no: "1" | null }
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
Your job: detect the number written next to "Q. No" (or "Question Number").
Return valid JSON:
{ "question_no": "<number or null if unclear>" }`;

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

        let question_no = null;
        try {
            let cleanJson = rawText;
            if (cleanJson.startsWith("```json")) cleanJson = cleanJson.slice(7);
            if (cleanJson.startsWith("```")) cleanJson = cleanJson.slice(3);
            if (cleanJson.endsWith("```")) cleanJson = cleanJson.slice(0, -3);
            cleanJson = cleanJson.trim();
            const parsed = JSON.parse(cleanJson);
            question_no = parsed?.question_no || null;
        } catch {
            const match = rawText.match(/\d+/);
            question_no = match ? match[0] : null;
        }

        return NextResponse.json({ success: true, question_no });
    } catch (err) {
        console.error("❌ Question detection error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
