import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const { id, full_name, department, email, institution_id } = await req.json();

  // Update users table
  const { error: userError } = await supabase
    .from("users")
    .update({ email, institution_id })
    .eq("id", id);
  if (userError) return NextResponse.json({ error: userError.message }, { status: 400 });

  // Update teacher_profiles
  const { error: profileError } = await supabase
    .from("teacher_profiles")
    .update({ full_name, department })
    .eq("id", id);
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
