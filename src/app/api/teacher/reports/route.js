import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // 🔐 Authenticate teacher
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🧩 Step 1: Get all paper IDs belonging to this teacher
    const { data: teacherPapers, error: paperError } = await supabase
      .from("papers")
      .select("id")
      .eq("teacher_id", user.id);

    if (paperError) throw paperError;

    const teacherPaperIds = teacherPapers.map((p) => p.id);

    if (teacherPaperIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No papers found for this teacher",
      });
    }

    // 🧩 Step 2: Fetch evaluations for submissions linked to those papers
    const { data, error } = await supabase
      .from("evaluations")
      .select(`
        id,
        submission_id,
        status,
        updated_at,
        evaluation_results,
        submissions (
          student_name,
          enrollment_no,
          email,
          paper_id,
          paper_name,
          submitted_at,
          papers (
            subject_name,
            program,
            semester,
            exam_type,
            exam_month_year,
            teacher_id
          )
        )
      `)
      .in("submissions.paper_id", teacherPaperIds)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    // 🧠 Step 3: Group by paper_id
    const grouped = {};

    for (const row of data) {
      const submission = row.submissions || {};
      const paper = submission.papers || {};
      const paperId = submission.paper_id;
      if (!paperId) continue;

      if (!grouped[paperId]) {
        grouped[paperId] = {
          paper_id: paperId,
          subject_name:
            paper.subject_name || submission.paper_name || "Untitled Paper",
          exam_type: paper.exam_type || "-",
          exam_month_year: paper.exam_month_year || "-",
          program: paper.program || "-",
          semester: paper.semester || "-",
          students: [],
        };
      }

      // 🎯 Extract total score and marks
      let totalScore = 0;
      let totalMarks = 0;

      try {
        if (row.evaluation_results && typeof row.evaluation_results === "object") {
          const results = row.evaluation_results.results || [];
          totalMarks = results.reduce((sum, q) => sum + (q.marks || 0), 0);
          totalScore = results.reduce(
            (sum, q) => sum + (q.evaluation?.suggestedScore || 0),
            0
          );
        }
      } catch (err) {
        console.error("Score parse error:", err);
      }

      grouped[paperId].students.push({
        submission_id: row.submission_id,
        student_name: submission.student_name,
        enrollment_no: submission.enrollment_no,
        email: submission.email,
        submitted_at: submission.submitted_at,
        status: row.status,
        updated_at: row.updated_at,
        score: totalScore.toFixed(2),
        total: totalMarks.toFixed(2),
      });
    }

    return NextResponse.json({
      success: true,
      data: Object.values(grouped),
    });
  } catch (err) {
    console.error("❌ Error fetching teacher reports:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}