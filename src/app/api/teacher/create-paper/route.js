// src/app/api/teacher/create-paper/route.js
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    // ✅ Create a Supabase client *bound to cookies* automatically
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // ✅ Get logged-in user directly
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Extract year from exam_month_year (e.g., "May 2026" -> 2026)
    let year = body.year;
    if (!year && body.exam_month_year) {
      const match = body.exam_month_year.match(/\d{4}/);
      year = match ? parseInt(match[0]) : new Date().getFullYear();
    }
    if (!year) {
      year = new Date().getFullYear();
    }

    // ✅ Insert paper with this teacher's ID
    const { data, error } = await supabase.from("papers").insert([
      {
        teacher_id: user.id,
        subject_name: body.subject_name,
        subject_code: body.subject_code,
        year: year,
        faculty_name: body.faculty_name || user.email?.split('@')[0] || 'Faculty',
        exam_type: body.exam_type,
        exam_month_year: body.exam_month_year,
        program: body.program,
        semester: body.semester,
        course: body.course || body.subject_name,
        time_allowed: body.time_allowed,
        max_marks: body.max_marks,
        instructions: body.instructions,
        is_active: body.is_active || false,
        status: 'draft',
      },
    ]).select().single();

    if (error) {
      console.error("Supabase Insert Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, paper: data });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
