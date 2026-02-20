// app/api/generate/route.js
import { NextResponse } from "next/server";
import { generateContentWithFallback, extractTextFromResponse } from "@/lib/gemini";

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

  console.log(`[Generate API] Received request:
    - Prompt length: ${prompt.length}
    - Instructions: "${instructions.substring(0, 50)}..."
    - Images: ${images.length}
    - Marks: ${marks}`);

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
- \\\\textbf{}, \\\\begin{itemize}, \\\\item, or ANY LaTeX commands for text
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
    // Use fallback-enabled generation (tries gemini-2.5-flash → gemini-2.5-pro → gemini-2.0-flash)
    const { response, model } = await generateContentWithFallback({
      contents,
      preferredModel: "gemini-2.5-flash",
      maxRetries: 2,
      baseDelay: 1000,
    });

    const rawText = extractTextFromResponse(response);
    console.log(`LLM RAW OUTPUT (model: ${model}):`, rawText);

    const parsed = parseLLMOutput(rawText);
    return NextResponse.json({ success: true, samples: [parsed], model });
  } catch (err) {
    console.error("generate error:", err);
    return NextResponse.json(
      { success: false, error: "LLM generation failed", details: String(err) },
      { status: 500 }
    );
  }
}
