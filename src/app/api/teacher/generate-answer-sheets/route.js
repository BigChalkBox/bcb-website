import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    // ✅ Build payload for Render backend
    const payload = {
      university_name: body.university_name,
      exam_id: body.exam_id,
      subject: body.subject,
      date: body.date,
      num_students: Number(body.num_students),
      main_pages: body.main_pages ? Number(body.main_pages) : 6,
      extra_pages: body.extra_pages ? Number(body.extra_pages) : 2,
      objective_questions: body.objective_questions ? Number(body.objective_questions) : 0,
      objective_labels: body.objective_labels || "",
      manifest: true, // Always include manifest for tracking
    };

    const response = await fetch("https://dases-answer-sheets.onrender.com/generate-booklets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Booklet service error: ${errorText}`);
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="answer_sheets_${body.exam_id}.zip"`,
      },
    });
  } catch (err) {
    console.error("Error generating answer sheets:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
