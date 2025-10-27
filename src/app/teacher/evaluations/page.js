// src/app/teacher/evaluations/page.js
"use client";
import { useEffect, useState, useCallback } from "react";
import styles from "./EvaluationsPage.module.css";
import Header from "@/components/HeaderSub";
import Link from "next/link";

export default function EvaluationsPage() {
  const [papers, setPapers] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [evaluating, setEvaluating] = useState(null);
  const [detecting, setDetecting] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch grouped submissions (paper-wise)
  const fetchGroupedSubmissions = useCallback(async () => {
    try {
      const res = await fetch("/api/evaluations", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch");
      setPapers(json.data || []);
    } catch (err) {
      console.error("❌ Failed to load evaluations:", err);
      alert("Failed to load evaluations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroupedSubmissions();

    // 🕒 Optional: Auto-refresh every 30s for live sync
    const interval = setInterval(() => {
      fetchGroupedSubmissions();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchGroupedSubmissions]);

  // 🔹 Toggle Paper expand/collapse
  const toggleExpand = (paperId) => {
    setExpanded((prev) => ({ ...prev, [paperId]: !prev[paperId] }));
  };

  // 🔹 Evaluate entire paper (all questions)
  const handleEvaluate = async (submissionId, paperId) => {
    setEvaluating(submissionId);
    try {
      alert("⏳ Evaluation started! This may take a few minutes depending on question count.");

      const res = await fetch(`/api/evaluations/${submissionId}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId }),
      });

      const json = await res.json();
      if (json.success) {
        alert(`✅ Evaluated successfully!\nSaved report: ${json.savedPath}`);
        await fetchGroupedSubmissions(); // ✅ Refresh after success
      } else {
        alert(`❌ Evaluation failed:\n${json.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Evaluation request failed:", err);
      alert("⚠️ Error while evaluating submission.");
    } finally {
      setEvaluating(null);
    }
  };

  // 🔍 Detect Question Numbers via Gemini OCR
  const handleDetect = async (submissionId) => {
    if (!confirm("Start question number detection for this submission?")) return;

    setDetecting(submissionId);
    try {
      const res = await fetch(`/api/evaluations/${submissionId}`, { method: "POST" });
      const json = await res.json();
      console.log("Detected Questions:", json);

      if (json.success) {
        alert(`✅ Detection complete! Processed ${json.data.length} pages.`);
        await fetchGroupedSubmissions(); // ✅ Refresh from backend
      } else {
        alert("❌ Detection failed: " + json.error);
      }
    } catch (err) {
      console.error("Detection error:", err);
      alert("Error during question detection");
    } finally {
      setDetecting(null);
    }
  };

  if (loading) return <p>Loading evaluations...</p>;

  return (
<>
<Header/>



    <div className={styles.container}>
      <h1>DASES Evaluation Dashboard</h1>

      {papers.length === 0 ? (
        <p>No submissions found.</p>
      ) : (
        <div className={styles.paperList}>
          {papers.map((paper, index) => (
            <div key={`${paper.paper_id}-${index}`} className={styles.paperCard}>
              <div
                className={styles.paperHeader}
                onClick={() => toggleExpand(paper.paper_id)}
              >
                <div>
                  <h3>{paper.paper_name}</h3>
                  <p>
                    {paper.program || "Program"} | Sem {paper.semester || "-"}
                  </p>
                </div>
                <button className={styles.toggleBtn}>
                  {expanded[paper.paper_id] ? "▲ Hide" : "▼ View Submissions"}
                </button>
              </div>

              {expanded[paper.paper_id] && (
                <table className={styles.submissionsTable}>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Enrollment</th>
                      <th>Email</th>
                      <th>File</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paper.submissions.map((s) => (
                      <tr key={s.id}>
                        <td>{s.student_name}</td>
                        <td>{s.enrollment_no}</td>
                        <td>{s.email}</td>
                        <td>
                          <Link
                            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/submissions/${s.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View PDF
                          </Link>
                        </td>
                        <td
                          className={
                            s.evaluation_status === "Evaluated"
                              ? styles.statusDone
                              : s.evaluation_status === "Pages Detected"
                              ? styles.statusDetected
                              : styles.statusPending
                          }
                        >
                          {s.evaluation_status || "Pending"}
                        </td>
                        <td>{s.score ?? "-"}</td>
                        <td className={styles.actions}>
                          <button
                            disabled={evaluating === s.id}
                            onClick={() => handleEvaluate(s.id, paper.paper_id)}
                            className={styles.evaluateBtn}
                          >
                            {evaluating === s.id ? "Evaluating..." : "Evaluate"}
                          </button>

                          <button
                            disabled={detecting === s.id}
                            onClick={() => handleDetect(s.id)}
                            className={styles.detectBtn}
                          >
                            {detecting === s.id ? "Detecting..." : "Detect Qs"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>


</>

  );
}
