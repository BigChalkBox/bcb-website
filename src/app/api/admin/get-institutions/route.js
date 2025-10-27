import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from("institutions")
    .select("id, name, created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // count teachers & students per institution
  const promises = data.map(async (inst) => {
    const { count: teacherCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "teacher")
      .eq("institution_id", inst.id);

    const { count: studentCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")
      .eq("institution_id", inst.id);

    return {
      ...inst,
      teachers: teacherCount || 0,
      students: studentCount || 0,
    };
  });

  const results = await Promise.all(promises);
  return NextResponse.json(results);
}
