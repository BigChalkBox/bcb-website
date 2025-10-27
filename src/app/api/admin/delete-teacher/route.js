import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const { id } = await req.json();

  // Delete teacher profile first
  await supabase.from("teacher_profiles").delete().eq("id", id);

  // Delete from users table
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Also remove from Supabase Auth
  await supabase.auth.admin.deleteUser(id);

  return NextResponse.json({ success: true });
}
