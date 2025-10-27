import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // ✅ Await cookies (fixes "cookies() should be awaited" warning)
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // ✅ Get the logged-in teacher
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Fetch only submissions for this teacher’s papers
    const { data, error } = await supabase
      .from("submissions_with_evaluations")
      .select("*")
      .eq("teacher_id", user.id);

    if (error) throw error;

    // ✅ Group by paper_id
    const grouped = Object.values(
      data.reduce((acc, sub) => {
        const paperId = sub.paper_id;
        if (!acc[paperId]) {
          acc[paperId] = {
            paper_id: paperId,
            paper_name: sub.paper_name,
            program: sub.program || "B.Tech CSE",
            semester: sub.semester || "-",
            submissions: [],
          };
        }

        acc[paperId].submissions.push({
          id: sub.submission_id,
          student_name: sub.student_name,
          enrollment_no: sub.enrollment_no,
          email: sub.email,
          file_path: sub.file_path,
          evaluation_status: sub.evaluation_status || "Pending",
          score:
            sub.evaluation_result?.score ??
            sub.evaluation_result?.marks ??
            null,
          updated_at: sub.evaluation_updated_at,
        });

        return acc;
      }, {})
    );

    return NextResponse.json({ success: true, data: grouped });
  } catch (err) {
    console.error("❌ Fetch evaluations error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
