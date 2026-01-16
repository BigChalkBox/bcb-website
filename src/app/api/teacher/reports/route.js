import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Service role client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    // 🔐 Authenticate teacher using user-scoped client
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
    const { data: teacherPapers, error: paperError } = await supabaseAdmin
      .from("papers")
      .select("id")
      .eq("teacher_id", user.id);

    if (paperError) throw paperError;

    console.log("Teacher ID:", user.id);
    console.log("Teacher Papers:", teacherPapers);

    const teacherPaperIds = teacherPapers.map((p) => p.id);

    console.log("Teacher Paper IDs:", teacherPaperIds);

    if (teacherPaperIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No papers found for this teacher",
      });
    }

    // 🧩 Step 2: Fetch all submissions for these papers
    const { data: submissions, error: subError } = await supabaseAdmin
      .from("submissions")
      .select("id, student_name, enrollment_no, email, paper_id, paper_name, submitted_at")
      .in("paper_id", teacherPaperIds);

    console.log("Submissions query result:", submissions);
    console.log("Submissions error:", subError);

    if (subError) throw subError;

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No submissions found",
      });
    }

    const submissionIds = submissions.map((s) => s.id);

    // Create submission lookup map
    const submissionMap = {};
    submissions.forEach((s) => {
      submissionMap[s.id] = s;
    });

    // 🧩 Step 3: Fetch evaluations for these submissions
    const { data: evaluations, error: evalError } = await supabaseAdmin
      .from("evaluations")
      .select("id, submission_id, status, updated_at, evaluation_results")
      .in("submission_id", submissionIds)
      .order("updated_at", { ascending: false });

    if (evalError) throw evalError;

    if (!evaluations || evaluations.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No evaluations found",
      });
    }

    // 🧩 Step 4: Fetch paper details
    const { data: papers, error: papersError } = await supabaseAdmin
      .from("papers")
      .select("id, subject_name, program, semester, exam_type, exam_month_year, teacher_id")
      .in("id", teacherPaperIds);

    if (papersError) throw papersError;

    // Create paper lookup map
    const paperMap = {};
    papers?.forEach((p) => {
      paperMap[p.id] = p;
    });

    // 🧠 Step 5: Group by paper_id
    const grouped = {};

    for (const row of evaluations) {
      const submission = submissionMap[row.submission_id];
      if (!submission) continue;

      const paper = paperMap[submission.paper_id];
      const paperId = submission.paper_id;
      if (!paperId) continue;

      if (!grouped[paperId]) {
        grouped[paperId] = {
          paper_id: paperId,
          subject_name:
            paper?.subject_name || submission.paper_name || "Untitled Paper",
          exam_type: paper?.exam_type || "-",
          exam_month_year: paper?.exam_month_year || "-",
          program: paper?.program || "-",
          semester: paper?.semester || "-",
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