// src/app/api/admin/get-institution-users/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const { institution_id } = await request.json();

  // Teachers
  const { data: teachers, error: tError } = await supabase
    .from("users")
    .select("id, email, role, teacher_profiles(full_name, department)")
    .eq("institution_id", institution_id)
    .eq("role", "teacher");

  if (tError) return NextResponse.json({ error: tError.message }, { status: 400 });

  // Students
  const { data: students, error: sError } = await supabase
    .from("users")
    .select("id, email, role, student_profiles(full_name, enrollment_no, course, year)")
    .eq("institution_id", institution_id)
    .eq("role", "student");

  if (sError) return NextResponse.json({ error: sError.message }, { status: 400 });

  return NextResponse.json({ teachers, students });
}
