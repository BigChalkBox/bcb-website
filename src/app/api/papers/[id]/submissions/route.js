// src/app/api/papers/[id]/submissions/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fileToBuffer(file) {
  // file is a Web File from formData in Node runtime
  // convert to ArrayBuffer -> Buffer
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function GET(req, { params }) {
  try {
    const { id } = await params; // <-- await params

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing paper id" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("paper_id", id)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Fetch submissions error (supabase):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Fetch submissions error:", err);
    return NextResponse.json({ success: false, error: err.message || String(err) }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params; // <-- await params

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing paper id" }, { status: 400 });
    }

    const formData = await req.formData();
    const studentName = formData.get("student_name");
    const enrollmentNo = formData.get("enrollment_no");
    const email = formData.get("email");
    const file = formData.get("file"); // File object

    if (!studentName || !enrollmentNo || !email || !file) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (student_name, enrollment_no, email, file)" },
        { status: 400 }
      );
    }

    // 1) Validate paper exists and read subject_name
    const { data: paperRow, error: paperErr } = await supabase
      .from("papers")
      .select("subject_name")
      .eq("id", id)
      .single();

    if (paperErr || !paperRow) {
      console.error("Invalid paper id or error reading paper:", paperErr);
      return NextResponse.json({ success: false, error: "Invalid paper ID" }, { status: 400 });
    }

    const paperName = paperRow.subject_name || "paper";
    const cleanPaperName = paperName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");

    // 2) Prepare file buffer and path
    // Ensure the bucket 'submissions' exists in your Supabase storage
    const fileName = `${enrollmentNo}_${id}_${cleanPaperName}.pdf`;
    const filePath = `${id}/${fileName}`;

    // Convert uploaded file to Buffer (server-side)
    const buffer = await fileToBuffer(file);

    // 3) Upload to Supabase storage
    const { error: uploadErr } = await supabase.storage
      .from("submissions")
      .upload(filePath, buffer, { upsert: true });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr);
      return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 });
    }

    // 4) Insert submission row (unique constraint prevents duplicates)
    const { data, error: insertErr } = await supabase
      .from("submissions")
      .insert([
        {
          student_name: studentName,
          enrollment_no: enrollmentNo,
          email,
          paper_id: id,
          paper_name: paperName,
          file_path: filePath,
        },
      ])
      .select()
      .single();

    if (insertErr) {
      // Unique constraint on (enrollment_no, paper_id)
      if (insertErr.code === "23505" || insertErr.code === "23503") {
        return NextResponse.json(
          { success: false, error: "This student has already submitted for this paper." },
          { status: 400 }
        );
      }
      console.error("Insert submission error:", insertErr);
      return NextResponse.json({ success: false, error: insertErr.message || String(insertErr) }, { status: 500 });
    }

    return NextResponse.json({ success: true, submission: data });
  } catch (err) {
    console.error("Submission error:", err);
    return NextResponse.json({ success: false, error: err.message || String(err) }, { status: 500 });
  }
}
