// src/app/api/evaluate-all/route.js
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});
const readFile = promisify(fs.readFile);

export async function POST(request) {
  try {
    const { paperPath } = await request.json();
    if (!paperPath) {
      return Response.json({ error: "paperPath is required" }, { status: 400 });
    }

    const fullPath = path.join(process.cwd(), "public", paperPath);
    if (!fs.existsSync(fullPath)) {
      return Response.json({ error: "Paper not found" }, { status: 404 });
    }

    const paperData = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    const questions = paperData.questions || [];

    const evaluatedResults = [];
    console.log(`🧾 Evaluating ${questions.length} questions...`);

    for (const [index, q] of questions.entries()) {
      try {
        const result = await evaluateQuestion(q, index + 1);
        evaluatedResults.push({
          ...q,
          evaluation: result,
        });
      } catch (error) {
        console.error(`❌ Evaluation failed for Q${index + 1}:`, error.message);
        evaluatedResults.push({
          ...q,
          evaluation: {
            error: error.message,
            suggestedScore: 0,
            feedback: "Evaluation failed - check input data or rubric",
          },
        });
      }
    }

    // ✅ Save final evaluation report
    const evaluatedData = {
      paperTitle: paperData.paperTitle || "Untitled Paper",
      evaluatedAt: new Date().toISOString(),
      totalQuestions: questions.length,
      results: evaluatedResults,
    };

    const evaluatedFolder = path.join(process.cwd(), "public", "evaluations");
    if (!fs.existsSync(evaluatedFolder))
      fs.mkdirSync(evaluatedFolder, { recursive: true });

    const outputFile = `evaluated-${Date.now()}.json`;
    const evaluatedPath = path.join(evaluatedFolder, outputFile);
    fs.writeFileSync(evaluatedPath, JSON.stringify(evaluatedData, null, 2), "utf-8");

    console.log(`✅ Saved evaluation report: ${evaluatedPath}`);

    return Response.json({
      success: true,
      message: "All questions evaluated successfully",
      total: questions.length,
      savedPath: `/evaluations/${outputFile}`,
      results: evaluatedResults,
    });
  } catch (error) {
    console.error("❌ Evaluation route error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

/* ---------- Question Evaluator ---------- */
async function evaluateQuestion(question, index) {
  const sampleAnswers = question.samples || [];
  const rubric =
    sampleAnswers[0]?.rubric || sampleAnswers[0]?.rubric?.criteria || [];

  const sampleTexts = sampleAnswers
    .map((s) => s.answer || "")
    .join("\n\n---\n\n");

  const studentImages = (question.images || []).map((url) => ({
    inlineData: { mimeType: detectMimeType(url), data: url },
  }));

  const prompt = `
You are an expert evaluator grading exam answers.

You are given:
- A question (in LaTeX format)
- One or more sample full-mark answers
- The maximum marks
- A rubric describing scoring criteria
- Student’s handwritten answer (image form)

Evaluate the student's answer fairly but generously, following rubric weightage.

---

Question:
${question.text}

Maximum Marks: ${question.marks}

Rubric:
${JSON.stringify(rubric, null, 2)}

Sample Answer(s):
${sampleTexts}

---

Instructions:
- If student's logic is correct but not identical, give proportionate marks.
- Reward conceptual understanding, not just exact wording.
- Never give 0 unless completely blank or wrong.
- Mention which criteria are met and why.
- Include a short but precise feedback section.

Return strictly in JSON format:
{
  "criteria": [
    {
      "criterion": "text",
      "obtained_marks": number,
      "max_marks": number,
      "feedback": "text"
    }
  ],
  "suggestedScore": number,
  "feedback": "overall feedback"
}
IMPORTANT: Return ONLY JSON, no text outside JSON.
`;

  const inputParts = [
    { text: prompt },
    ...(studentImages.length ? [{ text: "Student Answers:" }, ...studentImages] : []),
  ];

  console.log(`🧠 Sending Q${index} (${question.marks} marks) to Gemini...`);

  const response = await genAI.models.generateContent({
    model: "gemini-2.5-pro", // ✅ latest accurate model for evaluation
    contents: [
      {
        role: "user",
        parts: inputParts,
      },
    ],
  });

  // 🧠 Extract output text properly for @google/genai
  let resultText = "";
  if (response.text) {
    resultText = response.text.trim();
  } else if (response.candidates?.length) {
    resultText =
      response.candidates[0].content?.parts?.[0]?.text?.trim() || "";
  }

  console.log(`✅ Q${index} evaluated successfully.`);

  return parseLLMResponse(resultText);
}

/* ---------- Utilities ---------- */
function detectMimeType(url) {
  if (url.endsWith(".png")) return "image/png";
  if (url.endsWith(".jpg") || url.endsWith(".jpeg")) return "image/jpeg";
  return "image/png";
}

function parseLLMResponse(text) {
  try {
    const cleanText = text.replace(/^[^{]*/, "").replace(/[^}]*$/, "");
    if (!cleanText.startsWith("{")) throw new Error("No valid JSON in LLM response");
    const parsed = JSON.parse(cleanText);
    if (!parsed.criteria || typeof parsed.suggestedScore === "undefined") {
      throw new Error("Missing required fields");
    }
    return parsed;
  } catch (err) {
    console.error("⚠️ Failed to parse LLM JSON:", err.message, "\nRaw:", text);
    return {
      suggestedScore: 0,
      feedback: "Error parsing evaluation response",
      criteria: [],
    };
  }
}
