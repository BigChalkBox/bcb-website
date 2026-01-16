"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "../dashboard/Dashboard.module.css"; // reuse same CSS
import Link from "next/link";

export default function StudentReportsPage() {
  const supabase = createClientComponentClient();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error("Unauthorized:", error);
        setLoading(false);
        return;
      }

      // Fetch all submissions for this student
      const { data: submissions, error: submissionsError } = await supabase
        .from("submissions")
        .select("id, paper_name, submitted_at")
        .eq("email", user.email);

      if (submissionsError || !submissions?.length) {
        console.log("No submissions found:", submissionsError);
        setReports([]);
        setLoading(false);
        return;
      }

      const submissionIds = submissions.map((s) => s.id);

      // Create a lookup map for submissions
      const submissionMap = {};
      submissions.forEach((s) => {
        submissionMap[s.id] = s;
      });

      // Fetch evaluations for these submissions
      const { data: evals, error: evalError } = await supabase
        .from("evaluations")
        .select("submission_id, status, evaluation_results")
        .in("submission_id", submissionIds);

      if (evalError) {
        console.error("Error fetching evaluations:", evalError);
        setLoading(false);
        return;
      }

      console.log("Fetched evaluations:", evals);

      const formattedReports = evals?.map((e) => {
        let totalMarks = 0;
        let totalScore = 0;

        if (e.evaluation_results?.results) {
          totalMarks = e.evaluation_results.results.reduce(
            (sum, q) => sum + (q.marks || 0),
            0
          );
          totalScore = e.evaluation_results.results.reduce(
            (sum, q) => sum + (q.evaluation?.suggestedScore || 0),
            0
          );
        }

        const submission = submissionMap[e.submission_id];

        return {
          submission_id: e.submission_id,
          paper_name: submission?.paper_name || "Untitled Paper",
          submitted_at: submission?.submitted_at,
          score: totalScore,
          total: totalMarks,
          feedback:
            e.evaluation_results?.overall_feedback ||
            "No feedback available yet.",
          status: e.status || "Pending",
        };
      }) || [];

      console.log("Formatted reports:", formattedReports);
      setReports(formattedReports);
      setLoading(false);
    };

    fetchReports();
  }, [supabase]);

  if (loading) return <p className={styles.loading}>Loading reports...</p>;

  return (
    <div className={styles.main}>
      <section className={styles.reports}>
        <h2>My Reports</h2>

        {reports.length === 0 ? (
          <p>No reports available yet.</p>
        ) : (
          reports.map((r) => (
            <div key={r.submission_id} className={styles.reportCard}>
              <h3>{r.paper_name}</h3>
              <p>
                Score: {r.score}/{r.total}
              </p>
              <p>Status: {r.status}</p>
              <p>Feedback: {r.feedback}</p>

              <div className={styles.reportActions}>
                {r.status === "Completed" || r.status === "Evaluated" ? (
                  <Link href={`/reports/${r.submission_id}`} target="_blank">
                    <button className={styles.primaryButton}>📄 View Report</button>
                  </Link>
                ) : (
                  <button disabled className={styles.disabledButton}>
                    ⏳ Not Evaluated
                  </button>
                )}

                <button
                  className={styles.secondaryButton}
                  onClick={() =>
                    setFeedbackModal({
                      open: true,
                      submission_id: r.submission_id,
                      paper_name: r.paper_name,
                    })
                  }
                >
                  💬 Give Feedback
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Feedback Modal */}
      {feedbackModal?.open && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>Feedback for {feedbackModal.paper_name}</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const feedbackText = e.target.feedback.value;
                const rating = parseInt(e.target.rating.value);
                if (!feedbackText.trim()) return alert("Please write feedback");

                const { data: userData } = await supabase.auth.getUser();
                if (!userData?.user) return alert("Please log in again");

                const res = await fetch("/api/student/feedback", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    submission_id: feedbackModal.submission_id,
                    student_id: userData.user.id,
                    feedback_text: feedbackText,
                    rating,
                  }),
                });

                const result = await res.json();
                if (result.success) {
                  alert(result.message);
                  setFeedbackModal(null);
                } else {
                  alert(result.message || "Error submitting feedback");
                }
              }}
            >
              <textarea
                name="feedback"
                placeholder="Write your feedback..."
                className={styles.feedbackTextarea}
                required
              ></textarea>

              <label>Rate your evaluation:</label>
              <select name="rating" className={styles.ratingSelect}>
                <option value="">Select</option>
                <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                <option value="4">⭐⭐⭐⭐ Good</option>
                <option value="3">⭐⭐⭐ Average</option>
                <option value="2">⭐⭐ Poor</option>
                <option value="1">⭐ Very Poor</option>
              </select>

              <div className={styles.modalActions}>
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setFeedbackModal(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
