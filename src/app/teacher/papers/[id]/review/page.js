// src/app/teacher/papers/[id]/review/page.js
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import { downloadPaperAsPDF } from "@/utils/pdfGenerator";
import { downloadCompleteQuestionPaper } from "@/utils/completePdfGenerator";
import styles from "./ReviewPage.module.css";

export default function ReviewPage() {
  const { id } = useParams();
  const [paper, setPaper] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchPaper() {
      const res = await fetch(`/api/papers/${id}`);
      const { success, data } = await res.json();
      if (success) {
        const normalized = {
          ...data,
          paper_data: {
            ...(data.paper_data || {}),
            questions: (data.paper_data?.questions || []).map((q) => ({
              ...q,
              images: q.images || [],
              isOr: q.isOr || false, // 🟢 NEW - ensure default flag
              samples: (q.samples || []).map((s) => ({
                ...s,
                instructionImages: s.instructionImages || [],
                answerImages: s.answerImages || [],
                rubric: s.rubric || { criteria: [] },
              })),
            })),
          },
        };
        setPaper(normalized);
      }
    }
    fetchPaper();
  }, [id]);

  if (!paper) {
    return <div className={styles.loadingContainer}>Loading paper...</div>;
  }

  const questions = paper.paper_data?.questions || [];

  const handleFinalize = async () => {
    if (!confirm("Finalize this paper? After this, you cannot edit further.")) return;

    const res = await fetch(`/api/papers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paper_data: paper.paper_data,
        status: "final",
        finalized_at: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      alert("✅ Paper finalized successfully!");
      router.push("/teacher/dashboard");
    } else {
      alert("❌ Error finalizing paper.");
    }
  };

  // 🟢 NEW: Helper to render one question block (for reuse)
  const renderQuestionBlock = (q, idx) => (
    <div key={q.qid || idx} className={`${styles.questionCard} ${styles.slideIn}`}>
      <div className={styles.questionHeader}>
        <div className={styles.questionNumber}>Q{idx + 1}</div>
        <div><Latex>{q.text}</Latex></div>
      </div>

      <div className={styles.marksTag}>{q.marks} marks</div>

      {q.images?.length > 0 && (
        <div className={styles.imageGrid}>
          {q.images.map((imagePath, i) => (
            <img
              key={i}
              src={imagePath}
              className={styles.questionImage}
              alt={`Q${idx + 1}-img${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Sample Answers */}
      {q.samples?.length > 0 && (
        <div className={styles.samplesContainer}>
          <h4 className={styles.samplesTitle}>Sample Answers</h4>
          {q.samples.map((s, si) => (
            <div key={s.id || si} className={styles.sampleCard}>
              <h5 className={styles.sampleHeader}>Sample Answer {si + 1}</h5>

              {s.answer && (
                <div className={styles.sampleSection}>
                  <div className={styles.sampleSectionTitle}>Answer:</div>
                  <div className={styles.sampleContent}>
                    <Latex>{s.answer}</Latex>
                  </div>
                </div>
              )}

              {s.rubric?.criteria?.length > 0 && (
                <div className={styles.rubricContainer}>
                  <div className={styles.rubricTitle}>Rubric</div>
                  <table className={styles.rubricTable}>
                    <thead>
                      <tr>
                        <th>Criterion</th>
                        <th>Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.rubric.criteria.map((c, ci) => (
                        <tr key={ci}>
                          <td><Latex>{c.criterion}</Latex></td>
                          <td>{c.weight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {q.suggestions && (
        <div className={styles.suggestion}>
          <div className={styles.suggestionTitle}>Suggestion:</div>
          <Latex>{q.suggestions}</Latex>
        </div>
      )}
    </div>
  );

  // 🟢 NEW: Render grouped OR questions
  const renderQuestionsWithOr = () => {
    const rendered = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      // If this question is marked OR, show this + the next one together
      if (q.isOr && i + 1 < questions.length) {
        rendered.push(
          <div key={`or-group-${i}`} className={styles.orGroup}>
            {renderQuestionBlock(q, i)}

            <div className={styles.orDivider}>— OR —</div> {/* 🟢 NEW OR Divider */}

            {renderQuestionBlock(questions[i + 1], i + 1)}

            <div className={styles.orNote}>
              <em>Attempt any one of the above questions.</em>
            </div>
          </div>
        );
        i++; // Skip the next question, already rendered as OR pair
      } else if (!questions[i - 1]?.isOr) {
        // Normal question (not part of an OR pair)
        rendered.push(renderQuestionBlock(q, i));
      }
    }
    return rendered;
  };

  return (
    <div className={styles.container}>
      {/* Sidebar workflow */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>Paper Workflow</h2>
        <ul className={styles.steps}>
          <li className={styles.completed}>1. Upload & Extract</li>
          <li className={styles.completed}>2. Build & Edit Paper</li>
          <li className={styles.active}>3. Review & Finalize</li>
        </ul>
      </aside>

      <main className={styles.main}>
        <h1 className={styles.header}>📑 Review Paper</h1>

        {/* Paper Metadata */}
        <div className={`${styles.paperMetaCard} ${styles.fadeIn}`}>
          <div className={styles.metaGrid}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Subject:</span>
              <span className={styles.metaValue}>
                {paper.subject_name} ({paper.subject_code})
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Faculty:</span>
              <span className={styles.metaValue}>{paper.faculty_name}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Year:</span>
              <span className={styles.metaValue}>{paper.year}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Status:</span>
              <span
                className={`${styles.metaValue} ${
                  paper.status === "final" ? styles.statusActive : styles.statusPending
                }`}
              >
                {paper.status}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Created:</span>
              <span className={styles.metaValue}>
                {new Date(paper.created_at).toLocaleDateString()}
              </span>
            </div>
            {paper.finalized_at && (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Finalized:</span>
                <span className={styles.metaValue}>
                  {new Date(paper.finalized_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 🟢 OR-Enhanced Questions Rendering */}
        {renderQuestionsWithOr()}

        {/* Action Buttons */}
        <div className={styles.buttonContainer}>
          <button
            className={`${styles.buttonBase} ${styles.secondaryButton}`}
            onClick={() => router.push(`/teacher/papers/${id}`)}
          >
            ✏️ Edit Again
          </button>

          <button
            className={`${styles.buttonBase} ${styles.primaryButton}`}
            onClick={() => downloadPaperAsPDF(paper)}
          >
            📄 Download PDF
          </button>

          <button
            className={`${styles.buttonBase} ${styles.primaryButton}`}
            onClick={() => downloadCompleteQuestionPaper(paper, { includeAll: true })}
          >
            📋 Download Complete Paper
          </button>

          {paper.status !== "final" && (
            <button
              className={`${styles.buttonBase} ${styles.finalizeButton}`}
              onClick={handleFinalize}
            >
              ✅ Finalize & Done
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
