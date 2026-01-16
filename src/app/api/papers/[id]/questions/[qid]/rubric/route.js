// src/app/api/papers/[id]/questions/[qid]/rubric/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // needs service role for writes
);

export async function POST(req, { params }) {
  const { id, qid } = params;
  const body = await req.json();
  const { sampleAnswer = "", maxMarks, sampleImages = [], questionText } = body;

  // ✅ Validation
  if ((!sampleAnswer.trim() && (!sampleImages || sampleImages.length === 0))) {
    return NextResponse.json(
      { success: false, error: "Provide either sampleAnswer text or sampleImages" },
      { status: 400 }
    );
  }
  if (!maxMarks || !questionText) {
    return NextResponse.json(
      { success: false, error: "Missing required fields: maxMarks or questionText" },
      { status: 400 }
    );
  }

  // ✅ Load paper from Supabase
  const { data: paper, error: fetchError } = await supabase
    .from("papers")
    .select("id, paper_data")
    .eq("id", id)
    .single();

  if (fetchError || !paper) {
    return NextResponse.json({ success: false, error: "Paper not found" }, { status: 404 });
  }

  let paperData = paper.paper_data || { questions: [] };
  if (!Array.isArray(paperData.questions)) paperData.questions = [];

  // ✅ Find question
  const question = paperData.questions.find((q) => q.qid == qid);
  if (!question) {
    return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
  }

  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    /* ----------------------- Build multimodal prompt ----------------------- */
    //     const parts = [
    //       {
    //         text: `You are given a question, a sample answer, and the maximum marks for the question.
    // Question: ${questionText}
    // Sample Answer (Text): ${sampleAnswer || "None"}
    // Maximum Marks: ${maxMarks}

    // Output strictly valid JSON:

    // {
    //   "rubric": [
    //     { "criteria": "Criteria description", "max_marks": <number> }
    //   ]
    // }

    // Rules:
    // - Break down the answer into key components.
    // - Make criteria measurable.
    // - Make criteria in a way that is
    // - Consider diagrams, flowcharts, and numeric steps if present.
    // - Identify the important points in the answer and generate a scoring rubric.
    // - The scoring rubric is a JSON object containing the criteria and maximum marks for having that point in the answer.
    // - Total must equal ${maxMarks}
    // - The sum of max_marks should be equal to the total marks for the question.
    // `
    //       }
    //     ];




    const parts = [
      {
        text: `You are given a question, a sample answer, and the maximum marks.

Your task is to generate a **general evaluation rubric** suitable for CA examination checking.

Inputs:
Question: ${questionText}
Sample Answer (for reference only): ${sampleAnswer || "None"}
Maximum Marks: ${maxMarks}

IMPORTANT GUIDELINES:
- Use the sample answer ONLY to understand:
  • the expected flow of the answer
  • the key concepts, provisions, and logical structure
- The rubric must remain **generic and flexible**, so that:
  • alternative valid examples
  • different wording
  • different ordering (if conceptually correct)
  can still score full marks.
- Focus on **what is being tested**, not **how it is phrased**.
- Do not OVERFIT to the sample answer. The rubric should apply broadly to any correct answer to the question.

Rubric Design Rules:
- Break the answer into key conceptual components.
- Each criterion should describe a **measurable learning outcome** (e.g., "Correct identification of limits", "Explanation of regulatory provision").
- Avoid mentioning:
  • specific examples
  • exact figures unless legally mandatory
  • verbatim phrases from the sample answer
- Follow the logical flow implied by the sample answer, but NOT word-to-word.
- If the answer involves:
  • legal provisions → include reference to section/regulation understanding
  • lists → allow any correct items, not fixed ones
  • procedures → reward correct sequence and completeness
- Consider diagrams, flowcharts, or structured presentation where relevant.

Output strictly valid JSON in the format:

{
  "rubric": [
    { "criteria": "Clear, general criterion description", "max_marks": <number> }
  ]
}

Constraints:
- Total of all max_marks MUST equal ${maxMarks}
- Do NOT include explanations, commentary, or text outside JSON.
`
      }
    ];


    // ✅ Attach images
    for (const imgPath of sampleImages) {
      try {
        const imageBytes = fs.readFileSync(`./public${imgPath}`);
        const b64 = imageBytes.toString("base64");
        parts.push({
          inlineData: {
            data: b64,
            mimeType: "image/png" // TODO: detect dynamically
          }
        });
      } catch (e) {
        console.warn("Could not attach image:", imgPath, e.message);
      }
    }

    // ✅ Generate rubric with @google/genai
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
    });



    // 🪶 Debug log (safe payload preview)
    console.log(
      "\n📦 GEMINI PAYLOAD PREVIEW:",
      JSON.stringify(
        {
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: parts.map((p) =>
                p.text
                  ? { text: p.text.slice(0, 500) + (p.text.length > 500 ? "..." : "") } // truncate text
                  : { inlineData: { mimeType: p.inlineData.mimeType, data: "[base64 omitted]" } }
              ),
            },
          ],
        },
        null,
        2
      )
    );



    // Extract text safely
    let raw = "";
    if (response.text) {
      raw = response.text.trim();
    } else if (response.candidates?.length) {
      raw = response.candidates[0].content?.parts?.[0]?.text?.trim() || "";
    }

    console.log('raw response:', raw)

    raw = raw.replace(/^```(json)?\s*/, "").replace(/```$/, "").trim();

    let rubricObj;
    try {
      // 🧹 1. Remove code fences and trim
      raw = raw.replace(/^```(json)?/i, "").replace(/```$/i, "").trim();

      // 🧹 2. Try direct JSON parse first
      try {
        rubricObj = JSON.parse(raw);
      } catch {
        // 🧹 3. Try to sanitize backslashes and retry
        const sanitized = raw
          .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r");
        try {
          rubricObj = JSON.parse(sanitized);
        } catch {
          // 🧹 4. If it’s already a JS object literal, use Function() to safely eval it
          rubricObj = Function('"use strict"; return (' + raw + ')')();
        }
      }

      // ✅ Validate structure
      if (!rubricObj.rubric || !Array.isArray(rubricObj.rubric)) {
        throw new Error("Invalid rubric structure");
      }
    } catch (parseErr) {
      console.error("❌ Parse Error:", parseErr);
      console.log("💾 Raw JSON that failed:", raw);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse rubric JSON (Gemini output likely JS literal or malformed JSON)",
          raw,
        },
        { status: 500 }
      );
    }

    // ✅ Check marks
    const totalMarks = rubricObj.rubric.reduce((sum, item) => sum + (item.max_marks || 0), 0);
    if (totalMarks > maxMarks) {
      return NextResponse.json(
        { success: false, error: `Rubric total (${totalMarks}) exceeds max marks (${maxMarks})` },
        { status: 400 }
      );
    }

    // ✅ Save rubric back into Supabase
    paperData.questions = paperData.questions.map((q) =>
      q.qid == qid ? { ...q, rubric: rubricObj.rubric } : q
    );

    const { error: updateError } = await supabase
      .from("papers")
      .update({ paper_data: paperData })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, rubric: rubricObj.rubric });
  } catch (err) {
    console.error("Rubric generation error:", err);
    return NextResponse.json(
      { success: false, error: "Rubric generation failed", details: err.message },
      { status: 500 }
    );
  }
}
