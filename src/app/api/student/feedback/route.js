// src/app/api/student/feedback/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { submission_id, student_id, feedback_text, rating } = await req.json();

    if (!submission_id || !student_id || !feedback_text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Prevent duplicates
    const { data: existing } = await supabase
      .from("evaluation_feedback")
      .select("id")
      .eq("submission_id", submission_id)
      .eq("student_id", student_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: false,
        message: "Feedback already submitted for this report.",
      });
    }

    const { error } = await supabase.from("evaluation_feedback").insert([
      { submission_id, student_id, feedback_text, rating: rating || null },
    ]);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "✅ Feedback submitted successfully!",
    });
  } catch (err) {
    console.error("❌ Feedback error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
