import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generatePassword(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { full_name, email, enrollment_no } = body;

    // 🔹 Check if the student already exists in users
    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("email", email)
      .maybeSingle();

    if (existingError) throw existingError;

    // 🔹 If user exists, fetch stored password
    if (existingUser) {
      const { data: studentProfile, error: profileError } = await supabase
        .from("student_profiles")
        .select("full_name, enrollment_no, temp_password")
        .eq("id", existingUser.id)
        .maybeSingle();

      if (profileError) throw profileError;

      return NextResponse.json({
        success: true,
        message: "User already exists.",
        password: studentProfile?.temp_password || "Password not stored",
        user_id: existingUser.id,
      });
    }

    // 🔹 Otherwise create new user
    const password = generatePassword();

    const { data, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;

    const userId = data.user.id;

    // 🔹 Add to users table
    await supabase.from("users").insert([
      {
        id: userId,
        email,
        role: "student",
      },
    ]);

    // 🔹 Add to student_profiles and store temp password
    await supabase.from("student_profiles").insert([
      {
        id: userId,
        full_name,
        enrollment_no,
        temp_password: password, // ✅ stored for teacher reference
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
      password,
      user_id: userId,
    });
  } catch (err) {
    console.error("Error sharing results:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
