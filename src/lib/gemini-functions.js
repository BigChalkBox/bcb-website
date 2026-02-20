
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

export async function detectQuestionNumber(base64Image) {
    console.log("🔍 [Gemini] detectQuestionNumber called");
    // Remove prefix if present
    const cleanData = base64Image.replace(/^data:image\/\w+;base64,/, "");
    console.log(`   📷 Image size: ${cleanData.length} chars (base64)`);

    const prompt = `
You are a precise OCR assistant. The image shows the top section of an exam answer sheet.

Your tasks:
1. First, check if the header contains "OBJECTIVE ANSWERS" or "Objective Answers" or similar text.
2. If it's an objective page, return page_type as "objective".
3. If it's a regular answer page, detect the number written next to "Q. No" (or "Question Number").

Return valid JSON:
{
  "page_type": "objective" | "subjective",
  "question_no": <number or null>
}
`;

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{
                role: "user",
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: cleanData } },
                    { text: prompt },
                ]
            }],
            config: { responseMimeType: "application/json" }
        });

        const text = response.text;
        console.log(`   ✅ Detection result: ${text}`);
        return JSON.parse(text);
    } catch (e) {
        console.error("   ❌ Gemini Detect Error:", e.message);
        return { page_type: "subjective", question_no: null };
    }
}

export async function extractHandwrittenText(base64Image) {
    console.log("✍️  [Gemini] extractHandwrittenText called");
    const cleanData = base64Image.replace(/^data:image\/\w+;base64,/, "");
    console.log(`   📷 Image size: ${cleanData.length} chars (base64)`);
    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{
                role: "user",
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: cleanData } },
                    { text: "Transcribe the handwritten text in this image exactly. Return ONLY text." },
                ]
            }]
        });
        const text = (response.text || "").trim();
        console.log(`   ✅ Extracted ${text.length} chars`);
        return text;
    } catch (e) {
        console.error("   ❌ Gemini OCR Error:", e.message);
        return "";
    }
}

export async function extractObjectiveAnswers(base64Image) {
    console.log("📝 [Gemini] extractObjectiveAnswers called");
    const cleanData = base64Image.replace(/^data:image\/\w+;base64,/, "");
    console.log(`   📷 Image size: ${cleanData.length} chars (base64)`);
    const prompt = `
    Extract ALL visible objective answers from this student page.
    Return JSON: { "answers": { "1": "A", "2": "C" } }
    If no answers, return { "answers": {} }
    `;

    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{
                role: "user",
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: cleanData } },
                    { text: prompt },
                ]
            }],
            config: { responseMimeType: "application/json" }
        });
        const json = JSON.parse(response.text);
        const answerCount = Object.keys(json.answers || {}).length;
        console.log(`   ✅ Extracted ${answerCount} objective answers`);
        return json.answers || {};
    } catch (e) {
        console.error("   ❌ Gemini Objective Error:", e.message);
        return {};
    }
}
