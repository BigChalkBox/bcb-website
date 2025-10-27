"use client";

import React, { useEffect, useState, use } from "react";
import styles from "./Report.module.css";
import { createClient } from "@supabase/supabase-js";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import Image from "next/image";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ReportPage({ params }) {
  const { submissionId } = use(params);
  const [report, setReport] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [paperData, setPaperData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: Get evaluation + submission + paper_id
        const { data: evalData, error: evalError } = await supabase
          .from("evaluations")
          .select(
            `
            evaluation_results,
            submissions (
              id,
              student_name,
              enrollment_no,
              email,
              paper_name,
              submitted_at,
              paper_id
            )
          `
          )
          .eq("submission_id", submissionId)
          .single();

        if (evalError) throw evalError;

        const parsedReport =
          typeof evalData.evaluation_results === "string"
            ? JSON.parse(evalData.evaluation_results)
            : evalData.evaluation_results;

        setReport(parsedReport);
        const subData = evalData.submissions;
        setSubmission(subData);

        // Step 2: Get paper_data from papers table
        const { data: paperDataRes, error: paperError } = await supabase
          .from("papers")
          .select("paper_data")
          .eq("id", subData.paper_id)
          .single();

        if (paperError) throw paperError;

        setPaperData(
          typeof paperDataRes.paper_data === "string"
            ? JSON.parse(paperDataRes.paper_data)
            : paperDataRes.paper_data
        );
      } catch (err) {
        console.error("Error fetching report data:", err);
        setReport(null);
        setSubmission(null);
        setPaperData(null);
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
        <div className={styles.errorIcon}>⚠️</div>
        <h2>Report Not Found</h2>
        <p>No evaluation report or paper data found for this submission.</p>
      </div>
    );

  // 🧩 Link evaluation_results with paper_data for isOr logic
  const questionsMap = new Map();
  for (const q of paperData.questions || []) questionsMap.set(q.qid, q);

  const processed = new Set();
  let totalMarks = 0;
  let totalScore = 0;

  // 🧮 Marks Calculation considering OR questions
  for (let i = 0; i < report.results.length; i++) {
    if (processed.has(i)) continue;
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
      processed.add(i + 1);
    } else {
      totalMarks += q.marks || 0;
      totalScore += q.evaluation?.suggestedScore || 0;
    }
  }

  totalScore = totalScore.toFixed(2);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Evaluation Report</h1>
            <p className={styles.subtitle}>Detailed Assessment & Feedback</p>
          </div>
        </div>

        {/* 🧾 Student Information */}
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

        {/* Summary Section */}
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

        {/* 🧠 Detailed Evaluation */}
        <div className={styles.questionsSection}>
          <div className={styles.sectionHeader}>
            <h2>Detailed Evaluation</h2>
          </div>

          {report.results.map((q, idx) => {
            if (processed.has(idx)) return null;
            const paperQ = questionsMap.get(q.qid);

            if (paperQ?.isOr) {
              const nextQ = report.results[idx + 1];
              processed.add(idx + 1);
              return (
                <div key={idx} className={styles.orBox}>
                  <p className={styles.orHeader}>Attempt any one of the following (OR)</p>
                  {[q, nextQ].map((ques, i) => {
                    const attempted = ques.studentImages?.length > 0;
                    return (
                      <div
                        key={i}
                        className={`${styles.questionCard} ${
                          attempted ? styles.attempted : styles.notAttempted
                        }`}
                      >
                        <div className={styles.qHeader}>
                          <div className={styles.qHeaderLeft}>
                            <span className={styles.qNum}>
                              Question {ques.qNumber}
                            </span>
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

                        <p
                          className={
                            attempted
                              ? styles.attemptedLabel
                              : styles.notAttemptedLabel
                          }
                        >
                          {attempted ? "✅ Attempted" : "❌ Not Attempted"}
                        </p>

                        {/* Criteria Breakdown */}
                        {ques.evaluation?.criteria?.length > 0 && (
                          <div className={styles.criteriaSection}>
                            <h4>Evaluation Breakdown</h4>
                            <div className={styles.criteriaList}>
                              {ques.evaluation.criteria.map((c, i) => (
                                <div key={i} className={styles.criteriaItem}>
                                  <div className={styles.criteriaHeader}>
                                    <span className={styles.criterionName}>
                                      {c.criterion}
                                    </span>
                                    <span className={styles.criterionMarks}>
                                      {c.obtained_marks}/{c.max_marks}
                                    </span>
                                  </div>
                                  <div className={styles.criterionFeedback}>
                                    {c.feedback}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {ques.evaluation?.feedback && (
                          <div className={styles.feedbackBox}>
                            <h4>Overall Feedback</h4>
                            <p>{ques.evaluation.feedback}</p>
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
                    <span className={styles.qNum}>Question {q.qNumber}</span>
                    <span className={styles.qMarks}>{q.marks} marks</span>
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

                {/* Criteria */}
                {q.evaluation?.criteria?.length > 0 && (
                  <div className={styles.criteriaSection}>
                    <h4>Evaluation Breakdown</h4>
                    <div className={styles.criteriaList}>
                      {q.evaluation.criteria.map((c, i) => (
                        <div key={i} className={styles.criteriaItem}>
                          <div className={styles.criteriaHeader}>
                            <span className={styles.criterionName}>{c.criterion}</span>
                            <span className={styles.criterionMarks}>
                              {c.obtained_marks}/{c.max_marks}
                            </span>
                          </div>
                          <div className={styles.criterionFeedback}>{c.feedback}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {q.evaluation?.feedback && (
                  <div className={styles.feedbackBox}>
                    <h4>Overall Feedback</h4>
                    <p>{q.evaluation.feedback}</p>
                  </div>
                )}

                {/* Images */}
                {q.studentImages?.length > 0 && (
                  <div className={styles.imagesSection}>
                    <h4>Answer Sheets ({q.studentImages.length})</h4>
                    <div className={styles.imageGrid}>
                      {q.studentImages.map((img, i) => {
                        const imgSrc = `https://crqheuuvsgtzejaestyj.supabase.co/storage/v1/object/public/submissions/${img}`;
                        return (
                          <div
                            key={i}
                            className={styles.imageThumb}
                            onClick={() => openLightbox(imgSrc)}
                          >
                            <Image src={imgSrc} fill alt={`Answer page ${i + 1}`} />
                            <div className={styles.imageOverlay}>
                              <span>🔍 Click to enlarge</span>
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
          <p>Evaluated on {new Date(report.evaluatedAt).toLocaleString("en-IN")}</p>
          <p className={styles.footerNote}>
            This is an automated evaluation report. For queries, contact your instructor.
          </p>
        </div>
      </div>

      {lightboxImage && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <button className={styles.lightboxClose} onClick={closeLightbox}>
            ✕
          </button>
          <Image
            src={lightboxImage}
            fill
            alt="Full size view"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
