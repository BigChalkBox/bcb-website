// // app/api/generate/route.js
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   const body = await req.json();
//   const {
//     prompt = "",
//     instructions = "",
//     images = [],
//     marks = 0,
//     options = {},
//   } = body;



//   // === Fake answer for now ===
//   const fakeAnswer = `Generated sample answer:\n\nQuestion: "${prompt.slice(0, 120)}..." \nInstructions: ${instructions || "None"} \nMaximum Marks: ${marks}\nAttached Images: ${images.length}\n\nKey points:\n1) Core concept\n2) Explanation\n3) Example / diagram`;

//   return NextResponse.json({
//     success: true,
//     generated: {
//       id: `g-${Date.now()}`,
//       content: fakeAnswer,
//       createdBy: "llm",
//       approved: false,
//       createdAt: new Date().toISOString(),
//     },
//   });
// }



//  // app/api/generate/route.js
// import { NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Helper to parse LLM output robustly
// function parseLLMOutput(raw) {
//   let parsed;

//   try {
//     parsed = JSON.parse(raw);
//   } catch (e) {
//     // Clean common LLM artifacts
//     const cleaned = raw
//       .replace(/```json|```/g, "") // remove markdown fences
//       .replace(/\*\*.*?\*\*/g, "") // remove bold
//       .trim();

//     try {
//       parsed = JSON.parse(cleaned);
//     } catch {
//       // fallback: wrap raw text in answer1
//       parsed = { answer1: cleaned };
//     }
//   }

//   // Normalize keys: if 'way1', 'way2', rename to 'answer1', 'answer2'
//   const keys = Object.keys(parsed);
//   if (keys.some((k) => k.startsWith("way"))) {
//     const newObj = {};
//     keys.forEach((k, idx) => {
//       newObj[`answer${idx + 1}`] = parsed[k];
//     });
//     parsed = newObj;
//   }

//   return parsed;
// }

// export async function POST(req) {
//   const body = await req.json();
//   const {
//     prompt = "",
//     instructions = "",
//     images = [],
//     marks = 0,
//     n = 1,
//   } = body;

//   // Build Gemini prompt
//   let textPrompt = `
// You are an expert examiner.
// Write answer to the question in ${n} way${n > 1 ? "s" : ""}.
// Return ONLY one JSON object.
// Do NOT include explanations, comments, or markdown fences.
// DO NOT WRAP IT IN ANYTHING. JUST TEXT OUTPUT.
// The JSON must follow schema:
// - Keys must be named "answer1", "answer2", ... sequentially.
// - If 1 answer, output only {"answer1": "<string>"}.
// - Do not use any formatting.
// `;

//   textPrompt += `\nQuestion: ${prompt}\n`;
//   textPrompt += `Additional instructions: ${instructions || "None"}\n`;
//   textPrompt += `Maximum marks: ${marks}\n`;

//   // Handle images
//   const imageParts = images
//     .filter((img) => img?.data)
//     .map(({ data, mimeType = "image/jpeg" }) => ({
//       inlineData: {
//         mimeType,
//         data: data.startsWith("data:") ? data.split(",")[1] : data,
//       },
//     }));

//   const contents = [
//     ...(imageParts.length ? [{ parts: imageParts }] : []),
//     { parts: [{ text: textPrompt }] },
//   ];

//   try {
//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

//     // SINGLE call for all answers
//     const result = await model.generateContent({ contents });
//     const raw = result.response.text().trim();

//     console.log("LLM RAW OUTPUT:", raw);

//     const parsed = parseLLMOutput(raw);

//     return NextResponse.json({ success: true, samples: [parsed] });
//   } catch (err) {
//     console.error("generate error:", err);
//     return NextResponse.json(
//       { success: false, error: "LLM generation failed", details: String(err) },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

function parseLLMOutput(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    const cleaned = raw
      .replace(/```json|```/g, "")
      .replace(/\*\*.*?\*\*/g, "")
      .trim();
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { answer1: cleaned };
    }
  }
  const keys = Object.keys(parsed);
  if (keys.some((k) => k.startsWith("way"))) {
    const newObj = {};
    keys.forEach((k, idx) => {
      newObj[`answer${idx + 1}`] = parsed[k];
    });
    parsed = newObj;
  }

  // Clean LaTeX delimiters: fix escaped $ signs from LLM output
  Object.keys(parsed).forEach(key => {
    if (typeof parsed[key] === 'string') {
      parsed[key] = parsed[key]
        .replace(/\\\$/g, '$')  // \$ -> $
        .replace(/\\texttt\{/g, '\\texttt{')  // Ensure proper \texttt
        .replace(/\\\\/g, '\\');  // Extra escaping fix
    }
  });

  return parsed;
}

export async function POST(req) {
  const body = await req.json();
  const {
    prompt = "",
    instructions = "",
    images = [],
    marks = 0,
    n = 1,
  } = body;

  let textPrompt = `You are an expert examiner writing a MODEL ANSWER for university exams. Write a comprehensive, well-structured answer worth ${marks} marks.

=== FORMAT RULES - FOLLOW EXACTLY ===

**USE MARKDOWN ONLY - NO LATEX FOR TEXT**

**WHEN LISTING MULTIPLE POINTS (CRITICAL):**
If the question asks for "5 things" or "multiple items" or "list":
1. **Point 1 Title:** Explanation of first point
2. **Point 2 Title:** Explanation of second point
3. **Point 3 Title:** Explanation of third point
(etc.)

ALWAYS use numbered format "1. **Title:** description" for lists!

**FORMATTING:**
- ## for main headings
- **bold** for key terms and titles
- *italic* for emphasis
- Use proper Markdown numbered lists (1. 2. 3.)
- Use bullet points (- item) only for sub-items

**NEVER USE:**
- \\textbf{}, \\begin{itemize}, \\item, or ANY LaTeX commands for text
- Wall of text without structure
- Paragraphs without bold key terms

**LaTeX ONLY FOR MATH:**
- Inline: $x^2 + y^2$
- Display: $$formula$$

**OUTPUT:**
Return ONLY valid JSON: {"answer1": "<your answer>"}
No markdown fences, no extra text.
`;

  textPrompt += `\nQuestion: ${prompt}\n`;
  textPrompt += `Additional instructions: ${instructions || "None"}\n`;
  textPrompt += `Maximum marks: ${marks}\n`;

  const imageParts = images
    .filter((img) => img?.data)
    .map(({ data, mimeType = "image/jpeg" }) => ({
      inlineData: {
        mimeType,
        data: data.startsWith("data:") ? data.split(",")[1] : data,
      },
    }));

  const contents = [
    {
      role: "user",
      parts: [
        ...imageParts,
        { text: textPrompt },
      ],
    },
  ];

  console.log(
    "FINAL PAYLOAD TO GEMINI:",
    JSON.stringify(
      {
        contents: contents.map((c) => ({
          role: c.role,
          parts: c.parts.map((p) =>
            p.inlineData
              ? { mimeType: p.inlineData.mimeType, dataLength: p.inlineData.data.length }
              : p
          ),
        })),
      },
      null,
      2
    )
  );

  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Directly use ai.models.generateContent
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    // Extract text. It might be under .text or under .candidates structure depending on SDK version
    let rawText = "";
    if (response.text) {
      rawText = response.text.trim();
    } else if (response.candidates?.length) {
      // e.g. content in first candidate’s parts
      const part = response.candidates[0].content?.parts?.[0];
      rawText = part?.text?.trim() || "";
    }

    console.log("LLM RAW OUTPUT:", rawText);

    const parsed = parseLLMOutput(rawText);
    return NextResponse.json({ success: true, samples: [parsed] });
  } catch (err) {
    console.error("generate error:", err);
    return NextResponse.json(
      { success: false, error: "LLM generation failed", details: String(err) },
      { status: 500 }
    );
  }
}
