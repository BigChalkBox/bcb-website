// src/app/api/teacher/create-paper/route.js
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    // ✅ Create a Supabase client *bound to cookies* automatically
    const supabase = createRouteHandlerClient({ cookies });

    // ✅ Get logged-in user directly
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // ✅ Insert paper with this teacher’s ID
    const { error } = await supabase.from("papers").insert([
      {
        teacher_id: user.id,
        subject_name: body.subject_name,
        subject_code: body.subject_code,
        year: body.year,
        faculty_name: body.faculty_name,
        exam_type: body.exam_type,
        exam_month_year: body.exam_month_year,
        program: body.program,
        semester: body.semester,
        course: body.course,
        time_allowed: body.time_allowed,
        max_marks: body.max_marks,
        instructions: body.instructions,
        is_active: body.is_active || false,
      },
    ]);

    if (error) {
      console.error("Supabase Insert Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
