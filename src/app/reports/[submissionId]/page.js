"use client";

import React, { useEffect, useState, use } from "react";
import styles from "./Report.module.css";
import Latex from "react-latex-next";
import { AlertTriangle, Loader2, Download, CheckCircle2, XCircle, Search } from "lucide-react";
import "katex/dist/katex.min.css";
import Image from "next/image";

export default function ReportPage({ params }) {
  const { submissionId } = use(params);
  const [report, setReport] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [paperData, setPaperData] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showObjectiveSheets, setShowObjectiveSheets] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Call the API route instead of querying Supabase directly
        const response = await fetch(`/api/reports/${submissionId}`);

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setReport(data.report);
        setSubmission(data.submission);
        setPaperData(data.paperData);
        setDetectionResult(data.detectionResult);
      } catch (err) {
        console.error("Error fetching report data:", err);
        setReport(null);
        setSubmission(null);
        setPaperData(null);
        setDetectionResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [submissionId]);

  const openLightbox = (imageSrc) => {
    setLightboxImage(imageSrc);
    document.body.style.overflow = "hidden";
  };
  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = "unset";
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (loading)
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.loader}></div>
        <p>Loading detailed report...</p>
      </div>
    );

  if (!report || !paperData)
    return (
      <div className={styles.error}>
        <div className={styles.errorIcon}>
          <AlertTriangle size={48} style={{ color: '#f59e0b' }} />
        </div>
        <h2>Report Not Found</h2>
        <p>No evaluation report or paper data found for this submission.</p>
      </div>
    );

  const questionsMap = new Map();
  for (const q of paperData.questions || []) questionsMap.set(q.qid, q);

  // 🔧 FIX: separate sets
  const processedForMarks = new Set();
  const processedForUI = new Set();

  let totalMarks = 0;
  let totalScore = 0;

  // 🧮 Marks calculation (unchanged logic, safe fix)
  for (let i = 0; i < report.results.length; i++) {
    if (processedForMarks.has(i)) continue;

    const q = report.results[i];
    const paperQ = questionsMap.get(q.qid);

    if (paperQ?.isOr) {
      const nextQ = report.results[i + 1];

      const attempted =
        q.studentImages?.length > 0
          ? q
          : nextQ?.studentImages?.length > 0
            ? nextQ
            : q;

      totalMarks += attempted.marks || 0;
      totalScore += attempted.evaluation?.suggestedScore || 0;

      processedForMarks.add(i + 1);
    } else {
      totalMarks += q.marks || 0;
      totalScore += q.evaluation?.suggestedScore || 0;
    }
  }

  const downloadPDF = async () => {
    try {
      setLoading(true); // Re-use loading state or create a valid one if needed
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission,
          report,
          totalScore,
          totalMarks,
          paperData,
          detectionResult,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DASES_Report_${submission.enrollment_no}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download PDF. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderAnswerComparison = (ques) => {
    // Only for objective-like questions that have single answer props
    if (ques.studentAnswer === undefined || ques.correctAnswer === undefined) return null;

    // Check correctness (case-insensitive)
    const isCorrect = String(ques.studentAnswer || "").trim().toLowerCase() === String(ques.correctAnswer || "").trim().toLowerCase();

    return (
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2',
        border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
        borderRadius: '8px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '2px' }}>Student Answer</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: isCorrect ? '#166534' : '#dc2626' }}>
            {ques.studentAnswer || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not answered</span>}
            {isCorrect ? ' ✅' : ' ❌'}
          </span>
        </div>

        <div style={{ width: '1px', height: '32px', background: isCorrect ? '#bbf7d0' : '#fecaca' }}></div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '2px' }}>Expected Answer</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#166534' }}>
            {ques.correctAnswer}
          </span>
        </div>
      </div>
    );
  };

  const objectivePages = detectionResult?.pages?.filter(p => p.page_type === 'objective') || [];

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerRow}>
              <div className={styles.headerText}>
                <h1 className={styles.title}>Evaluation Report</h1>
                <p className={styles.subtitle}>Detailed Assessment & Feedback</p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={downloadPDF} className={styles.downloadBtn} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {loading ? (
                    <><Loader2 className="animate-spin" size={16} /> Generating PDF...</>
                  ) : (
                    <><Download size={16} /> Download Report PDF</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {submission && (
          <div className={styles.studentInfo}>
            <div className={styles.sectionHeader}>
              <h2>Student Information</h2>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Name</span>
                <span className={styles.infoValue}>{submission.student_name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Enrollment No</span>
                <span className={styles.infoValue}>{submission.enrollment_no}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{submission.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Paper</span>
                <span className={styles.infoValue}>{submission.paper_name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Submitted</span>
                <span className={styles.infoValue}>
                  {new Date(submission.submitted_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.summary}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Total Questions</div>
            <div className={styles.summaryValue}>{report.results?.length}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Maximum Marks</div>
            <div className={styles.summaryValue}>{totalMarks}</div>
          </div>
          <div className={`${styles.summaryCard} ${styles.scoreCard}`}>
            <div className={styles.summaryLabel}>Total Score</div>
            <div className={styles.summaryValue}>{totalScore}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Percentage</div>
            <div className={styles.summaryValue}>
              {totalMarks > 0
                ? ((totalScore / totalMarks) * 100).toFixed(1)
                : 0}
              %
            </div>
          </div>
        </div>

        <div className={styles.questionsSection}>
          <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h2>Detailed Evaluation</h2>

            {objectivePages.length > 0 && (
              <button
                onClick={() => setShowObjectiveSheets(!showObjectiveSheets)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#f3f4f6',
                  color: '#1f2937',
                  border: '1px solid #e5e7eb',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <Search size={16} /> {showObjectiveSheets ? 'Hide' : 'View'} Objective Sheets ({objectivePages.length})
              </button>
            )}
          </div>

          {showObjectiveSheets && objectivePages.length > 0 && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Objective Answer Sheets</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                {objectivePages.map((page, idx) => {
                  const imgSrc = `https://crqheuuvsgtzejaestyj.supabase.co/storage/v1/object/public/submissions/${page.uploaded_to}`;
                  return (
                    <div
                      key={idx}
                      onClick={() => openLightbox(imgSrc)}
                      style={{
                        position: 'relative',
                        aspectRatio: '0.7',
                        cursor: 'pointer',
                        border: '1px solid #eee',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}
                    >
                      <Image
                        src={imgSrc}
                        fill
                        style={{ objectFit: 'cover' }}
                        alt={`Objective Page ${idx + 1}`}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        fontSize: '10px',
                        padding: '4px',
                        textAlign: 'center'
                      }}>
                        Page {page.page + 1}
                      </div>
                      <div className={styles.imageOverlay}>
                        <span><Search size={14} /></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {report.results.map((q, idx) => {
            if (processedForUI.has(idx)) return null;

            const paperQ = questionsMap.get(q.qid);

            if (paperQ?.isOr) {
              const nextQ = report.results[idx + 1];
              processedForUI.add(idx + 1);

              return (
                <div key={idx} className={styles.orBox}>
                  <p className={styles.orHeader}>
                    Attempt any one of the following (OR)
                  </p>

                  {[q, nextQ].map((ques, i) => {
                    const attempted = ques.studentImages?.length > 0;

                    return (
                      <div
                        key={i}
                        className={`${styles.questionCard} ${attempted
                          ? styles.attempted
                          : styles.notAttempted
                          }`}
                      >
                        <div className={styles.qHeader}>
                          <div className={styles.qHeaderLeft}>
                            <span className={styles.qNum}>
                              Question {ques.qNumber}
                            </span>
                            <span className={styles.qMarks}>
                              {ques.marks} marks
                            </span>
                          </div>
                          <div className={styles.qScore}>
                            <span className={styles.scoreLabel}>Score:</span>
                            <span className={styles.scoreValue}>
                              {ques.evaluation?.suggestedScore ?? "N/A"}/
                              {ques.marks}
                            </span>
                          </div>
                        </div>

                        <div className={styles.qText}>
                          <Latex>{ques.question}</Latex>
                        </div>

                        {renderAnswerComparison(ques)}

                        <p
                          className={
                            attempted
                              ? styles.attemptedLabel
                              : styles.notAttemptedLabel
                          }
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {attempted ? (
                              <><CheckCircle2 size={16} style={{ color: '#10b981' }} /> Attempted</>
                            ) : (
                              <><XCircle size={16} style={{ color: '#ef4444' }} /> Not Attempted</>
                            )}
                          </span>
                        </p>

                        {ques.evaluation?.criteria?.length > 0 && (
                          <div className={styles.criteriaSection}>
                            <h4>Evaluation Breakdown</h4>
                            <div className={styles.criteriaList}>
                              {ques.evaluation.criteria.map((c, i) => {
                                const hasAnswers = c.studentAnswer !== undefined || c.correctAnswer !== undefined;
                                const isCorrect = hasAnswers && String(c.studentAnswer || "").trim().toLowerCase() === String(c.correctAnswer || "").trim().toLowerCase();

                                return (
                                  <div
                                    key={i}
                                    className={styles.criteriaItem}
                                  >
                                    <div className={styles.criteriaHeader}>
                                      <span className={styles.criterionName}>
                                        {c.criterion}
                                      </span>
                                      <span className={styles.criterionMarks}>
                                        {c.obtained_marks}/{c.max_marks}
                                      </span>
                                    </div>

                                    {hasAnswers && (
                                      <div style={{
                                        display: 'flex',
                                        gap: '16px',
                                        padding: '8px 12px',
                                        marginTop: '8px',
                                        backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2',
                                        border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
                                        borderRadius: '6px',
                                        fontSize: '13px'
                                      }}>
                                        <div>
                                          <span style={{ fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Student: </span>
                                          <span style={{ fontWeight: 700, color: isCorrect ? '#166534' : '#dc2626' }}>
                                            {c.studentAnswer || <em style={{ color: '#9ca3af' }}>No answer</em>}
                                            {isCorrect ? ' ✅' : ' ❌'}
                                          </span>
                                        </div>
                                        <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: '16px' }}>
                                          <span style={{ fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Expected: </span>
                                          <span style={{ fontWeight: 700, color: '#166534' }}>{c.correctAnswer}</span>
                                        </div>
                                      </div>
                                    )}

                                    {!hasAnswers && (
                                      <div className={styles.criterionFeedback}>
                                        {c.feedback}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {ques.evaluation?.feedback && (
                          <div className={styles.feedbackBox}>
                            <h4>Overall Feedback</h4>
                            <p>{ques.evaluation.feedback}</p>
                          </div>
                        )}

                        {ques.studentImages?.length > 0 && (
                          <div className={styles.imagesSection}>
                            <h4>
                              Answer Sheets (
                              {ques.studentImages.length})
                            </h4>
                            <div className={styles.imageGrid}>
                              {ques.studentImages.map((img, i) => {
                                const imgSrc = `https://crqheuuvsgtzejaestyj.supabase.co/storage/v1/object/public/submissions/${img}`;
                                return (
                                  <div
                                    key={i}
                                    className={styles.imageThumb}
                                    onClick={() =>
                                      openLightbox(imgSrc)
                                    }
                                  >
                                    <Image
                                      src={imgSrc}
                                      fill
                                      alt={`Answer page ${i + 1}`}
                                    />
                                    <div
                                      className={
                                        styles.imageOverlay
                                      }
                                    >
                                      <span>
                                        🔍 Click to enlarge
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            return (
              <div key={q.qid || idx} className={styles.questionCard}>
                <div className={styles.qHeader}>
                  <div className={styles.qHeaderLeft}>
                    <span className={styles.qNum}>
                      Question {q.qNumber}
                    </span>
                    <span className={styles.qMarks}>
                      {q.marks} marks
                    </span>
                  </div>
                  <div className={styles.qScore}>
                    <span className={styles.scoreLabel}>Score:</span>
                    <span className={styles.scoreValue}>
                      {q.evaluation?.suggestedScore ?? "N/A"}/{q.marks}
                    </span>
                  </div>
                </div>

                <div className={styles.qText}>
                  <Latex>{q.question}</Latex>
                </div>

                {renderAnswerComparison(q)}

                {q.evaluation?.criteria?.length > 0 && (
                  <div className={styles.criteriaSection}>
                    <h4>Evaluation Breakdown</h4>
                    <div className={styles.criteriaList}>
                      {q.evaluation.criteria.map((c, i) => {
                        const hasAnswers = c.studentAnswer !== undefined || c.correctAnswer !== undefined;
                        const isCorrect = hasAnswers && String(c.studentAnswer || "").trim().toLowerCase() === String(c.correctAnswer || "").trim().toLowerCase();

                        return (
                          <div
                            key={i}
                            className={styles.criteriaItem}
                          >
                            <div className={styles.criteriaHeader}>
                              <span className={styles.criterionName}>
                                {c.criterion}
                              </span>
                              <span className={styles.criterionMarks}>
                                {c.obtained_marks}/{c.max_marks}
                              </span>
                            </div>

                            {hasAnswers && (
                              <div style={{
                                display: 'flex',
                                gap: '16px',
                                padding: '8px 12px',
                                marginTop: '8px',
                                backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2',
                                border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
                                borderRadius: '6px',
                                fontSize: '13px'
                              }}>
                                <div>
                                  <span style={{ fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Student: </span>
                                  <span style={{ fontWeight: 700, color: isCorrect ? '#166534' : '#dc2626' }}>
                                    {c.studentAnswer || <em style={{ color: '#9ca3af' }}>No answer</em>}
                                    {isCorrect ? ' ✅' : ' ❌'}
                                  </span>
                                </div>
                                <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: '16px' }}>
                                  <span style={{ fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Expected: </span>
                                  <span style={{ fontWeight: 700, color: '#166534' }}>{c.correctAnswer}</span>
                                </div>
                              </div>
                            )}

                            {!hasAnswers && (
                              <div className={styles.criterionFeedback}>
                                {c.feedback}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {q.evaluation?.feedback && (
                  <div className={styles.feedbackBox}>
                    <h4>Overall Feedback</h4>
                    <p>{q.evaluation.feedback}</p>
                  </div>
                )}

                {q.studentImages?.length > 0 && (
                  <div className={styles.imagesSection}>
                    <h4>
                      Answer Sheets ({q.studentImages.length})
                    </h4>
                    <div className={styles.imageGrid}>
                      {q.studentImages.map((img, i) => {
                        const imgSrc = `https://crqheuuvsgtzejaestyj.supabase.co/storage/v1/object/public/submissions/${img}`;
                        return (
                          <div
                            key={i}
                            className={styles.imageThumb}
                            onClick={() =>
                              openLightbox(imgSrc)
                            }
                          >
                            <Image
                              src={imgSrc}
                              fill
                              alt={`Answer page ${i + 1}`}
                            />
                            <div className={styles.imageOverlay}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Search size={14} /> Click to enlarge
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <p>
            Evaluated on{" "}
            {new Date(report.evaluatedAt).toLocaleString("en-IN")}
          </p>
          <p className={styles.footerNote}>
            This is an automated evaluation report. For queries,
            contact your instructor.
          </p>
        </div>
      </div >

      {lightboxImage && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <button
            className={styles.lightboxClose}
            onClick={closeLightbox}
          >
            ✕
          </button>
          <Image
            src={lightboxImage}
            fill
            alt="Full size view"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )
      }
    </>
  );
}
