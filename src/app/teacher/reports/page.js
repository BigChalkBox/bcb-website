// src/app/teacher/reports/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, XCircle, Download, Loader2, Share2 } from "lucide-react";
import styles from "./Reports.module.css";
import Header from "@/components/HeaderSub";

export default function TeacherReportsPage() {
  const [groupedReports, setGroupedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState(new Set());

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/teacher/reports");
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        setGroupedReports(json.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading)
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.loader}></div>
        <p>Loading grouped reports...</p>
      </div>
    );

  if (groupedReports.length === 0)
    return (
      <div className={styles.emptyState}>
        <p>No reports available yet.</p>
      </div>
    );


  const handleShareResults = async (student) => {
    if (!confirm(`Create a login for ${student.student_name}?`)) return;

    const res = await fetch("/api/teacher/share-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: student.student_name,
        email: student.email,
        enrollment_no: student.enrollment_no,
        submission_id: student.submission_id,
      }),
    });

    const result = await res.json();
    if (result.error) {
      alert(result.error);
    } else {
      alert(`Account created!\nEmail: ${student.email}\nPassword: ${result.password}`);
    }
  };

  const handleDownloadPDF = async (student, paper) => {
    const submissionId = student.submission_id;

    // Mark as downloading
    setDownloadingIds(prev => new Set([...prev, submissionId]));

    try {
      // Fetch the full report data
      const reportRes = await fetch(`/api/reports/${submissionId}`);
      const reportData = await reportRes.json();

      if (!reportData.submission || !reportData.report) {
        throw new Error("Report data not found");
      }

      // Generate PDF
      const pdfRes = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission: reportData.submission,
          report: reportData.report,
          totalScore: reportData.totalScore,
          totalMarks: reportData.totalMarks,
          paperData: reportData.paperData,
        }),
      });

      if (!pdfRes.ok) throw new Error("PDF generation failed");

      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DASES_Report_${student.enrollment_no}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      // Remove from downloading
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };


  return (

    <>
      <Header />




      <div className={styles.container}>
        <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BookOpen size={32} /> Evaluation Reports by Test
        </h1>
        <p className={styles.subtitle}>
          Explore student results categorized by each paper/test.
        </p>

        {groupedReports.map((paper) => (
          <div key={paper.paper_id} className={styles.paperSection}>
            <div className={styles.paperHeader}>
              <h2>
                {paper.subject_name}{" "}
                <span className={styles.examType}>
                  ({paper.exam_type} - {paper.exam_month_year})
                </span>
              </h2>
              <p>
                {paper.program} | Semester {paper.semester}
              </p>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Enrollment No</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Submitted</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paper.students.map((s) => (
                  <tr key={s.submission_id}>
                    <td>{s.student_name}</td>
                    <td>{s.enrollment_no}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${s.status === "Completed"
                          ? styles.completed
                          : s.status === "Pending"
                            ? styles.pending
                            : styles.inProgress
                          }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td>
                      {s.score}/{s.total}
                    </td>
                    <td>
                      {new Date(s.submitted_at).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      {new Date(s.updated_at).toLocaleDateString("en-IN")}
                    </td>


                    <td className={styles.actionsCell}>
                      <Link href={`/reports/${s.submission_id}`}>
                        <button className={styles.viewButton}>View Report</button>
                      </Link>
                      <button
                        className={styles.downloadButton}
                        onClick={() => handleDownloadPDF(s, paper)}
                        disabled={downloadingIds.has(s.submission_id)}
                      >
                        {downloadingIds.has(s.submission_id) ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Loader2 className="animate-spin" size={14} /> Generating...
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Download size={14} /> PDF
                          </span>
                        )}
                      </button>
                      <button
                        className={styles.shareButton}
                        onClick={() => handleShareResults(s)}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Share2 size={14} /> Share
                        </span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

    </>

  );
}
