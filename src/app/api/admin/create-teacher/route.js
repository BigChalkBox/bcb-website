// src/app/api/admin/create-teacher/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, full_name, department, institution_id } = body;

    if (!institution_id) {
      return NextResponse.json({ error: "institution_id is required" }, { status: 400 });
    }

    // 1️⃣ Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const userId = data.user.id;

    // 2️⃣ Insert into users table
    const { error: userError } = await supabase.from("users").insert([
      { id: userId, email, role: "teacher", institution_id },
    ]);
    if (userError) return NextResponse.json({ error: userError.message }, { status: 400 });

    // 3️⃣ Insert into teacher_profiles (✅ now includes institution_id)
    const { error: profileError } = await supabase.from("teacher_profiles").insert([
      { id: userId, full_name, department, institution_id },
    ]);
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

    return NextResponse.json({ success: true, id: userId });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
