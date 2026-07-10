"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import { Download, CheckCircle2, XCircle, Search } from "lucide-react";
import styles from "./ReportView.module.css";

function renderAnswerComparison(ques) {
  if (ques.studentAnswer === undefined || ques.correctAnswer === undefined) return null;

  const isCorrect =
    String(ques.studentAnswer || "").trim().toLowerCase() ===
    String(ques.correctAnswer || "").trim().toLowerCase();

  return (
    <div
      style={{
        marginTop: "16px",
        padding: "12px 16px",
        backgroundColor: isCorrect ? "#f0fdf4" : "#fef2f2",
        border: `1px solid ${isCorrect ? "#bbf7d0" : "#fecaca"}`,
        borderRadius: "8px",
        display: "flex",
        flexWrap: "wrap",
        gap: "24px",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", marginBottom: "2px" }}>
          Student Answer
        </span>
        <span style={{ fontSize: "16px", fontWeight: 700, color: isCorrect ? "#166534" : "#dc2626" }}>
          {ques.studentAnswer || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Not answered</span>}
          {isCorrect ? " ✅" : " ❌"}
        </span>
      </div>
      <div style={{ width: "1px", height: "32px", background: isCorrect ? "#bbf7d0" : "#fecaca" }}></div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", marginBottom: "2px" }}>
          Expected Answer
        </span>
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#166534" }}>{ques.correctAnswer}</span>
      </div>
    </div>
  );
}

function QuestionCard({ ques, orState, onImageClick }) {
  const attempted = orState ? ques.studentImages?.length > 0 : true;

  return (
    <div className={`${styles.questionCard} ${orState ? (attempted ? styles.attempted : styles.notAttempted) : ""}`}>
      <div className={styles.qHeader}>
        <div className={styles.qHeaderLeft}>
          <span className={styles.qNum}>Question {ques.qNumber}</span>
          <span className={styles.qMarks}>{ques.marks} marks</span>
        </div>
        <div className={styles.qScore}>
          <span className={styles.scoreLabel}>Score:</span>
          <span className={styles.scoreValue}>
            {ques.evaluation?.suggestedScore ?? "N/A"}/{ques.marks}
          </span>
        </div>
      </div>

      <div className={styles.qText}>
        <Latex>{ques.question}</Latex>
      </div>

      {renderAnswerComparison(ques)}

      {orState && (
        <p className={attempted ? styles.attemptedLabel : styles.notAttemptedLabel}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {attempted ? (
              <>
                <CheckCircle2 size={16} style={{ color: "#10b981" }} /> Attempted
              </>
            ) : (
              <>
                <XCircle size={16} style={{ color: "#ef4444" }} /> Not Attempted
              </>
            )}
          </span>
        </p>
      )}

      {ques.evaluation?.criteria?.length > 0 && (
        <div className={styles.criteriaSection}>
          <h4>Evaluation Breakdown</h4>
          <div className={styles.criteriaList}>
            {ques.evaluation.criteria.map((c, i) => {
              const hasAnswers = c.studentAnswer !== undefined || c.correctAnswer !== undefined;
              const isCorrect =
                hasAnswers &&
                String(c.studentAnswer || "").trim().toLowerCase() ===
                  String(c.correctAnswer || "").trim().toLowerCase();

              return (
                <div key={i} className={styles.criteriaItem}>
                  <div className={styles.criteriaHeader}>
                    <span className={styles.criterionName}>{c.criterion}</span>
                    <span className={styles.criterionMarks}>
                      {c.obtained_marks}/{c.max_marks}
                    </span>
                  </div>

                  {hasAnswers && (
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        padding: "8px 12px",
                        marginTop: "8px",
                        backgroundColor: isCorrect ? "#f0fdf4" : "#fef2f2",
                        border: `1px solid ${isCorrect ? "#bbf7d0" : "#fecaca"}`,
                        borderRadius: "6px",
                        fontSize: "13px",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, color: "#6b7280", fontSize: "11px", textTransform: "uppercase" }}>
                          Student:{" "}
                        </span>
                        <span style={{ fontWeight: 700, color: isCorrect ? "#166534" : "#dc2626" }}>
                          {c.studentAnswer || <em style={{ color: "#9ca3af" }}>No answer</em>}
                          {isCorrect ? " ✅" : " ❌"}
                        </span>
                      </div>
                      <div style={{ borderLeft: "1px solid #e5e7eb", paddingLeft: "16px" }}>
                        <span style={{ fontWeight: 600, color: "#6b7280", fontSize: "11px", textTransform: "uppercase" }}>
                          Expected:{" "}
                        </span>
                        <span style={{ fontWeight: 700, color: "#166534" }}>{c.correctAnswer}</span>
                      </div>
                    </div>
                  )}

                  {!hasAnswers && <div className={styles.criterionFeedback}>{c.feedback}</div>}
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
          <h4>Answer Sheets ({ques.studentImages.length})</h4>
          <div className={styles.imageGrid}>
            {ques.studentImages.map((imgSrc, i) => (
              <div key={i} className={styles.imageThumb} onClick={() => onImageClick(imgSrc)}>
                <Image src={imgSrc} fill alt={`Answer page ${i + 1}`} />
                <div className={styles.imageOverlay}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Search size={14} /> Click to enlarge
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportView({ data, downloadHref }) {
  const { report, submission, paperData } = data;
  const [lightboxImage, setLightboxImage] = useState(null);

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

  const questionsMap = new Map();
  for (const q of paperData.questions || []) questionsMap.set(q.qid, q);

  const processedForMarks = new Set();
  const processedForUI = new Set();

  let totalMarks = 0;
  let totalScore = 0;

  for (let i = 0; i < report.results.length; i++) {
    if (processedForMarks.has(i)) continue;

    const q = report.results[i];
    const paperQ = questionsMap.get(q.qid);

    if (paperQ?.isOr) {
      const nextQ = report.results[i + 1];
      const attempted = q.studentImages?.length > 0 ? q : nextQ?.studentImages?.length > 0 ? nextQ : q;

      totalMarks += attempted.marks || 0;
      totalScore += attempted.evaluation?.suggestedScore || 0;

      processedForMarks.add(i + 1);
    } else {
      totalMarks += q.marks || 0;
      totalScore += q.evaluation?.suggestedScore || 0;
    }
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerRow}>
              <div className={styles.headerText}>
                <h1 className={styles.title}>Evaluation Report</h1>
                <p className={styles.subtitle}>Detailed Assessment &amp; Feedback</p>
              </div>

              <a
                href={downloadHref}
                download
                className={styles.downloadBtn}
                style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
              >
                <Download size={16} /> Download Report PDF
              </a>
            </div>
          </div>
        </div>

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
              {totalMarks > 0 ? ((totalScore / totalMarks) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        <div className={styles.questionsSection}>
          <div className={styles.sectionHeader}>
            <h2>Detailed Evaluation</h2>
          </div>

          {report.results.map((q, idx) => {
            if (processedForUI.has(idx)) return null;

            const paperQ = questionsMap.get(q.qid);

            if (paperQ?.isOr) {
              const nextQ = report.results[idx + 1];
              processedForUI.add(idx + 1);

              return (
                <div key={idx} className={styles.orBox}>
                  <p className={styles.orHeader}>Attempt any one of the following (OR)</p>
                  {[q, nextQ].map((ques, i) => (
                    <QuestionCard key={i} ques={ques} orState={true} onImageClick={openLightbox} />
                  ))}
                </div>
              );
            }

            return <QuestionCard key={q.qid || idx} ques={q} orState={false} onImageClick={openLightbox} />;
          })}
        </div>

        <div className={styles.footer}>
          <p>Evaluated on {new Date(report.evaluatedAt).toLocaleString("en-IN")}</p>
          <p className={styles.footerNote}>This is a sample automated evaluation report generated by DASES.</p>
        </div>
      </div>

      {lightboxImage && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <button className={styles.lightboxClose} onClick={closeLightbox}>
            ✕
          </button>
          <Image src={lightboxImage} fill alt="Full size view" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
