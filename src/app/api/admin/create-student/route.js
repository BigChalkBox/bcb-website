import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const body = await request.json();
  const { email, password, full_name, enrollment_no, course, year, institution_id } = body;

  // 1. Create user in Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const userId = data.user.id;

  // 2. Insert into users table
  await supabase.from("users").insert([
    { id: userId, email, role: "student", institution_id }
  ]);

  // 3. Insert into student_profiles
  await supabase.from("student_profiles").insert([
    { id: userId, full_name, enrollment_no, course, year }
  ]);

  return NextResponse.json({ success: true, id: userId });
}
