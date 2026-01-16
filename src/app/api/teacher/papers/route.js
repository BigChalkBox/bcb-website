// src/app/api/teacher/papers/route.js
// Demo-friendly paper creation API (no auth required for demo mode)
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const body = await req.json();

        // Insert paper with demo defaults
        const { data, error } = await supabase
            .from("papers")
            .insert([
                {
                    subject_name: body.subject_name || "Demo Paper",
                    subject_code: body.subject_code || `DEMO-${Date.now()}`,
                    year: body.year || new Date().getFullYear(),
                    faculty_name: body.faculty_name || "Demo Faculty",
                    exam_type: body.exam_type || "Demo",
                    exam_month_year: body.exam_month_year || `Jan ${new Date().getFullYear()}`,
                    program: body.program || "Demo",
                    semester: body.semester || 1,
                    course: body.course || "Demo Course",
                    time_allowed: body.time_allowed || "3 Hours",
                    max_marks: body.max_marks || 100,
                    instructions: body.instructions || "Demo instructions",
                    paper_data: body.paper_data || { questions: [] },
                    status: "draft",
                    is_active: false,
                    teacher_id: body.teacher_id || null,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error("Paper creation error:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
