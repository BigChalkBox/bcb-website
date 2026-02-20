
import { generateContentWithFallback, extractTextFromResponse } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { image, submissionId } = await req.json();

        if (!image) {
            return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
        }

        // Prepare parts for Gemini
        const parts = [
            {
                text: "Please transcribe the handwritten text in this image exactly as it appears. Return ONLY the transcribed text. If the image contains no text or is unreadable, return an empty string. Do not add any conversational filler."
            },
            {
                inlineData: {
                    data: image.split(",")[1] || image, // Handle both data URI and raw base64
                    mimeType: "image/jpeg"
                }
            }
        ];

        console.log(`[EXTRACT_HANDWRITTEN] processing for submission ${submissionId || 'unknown'}`);

        const { response } = await generateContentWithFallback({
            contents: [{ role: "user", parts }],
            preferredModel: "gemini-2.5-flash", // Fast and good vision capabilities
            maxRetries: 2,
        });

        const text = extractTextFromResponse(response).trim();
        console.log(`[EXTRACT_HANDWRITTEN] Result length: ${text.length}`);

        return NextResponse.json({ success: true, text });

    } catch (error) {
        console.error("[EXTRACT_HANDWRITTEN_ERROR]", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
