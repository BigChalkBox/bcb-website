// src/app/api/upload/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const paperId = formData.get("paperId") || "unassigned";
    const qid = formData.get("qid") || "general";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = file.name.replace(/\s+/g, "-");
    const fileName = `${uuidv4()}-${safeName}`;
    const filePath = `${paperId}/questions/${qid}/${fileName}`;

    // 📤 Upload to Supabase Storage bucket "papers"
    const { data, error } = await supabase.storage
      .from("papers")
      .upload(filePath, buffer, {
        upsert: true,
        contentType: file.type || "application/octet-stream",
      });

    if (error) throw error;

    // 🌐 Generate a public URL (or use signed if private bucket)
    const { data: publicUrlData } = supabase.storage
      .from("papers")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;

    return NextResponse.json({
      success: true,
      filePath,
      url: publicUrl,
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
