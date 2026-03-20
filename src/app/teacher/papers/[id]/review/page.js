// src/app/teacher/papers/[id]/review/page.js
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import { FileText, CheckCircle2, XCircle, Edit, ClipboardList, Search, BarChart3, PenLine, Lightbulb, Zap, AlertTriangle, FileQuestion } from "lucide-react";
import { downloadPaperAsPDF } from "@/utils/pdfGenerator";
import { downloadCompleteQuestionPaper } from "@/utils/completePdfGenerator";
import styles from "./ReviewPage.module.css";
import Image from "next/image";

// ============================================================
// ROBUST SmartLatex Component - Handles ALL edge cases
// ============================================================
const SmartLatex = ({ children }) => {
  if (!children) return null;

  let text = String(children);

  // STEP 1: Recursively extract from JSON (handles nested JSON strings)
  const extractFromJSON = (str, depth = 0) => {
    if (depth > 5 || typeof str !== 'string') return String(str || '');
    const trimmed = str.trim();
    if (!trimmed.startsWith('{')) return str;
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null) {
        const value = parsed.answer1 || parsed.answer2 || parsed.answer ||
          parsed.content || parsed.text || Object.values(parsed)[0];
        if (value && typeof value === 'string') {
          return extractFromJSON(value, depth + 1);
        }
        return value ? String(value) : str;
      }
    } catch (e) { /* Not JSON */ }
    return str;
  };

  text = extractFromJSON(text);

  // STEP 2: Fix ALL escaping issues (order matters!)
  text = text
    .replace(/\\\\n/g, '\n')      // \\n -> newline
    .replace(/\\n/g, '\n')        // \n -> newline
    .replace(/\\\\\\\\/g, '\\')   // \\\\ -> \
    .replace(/\\\$/g, '$')        // \$ -> $
    .replace(/\\t/g, '\t');       // \t -> tab

  // STEP 3: Simplify Lists (Convert to text bullets for readability)
  text = text
    .replace(/\\begin\{itemize\}/g, '\n')
    .replace(/\\end\{itemize\}/g, '\n')
    .replace(/\\begin\{enumerate\}/g, '\n')
    .replace(/\\end\{enumerate\}/g, '\n')
    .replace(/\\item\s*/g, '\n• ');

  // STEP 4: Render Tables as HTML (Manual Parsing)
  // Split by tabular environment to handle tables separately
  const parts = text.split(/(\\begin\{tabular\}(?:\{[^}]*\})?[\s\S]*?\\end\{tabular\})/g);

  return (
    <div className="smart-latex-container" style={{ whiteSpace: 'pre-wrap' }}>
      {parts.map((part, index) => {
        // If it's a table chunk
        if (part.match(/^\\begin\{tabular\}/)) {
          try {
            const content = part.replace(/^\\begin\{tabular\}(?:\{[^}]*\})?/, '').replace(/\\end\{tabular\}$/, '');
            const rows = content.split('\\\\').filter(r => r.trim());
            return (
              <div key={index} style={{ overflowX: 'auto', margin: '12px 0', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '100%', fontSize: '14px' }}>
                  <tbody>
                    {rows.map((row, rIdx) => {
                      const cleanRow = row.replace(/\\hline/g, '').trim();
                      if (!cleanRow) return null;
                      const cols = cleanRow.split('&');
                      return (
                        <tr key={rIdx} style={{ borderBottom: rIdx < rows.length - 1 ? '1px solid #e5e7eb' : 'none', backgroundColor: rIdx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                          {cols.map((col, cIdx) => (
                            <td key={cIdx} style={{ padding: '10px 14px', borderRight: cIdx < cols.length - 1 ? '1px solid #e5e7eb' : 'none', verticalAlign: 'top' }}>
                              <Latex>{col.trim()}</Latex>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          } catch (e) {
            // Fallback if parsing fails
            return <div key={index} style={{ fontFamily: 'monospace', fontSize: '12px', padding: '8px', background: '#eee' }}>{part}</div>;
          }
        }

        // Regular Text (Inline Math)
        if (!part.trim()) return null;

        // Handle code blocks separately if needed, otherwise standard LaTeX
        if (part.includes('\\begin{verbatim}') || part.includes('\\begin{lstlisting}')) {
          return (
            <div key={index} style={{ fontFamily: 'monospace', fontSize: '13px', backgroundColor: '#f6f8fa', padding: '12px', borderRadius: '6px', margin: '8px 0', overflowX: 'auto' }}>
              {part}
            </div>
          );
        }

        return (
          <div key={index} style={{ display: 'inline' }}>
            <Latex>{part}</Latex>
          </div>
        );
      })}
    </div>
  );
};


export default function ReviewPage() {
  const { id } = useParams();
  const [paper, setPaper] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [expandedVariants, setExpandedVariants] = useState({});
  const router = useRouter();

  useEffect(() => {
    async function fetchPaper() {
      const res = await fetch(`/api/papers/${id}`);
      const { success, data } = await res.json();
      if (success) {
        // Debug: Log institute and teacher data
        console.log('Paper data from API:', {
          institute: data.institute,
          teacher_name: data.teacher_name,
          faculty_name: data.faculty_name,
          subject_name: data.subject_name,
          teacher_id: data.teacher_id
        });

        const normalized = {
          ...data,
          paper_data: {
            ...(data.paper_data || {}),
            questions: (data.paper_data?.questions || []).map((q) => ({
              ...q,
              images: q.images || [],
              isOr: q.isOr || false,
              samples: (q.samples || []).map((s) => ({
                ...s,
                instructions: s.instructions || "",
                instructionImages: s.instructionImages || [],
                answerImages: s.answerImages || [],
                rubric: s.rubric || { criteria: [] },
              })),
            })),
          },
        };
        setPaper(normalized);
        setIntelligence(data.intelligence || null);

        // Auto-expand first question
        if (normalized.paper_data.questions.length > 0) {
          setExpandedQuestions({ [normalized.paper_data.questions[0].qid]: true });
        }
      }
    }
    fetchPaper();
  }, [id]);

  const toggleQuestion = (qid) => {
    setExpandedQuestions(prev => ({ ...prev, [qid]: !prev[qid] }));
  };

  const toggleVariant = (sampleId) => {
    setExpandedVariants(prev => ({ ...prev, [sampleId]: !prev[sampleId] }));
  };

  if (!paper) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading paper...</p>
      </div>
    );
  }

  const questions = paper.paper_data?.questions || [];

  // Calculate total marks correctly, accounting for OR pairs
  // For OR pairs, only count marks once (students answer only one question)
  let totalMarks = 0;
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    totalMarks += q.marks || 0;

    // If this is an OR question, skip the next question's marks
    if (q.isOr && i + 1 < questions.length) {
      i++; // Skip next question since it's part of the OR pair
    }
  }

  // Count questions with answers
  const questionsWithAnswers = questions.filter(q => {
    if (q.type === 'objective') return !!q.correctAnswer;
    if (q.type === 'case_study') return q.subParts?.length > 0;
    return q.samples?.length > 0;
  }).length;

  const completionPercent = questions.length > 0 ? Math.round((questionsWithAnswers / questions.length) * 100) : 0;

  const handleFinalize = async () => {
    if (!confirm("Finalize this paper? You won't be able to edit after this.")) return;
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
      alert("Paper finalized!");
      router.push("/teacher/dashboard");
    } else {
      alert("Error finalizing paper.");
    }
  };

  // QuickPass helpers
  const quickpass = intelligence?.quickpass || null;

  const getIssuesForQuestion = (qIndex) => {
    if (!quickpass) return [];
    const qid = `Q${qIndex + 1}`;
    const issues = [];

    const ambiguity = quickpass.ambiguity?.flags?.find(f => f.qid === qid);
    if (ambiguity) issues.push({ type: 'clarity', icon: <Search size={14} />, label: 'Clarity Issue', ...ambiguity });

    const marks = quickpass.marks_effort?.warnings?.find(w => w.qid === qid);
    if (marks) issues.push({ type: 'marks', icon: <BarChart3 size={14} />, label: 'Marks Issue', ...marks });

    const smoothness = quickpass.evaluation_smoothness?.issues?.find(i => i.qid === qid);
    if (smoothness) issues.push({ type: 'smoothness', icon: <PenLine size={14} />, label: 'Marking Consistency', ...smoothness });

    return issues;
  };

  const totalQuickpassIssues = quickpass ? (
    (quickpass.ambiguity?.flags?.length || 0) +
    (quickpass.or_conflicts?.issues?.length || 0) +
    (quickpass.marks_effort?.warnings?.length || 0) +
    (quickpass.duplicates?.pairs?.length || 0) +
    (quickpass.evaluation_smoothness?.issues?.length || 0)
  ) : 0;

  // Render question block with collapse/expand
  const renderQuestionBlock = (q, idx) => {
    const isExpanded = expandedQuestions[q.qid] ?? false;

    // Determine status based on type
    let hasAnswers = false;
    let statusBadge = null;

    if (q.type === 'objective') {
      hasAnswers = !!q.correctAnswer;
      statusBadge = hasAnswers ? (
        <span className={styles.statusComplete}><CheckCircle2 size={12} /> Answered</span>
      ) : (
        <span className={styles.statusPending}><AlertTriangle size={12} /> No Answer</span>
      );
    } else if (q.type === 'case_study') {
      hasAnswers = q.subParts?.length > 0;
      statusBadge = hasAnswers ? (
        <span className={styles.statusComplete}><CheckCircle2 size={12} /> {q.subParts.length} sub-parts</span>
      ) : (
        <span className={styles.statusPending}><AlertTriangle size={12} /> No sub-parts</span>
      );
    } else {
      // Subjective
      hasAnswers = q.samples?.length > 0;
      statusBadge = hasAnswers ? (
        <span className={styles.statusComplete}><CheckCircle2 size={12} /> {q.samples.length} variant{q.samples.length > 1 ? 's' : ''}</span>
      ) : (
        <span className={styles.statusPending}><AlertTriangle size={12} /> No variants</span>
      );
    }

    const previewText = q.text?.substring(0, 100) || "No question text";
    const issues = getIssuesForQuestion(idx);

    return (
      <div key={q.qid || idx} className={`${styles.questionContainer} ${isExpanded ? styles.expanded : ''} ${issues.length > 0 ? styles.hasIssues : ''}`}>
        {/* Clickable Header */}
        <div className={styles.questionHeader} onClick={() => toggleQuestion(q.qid)}>
          <div className={styles.headerLeft}>
            <span className={styles.expandArrow}>{isExpanded ? '▼' : '▶'}</span>
            <div className={styles.questionMeta}>
              <span className={styles.questionNum}>Q{idx + 1}</span>
              <span className={styles.marksBadge}>{q.marks} marks</span>

              {/* Type Badge */}
              {q.type === 'objective' && <span className={styles.typeBadge} style={{ backgroundColor: '#dcfce7', color: '#166534' }}>✓ Obj</span>}
              {q.type === 'case_study' && <span className={styles.typeBadge} style={{ backgroundColor: '#ffedd5', color: '#9a3412' }}>📋 Case</span>}

              {statusBadge}

              {issues.length > 0 && (
                <span className={styles.issuesBadge}><Search size={12} /> {issues.length} issue{issues.length > 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
          {!isExpanded && (
            <div className={styles.questionPreview}>{previewText}...</div>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className={styles.questionContent}>
            {/* QuickPass Issues */}
            {issues.length > 0 && (
              <div className={styles.issuesBlock}>
                <div className={styles.issuesTitle} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Search size={16} /> DASES Analysis Issues
                </div>
                {issues.map((issue, i) => (
                  <div key={i} className={styles.issueItem}>
                    <span className={styles.issueIcon}>{issue.icon}</span>
                    <div className={styles.issueContent}>
                      <strong>{issue.label}</strong>
                      <p>{issue.issue || issue.reason}</p>
                      {(issue.suggestion || issue.recommendation) && (
                        <p className={styles.issueSuggestion} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Lightbulb size={14} /> {issue.suggestion || issue.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Question Text */}
            <div className={styles.questionTextBlock}>
              <SmartLatex>{q.text}</SmartLatex>
              {q.type === 'objective' && q.options && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <strong>Options:</strong>
                  {q.options.map((opt, i) => (
                    <div key={i} style={{ padding: '6px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Answers Section */}
            <div className={styles.variantsSection}>
              <div className={styles.variantsHeader}>
                <span className={styles.variantsTitle}>
                  {q.type === 'case_study' ? 'Sub-Questions & Answers' : 'Answer Details'}
                </span>
              </div>

              {/* OBJECTIVE: Show Correct Answer */}
              {q.type === 'objective' && (
                <div className={styles.variantCard}>
                  <div className={styles.variantHeader} style={{ cursor: 'default' }}>
                    <div className={styles.variantLeft}>
                      <span className={styles.variantTitle}>Correct Answer</span>
                      <span className={styles.variantCheck}>✓ {q.correctAnswer || 'Not set'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CASE STUDY: Show Sub-parts */}
              {q.type === 'case_study' && (
                q.subParts?.length > 0 ? (
                  <div className={styles.subPartsList} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {q.subParts.map((sub, si) => (
                      <div key={si} className={styles.variantCard}>
                        <div className={styles.variantHeader} style={{ cursor: 'default', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 600 }}>Part {sub.label.toUpperCase()} ({sub.marks} marks)</div>
                            <div style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: '#dcfce7', color: '#166534' }}>Objective</div>
                          </div>
                          <div style={{ width: '100%', padding: '8px', background: '#f9fafb', borderRadius: '4px' }}>
                            <SmartLatex>{sub.text}</SmartLatex>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
                            <strong>Answer:</strong>
                            <span style={{ padding: '2px 8px', background: '#ecfdf5', color: '#047857', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                              {sub.correctAnswer || 'Not set'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noVariants}>
                    <span>No sub-parts defined</span>
                  </div>
                )
              )}

              {/* SUBJECTIVE: Show Variants */}
              {q.type !== 'objective' && q.type !== 'case_study' && (
                q.samples?.length > 0 ? (
                  q.samples.map((s, si) => {
                    const variantExpanded = expandedVariants[s.id] ?? (si === 0);
                    const rubricTotal = s.rubric?.criteria?.reduce((sum, c) => sum + (c.weight || 0), 0) || 0;

                    return (
                      <div key={s.id || si} className={styles.variantCard}>
                        <div className={styles.variantHeader} onClick={() => toggleVariant(s.id)}>
                          <div className={styles.variantLeft}>
                            <span className={styles.variantArrow}>{variantExpanded ? '▼' : '▶'}</span>
                            <span className={styles.variantTitle}>Variant {si + 1}</span>
                            {s.answer && <span className={styles.variantCheck}>✓ Answer</span>}
                            {s.rubric?.criteria?.length > 0 && (
                              <span className={styles.variantRubric}><ClipboardList size={12} /> Rubric ({rubricTotal})</span>
                            )}
                          </div>
                        </div>

                        {variantExpanded && (
                          <div className={styles.variantContent}>
                            {s.instructions && (
                              <div className={styles.fieldBlock}>
                                <div className={styles.fieldLabel}>DASES AI Guidance</div>
                                <div className={styles.fieldSubtle}>{s.instructions}</div>
                              </div>
                            )}

                            {s.answer && (
                              <div className={styles.fieldBlock}>
                                <div className={styles.fieldLabel}>Model Answer</div>
                                <div className={styles.answerBlock}>
                                  <SmartLatex>{s.answer}</SmartLatex>
                                </div>
                              </div>
                            )}

                            {s.rubric?.criteria?.length > 0 && (
                              <div className={styles.fieldBlock}>
                                <div className={styles.fieldLabel}>Rubric ({rubricTotal} marks total)</div>
                                <div className={styles.rubricList}>
                                  {s.rubric.criteria.map((c, ci) => (
                                    <div key={ci} className={styles.rubricRow}>
                                      <span className={styles.rubricText}><SmartLatex>{c.criterion}</SmartLatex></span>
                                      <span className={styles.rubricMarks}>{c.weight}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.noVariants}>
                    <span className={styles.noVariantsIcon}><FileQuestion size={24} /></span>
                    <span>No answer variants defined yet</span>
                    <button
                      className={styles.editBtn}
                      onClick={() => router.push(`/teacher/papers/${id}`)}
                    >
                      Add Variants
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render with OR grouping
  const renderQuestionsWithOr = () => {
    const rendered = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (q.isOr && i + 1 < questions.length) {
        rendered.push(
          <div key={`or-pair-${q.qid}`} className={styles.orPairContainer}>
            <div className={styles.orPairLabel} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} /> OR Pair: Attempt any one
            </div>
            {renderQuestionBlock(q, i)}
            <div className={styles.orDivider}><span>OR</span></div>
            {renderQuestionBlock(questions[i + 1], i + 1)}
          </div>
        );
        i++;
      } else if (!questions[i - 1]?.isOr) {
        rendered.push(renderQuestionBlock(q, i));
      }
    }
    return rendered;
  };

  return (
    <div className={styles.container}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.brandName}>
            {"DASES".split("").map((c, i) => <span key={i}>{c}</span>)}
          </div>
          <div className={styles.subBrand}>PAPER STUDIO</div>
        </div>
        <ul className={styles.steps}>
          <li className={styles.completed}>0. Course Curriculum</li>
          <li className={styles.completed}>1. Upload & Extract</li>
          <li className={styles.completed}>2. Build & Edit Paper</li>
          <li className={styles.active}>3. Review & Finalize</li>
        </ul>

        {/* Progress Summary in Sidebar */}
        <div className={styles.sidebarProgress}>
          <div className={styles.progressLabel}>Readiness</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${completionPercent}%` }}></div>
          </div>
          <div className={styles.progressText}>{questionsWithAnswers}/{questions.length} questions ready</div>
        </div>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.reviewHeader}>
          <div className={styles.headerInfo}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={24} /> Paper Review</h3>
            <div className={styles.paperTitle}>{paper.subject_name} ({paper.subject_code})</div>
          </div>
          <div className={styles.headerButtons}>
            <button onClick={() => router.push(`/teacher/papers/${id}`)} className={styles.btnIcon}>
              <Edit size={16} /> Edit
            </button>
            <button onClick={() => downloadPaperAsPDF(paper)} className={styles.btnIcon}>
              <FileText size={16} /> PDF
            </button>
            <button onClick={() => downloadCompleteQuestionPaper({ ...paper, intelligence, coverage_analysis: paper.coverage_analysis })} className={styles.btnIcon}>
              <ClipboardList size={16} /> Full Package
            </button>
            {paper.status !== "final" && (
              <button onClick={handleFinalize} className={styles.btnPrimary}>
                <CheckCircle2 size={16} /> Finalize
              </button>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{questions.length}</span>
            <span className={styles.statLabel}>Questions</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalMarks}</span>
            <span className={styles.statLabel}>Total Marks</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{questionsWithAnswers}</span>
            <span className={styles.statLabel}>With Answers</span>
          </div>
          <div className={styles.statItem}>
            <span className={`${styles.statValue} ${paper.status === 'final' ? styles.statusGreen : styles.statusYellow}`}>
              {paper.status === 'final' ? <><CheckCircle2 size={14} /> Final</> : 'Draft'}
            </span>
            <span className={styles.statLabel}>Status</span>
          </div>
        </div>

        {/* Questions */}
        {questions.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}><ClipboardList size={48} /></span>
            <p>No questions in this paper.</p>
            <button
              className={styles.btnPrimary}
              onClick={() => router.push(`/teacher/papers/${id}`)}
            >
              Add Questions
            </button>
          </div>
        ) : (
          <>
            <div className={styles.questionsHeader}>
              <span>All Questions</span>
              <button className={styles.expandAllBtn} onClick={() => {
                const allExpanded = questions.every(q => expandedQuestions[q.qid]);
                const newState = {};
                questions.forEach(q => { newState[q.qid] = !allExpanded; });
                setExpandedQuestions(newState);
              }}>
                {questions.every(q => expandedQuestions[q.qid]) ? 'Collapse All' : 'Expand All'}
              </button>
            </div>
            {renderQuestionsWithOr()}
          </>
        )}
      </main>
    </div>
  );
}
