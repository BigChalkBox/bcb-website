// import { createClient } from "@supabase/supabase-js";
// import { NextResponse } from "next/server";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// export async function GET() {
//   const { data, error } = await supabase
//     .from("users")
//     .select(`
//       id,
//       email,
//       institution_id,
//       institution(name),
//       student_profiles(full_name, enrollment_no, course, year)
//     `)
//     .eq("role", "student");

//   if (error)
//     return NextResponse.json({ error: error.message }, { status: 500 });

//   return NextResponse.json(data);
// }
