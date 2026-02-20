// src/app/api/curricula/upload/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createPartFromUri, GoogleGenAI } from "@google/genai";
import { jsonrepair } from "jsonrepair";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function extractJsonFromMarkdown(md) {
    const match = md.match(/```json\s*([\s\S]*?)\s*```/i);
    return match ? match[1].trim() : md.trim();
}

/**
 * POST /api/curricula/upload
 * Upload PDF syllabus, send to Gemini for topic extraction page by page
 */
export async function POST(req) {
    try {
        // Get current user for ownership
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        const { data: { user } } = await supabase.auth.getUser();
        const ownerId = user?.id || null;

        const formData = await req.formData();
        const file = formData.get("file");
        const textContent = formData.get("text");
        const subjectCode = formData.get("subjectCode") || "UNKNOWN";
        const subjectName = formData.get("subjectName") || "Unknown Subject";

        let structuredTopics;
        let rawContent = "";

        // Handle PDF/file upload
        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileBlob = new Blob([buffer], { type: file.type || "application/pdf" });
            rawContent = `[File: ${file.name}, Type: ${file.type}, Size: ${buffer.length} bytes]`;

            console.log(`[Curriculum] Uploading ${file.name} to Gemini...`);

            // Upload file to Gemini (same as extract API)
            const uploadedFile = await ai.files.upload({
                file: fileBlob,
                config: {
                    displayName: file.name || "curriculum.pdf",
                },
            });

            // Wait for processing
            let getFile = await ai.files.get({ name: uploadedFile.name });
            while (getFile.state === "PROCESSING") {
                console.log(`File status: ${getFile.state}, waiting...`);
                await new Promise((resolve) => setTimeout(resolve, 3000));
                getFile = await ai.files.get({ name: uploadedFile.name });
            }

            if (getFile.state === "FAILED") {
                throw new Error("File processing failed");
            }

            console.log(`[Curriculum] File ready, extracting topics...`);

            // Prompt for syllabus extraction with Course Outcomes
            const prompt = `
You are analyzing a course syllabus/curriculum document for: ${subjectName}

TASK: Extract ALL units, chapters, topics, AND Course Outcomes (COs) from this syllabus.
Analyze each page carefully and extract the complete course structure.

For each topic, estimate its relative weight (importance) from 0-100 based on:
- Depth of content described
- Number of subtopics
- Time/hours allocated (if mentioned)

Return ONLY valid JSON (no markdown, no explanation):
{
  "courseOutcomes": [
    {
      "id": "CO1",
      "code": "CO1",
      "description": "Course Outcome description as written in syllabus"
    },
    {
      "id": "CO2",
      "code": "CO2",
      "description": "Another Course Outcome"
    }
  ],
  "units": [
    {
      "id": "unit-1",
      "name": "Unit Name as written in syllabus",
      "weight": 25,
      "hours": 10,
      "mappedCOs": ["CO1", "CO2"],
      "topics": [
        { "id": "u1-t1", "name": "Topic Name", "weight": 10 },
        { "id": "u1-t2", "name": "Another Topic", "weight": 8 }
      ]
    }
  ],
  "totalHours": 45,
  "credits": 3
}

Rules:
- Extract ALL Course Outcomes (COs) mentioned in the syllabus
- For each unit, identify which COs it addresses (mappedCOs)
- Extract EVERY unit/module mentioned
- Extract EVERY topic and subtopic
- Use exact names from the syllabus
- Create unique sequential IDs (unit-1, unit-2, u1-t1, CO1, CO2, etc.)
- Weights should approximately sum to 100
- Include hours if mentioned in syllabus
- If COs are not explicitly mentioned, infer them from learning objectives or outcomes
`;

            // Build content with file reference
            const content = [prompt];
            if (getFile.uri && getFile.mimeType) {
                content.push(createPartFromUri(getFile.uri, getFile.mimeType));
            }

            // Call Gemini
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: content,
            });

            const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            console.log("[Curriculum] Raw output:", text.substring(0, 300));

            // Parse JSON
            try {
                const extracted = extractJsonFromMarkdown(text);
                const repaired = jsonrepair(extracted);
                structuredTopics = JSON.parse(repaired);
            } catch (parseErr) {
                console.error("JSON parse error:", parseErr);
                structuredTopics = { units: [], error: "Failed to parse syllabus structure" };
            }

        } else if (textContent) {
            // Handle text content
            rawContent = textContent;

            const prompt = `
Extract course units, topics, AND Course Outcomes (COs) from this syllabus text for: ${subjectName}

SYLLABUS TEXT:
${textContent.substring(0, 30000)}

Return ONLY valid JSON:
{
  "courseOutcomes": [
    { "id": "CO1", "code": "CO1", "description": "Course Outcome description" }
  ],
  "units": [
    {
      "id": "unit-1",
      "name": "Unit Name",
      "weight": 25,
      "mappedCOs": ["CO1"],
      "topics": [
        { "id": "u1-t1", "name": "Topic", "weight": 10 }
      ]
    }
  ]
}

Rules:
- Extract ALL Course Outcomes mentioned (or infer from learning objectives)
- Map each unit to the COs it addresses
`;

            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [prompt],
            });

            const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

            try {
                const extracted = extractJsonFromMarkdown(text);
                const repaired = jsonrepair(extracted);
                structuredTopics = JSON.parse(repaired);
            } catch (parseErr) {
                structuredTopics = { units: [], error: "Failed to parse" };
            }

        } else {
            return NextResponse.json(
                { success: false, error: "No file or text provided" },
                { status: 400 }
            );
        }

        // Count totals
        const unitsCount = structuredTopics.units?.length || 0;
        const topicsCount = structuredTopics.units?.reduce(
            (sum, u) => sum + (u.topics?.length || 0),
            0
        ) || 0;
        const cosCount = structuredTopics.courseOutcomes?.length || 0;

        console.log(`[Curriculum] Extracted ${unitsCount} units, ${topicsCount} topics, ${cosCount} Course Outcomes`);

        // Store in database with owner
        const { data, error } = await supabaseAdmin
            .from("curricula")
            .insert({
                subject_code: subjectCode,
                subject_name: subjectName,
                raw_content: rawContent,
                structured_topics: structuredTopics,
                owner_id: ownerId,
            })
            .select()
            .single();

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            curriculum: data,
            curriculumId: data.id,
            unitsExtracted: unitsCount,
            topicsExtracted: topicsCount,
            courseOutcomesExtracted: cosCount,
        });

    } catch (err) {
        console.error("Curriculum upload error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
