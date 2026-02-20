// app/api/extract/route.js
import { NextResponse } from "next/server";
import { createPartFromUri, GoogleGenAI } from "@google/genai";
import { jsonrepair } from "jsonrepair";

function extractJsonFromMarkdown(md) {
  // Robust extraction of JSON content from markdown code block
  const match = md.match(/``````/i);
  return match ? match[1].trim() : md.trim();
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Read uploaded file as buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create Blob for upload
    const fileBlob = new Blob([buffer], { type: "application/pdf" });

    // Init Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Upload the file
    const uploadedFile = await ai.files.upload({
      file: fileBlob,
      config: {
        displayName: file.name || "uploaded.pdf",
      },
    });

    // Wait for the file to be processed
    let getFile = await ai.files.get({ name: uploadedFile.name });
    while (getFile.state === "PROCESSING") {
      console.log(`Current file status: ${getFile.state}`);
      console.log("File is still processing, retrying in 5 seconds");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      getFile = await ai.files.get({ name: uploadedFile.name });
    }

    if (getFile.state === "FAILED") {
      throw new Error("File processing failed.");
    }

    const prompt = `
Extract all questions from this exam paper PDF.

For each question, extract:
- text: The complete question text (use LaTeX notation for math: $x^2$, \\frac{a}{b}, etc.)
- marks: The marks/points allocated for this question
- type: "objective" or "subjective"
  - objective: MCQ, true/false, fill-in-the-blank, one-word/short answer (1-5 words)
  - subjective: descriptive, essay, derivation, proof, long-form answers
- options: For MCQ questions, extract as array ["A. option1", "B. option2", "C. option3", "D. option4"], else null
- correctAnswer: If the correct answer is visible in the paper (e.g., answer key), extract it (e.g., "A", "True", "42"), else null

Return ONLY a JSON array:
[{ 
  "text": "...", 
  "marks": 10, 
  "type": "objective" | "subjective",
  "options": ["A. ...", "B. ...", ...] | null,
  "correctAnswer": "A" | "True" | "answer text" | null
}]

Rules:
- Keep original LaTeX formatting if present
- Extract exact question number text without modification
- If marks are not clearly specified, use 0
- Do not add suggestions or analysis (handled separately by QuickPass)
- Ensure valid JSON output
- If you encounter a question with OR part extract both of them as separate questions.
- For type classification:
  - If question has options (A/B/C/D) → type: "objective"
  - If question asks for True/False → type: "objective"
  - If question expects a single word, number, or short phrase → type: "objective"
  - If question requires explanation, derivation, steps, or long-form answer → type: "subjective"
`;


    // Prepare content
    const content = [prompt];

    if (getFile.uri && getFile.mimeType) {
      const fileContent = createPartFromUri(getFile.uri, getFile.mimeType);
      content.push(fileContent);
    }

    // Call Gemini
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: content,
    });

    // ✅ Extract raw LLM text
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    console.log("Raw LLM output:", text);

    // ✅ Try parsing JSON robustly
    let questions = [];
    try {
      const extracted = extractJsonFromMarkdown(text);
      const repaired = jsonrepair(extracted);
      questions = JSON.parse(repaired);
    } catch (err) {
      console.error("❌ JSON parse failed:", err.message);
      questions = [{ text: "Parsing failed - please try again", marks: 0, type: "subjective", options: null, correctAnswer: null }];
    }

    return NextResponse.json({ success: true, questions });
  } catch (err) {
    console.error("Error in /api/extract:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
