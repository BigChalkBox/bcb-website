// // app/api/extract/route.js
// import { NextResponse } from "next/server";
// import { GoogleGenAI } from "@google/genai";

// export async function POST(req) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file");

//     if (!file) {
//       return NextResponse.json(
//         { success: false, error: "No file uploaded" },
//         { status: 400 }
//       );
//     }

//     // Read uploaded file
//     const buffer = Buffer.from(await file.arrayBuffer());
//     const base64Pdf = buffer.toString("base64");

//     // Init Gemini
//     const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//     const prompt = `


// You are tasked with reviewing a set of questions intended for a university-level examination. Please carefully evaluate each question and provide feedback according to the following criteria:

// Appropriateness of Level: Check whether the question is genuinely suitable for a university examination. If it seems too easy, too vague, or not rigorous enough for that level, flag it and explain why. if not , just leave it, no fluff. we are not looking for a verbose response.

// analyse question in terms of ambiguity leading to multiple ways to solve it . instructor on the other hand might be trying to test a particular method as per the course objective . If you see such a scenario , mention that otherwise simply say , this looks ok .

// Return ONLY a JSON array with structure:

// if it is something related to maths then give latex in text rather than normal text.


// [{ "text": "...", "marks": 10, "suggestions": "..." }]



//     `;

//     // Call Gemini
//     const result = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: [
//         { text: prompt },
//         {
//           inlineData: {
//             mimeType: "application/pdf",
//             data: base64Pdf,
//           },
//         },
//       ],
//     });

//     // ✅ Extract raw LLM text
//     const text =
//       result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

//     console.log("Raw LLM output:", text);

//     // ✅ Try parsing JSON
//     let questions = [];
//     try {
//       const cleaned = text.replace(/```json|```/g, "").trim();
//       questions = JSON.parse(cleaned);
//     } catch (err) {
//       console.error("❌ JSON parse failed:", err.message);
//       questions = [
//         { text: "Parsing failed", marks: 0, suggestions: text },
//       ];
//     }

//     return NextResponse.json({ success: true, questions });
//   } catch (err) {
//     console.error("Error in /api/extract:", err);
//     return NextResponse.json(
//       { success: false, error: err.message },
//       { status: 500 }
//     );
//   }
// }



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

    //     const prompt = `

    // You are tasked with reviewing a set of questions intended for a university-level examination. Please carefully evaluate each question and provide feedback according to the following criteria:

    // Appropriateness of Level: Check whether the question is genuinely suitable for a university examination. If it seems too easy, too vague, or not rigorous enough for that level, flag it and explain why. if not , just leave it, no fluff. we are not looking for a verbose response.

    // analyse question in terms of ambiguity leading to multiple ways to solve it . instructor on the other hand might be trying to test a particular method as per the course objective . If you see such a scenario , mention that otherwise simply say , this looks ok .

    // Return ONLY a JSON array with structure:

    // if it is something related to maths then give latex in text rather than normal text.

    // [{ "text": "...", "marks": 10, "suggestions": "..." }]

    //     `;


    const prompt = `
Extract all questions from this exam paper PDF.

For each question, extract:
- text: The complete question text (use LaTeX notation for math: $x^2$, \\frac{a}{b}, etc.)  
- marks: The marks/points allocated for this question

Return ONLY a JSON array:
[{ "text": "...", "marks": 10 }]

Rules:
- Keep original LaTeX formatting if present
- Extract exact question number text without modification
- If marks are not clearly specified, use 0
- Do not add suggestions or analysis (handled separately by QuickPass)
- Ensure valid JSON output
- If you encounter a question with OR part extract both of them as separate questions.
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
      questions = [{ text: "Parsing failed - please try again", marks: 0 }];
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
