"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Latex from "react-latex-next";
import { FileText, CheckCircle2, Zap, XCircle, Loader2, BarChart3, Plus, Sparkles, Trash2, AlertCircle, AlertTriangle, Lightbulb, Brain } from "lucide-react";
import "katex/dist/katex.min.css";
import "./UploadAndExtract.css";
import "./QuickPassReview.css";
import styles from "./CoverageReport.module.css";
import { PaperHealthBar, QuestionIssues } from "./QuickPassReviewComponents";

export default function UploadAndExtract({ paperId, initialPaper, onIntelligenceUpdate }) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [finalized, setFinalized] = useState(false);
  const [editModes, setEditModes] = useState({});
  const [analyzingQuickpass, setAnalyzingQuickpass] = useState(false);
  const [analyzingCoverage, setAnalyzingCoverage] = useState(false);
  const [intelligence, setIntelligence] = useState(null);
  const [coverage, setCoverage] = useState(null); // Coverage analysis results
  const [toast, setToast] = useState(null);
  const router = useRouter();
  const richTextRefs = useRef({});

  /* ---------------- File Upload & Extraction ---------------- */
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("paperId", paperId);
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      const j = await res.json();

      if (j.success) {
        const normalized = j.questions.map((q, i) => ({
          qid: q.qid || `${Date.now()}-${i}`,
          text: q.text ?? "",
          marks: q.marks ?? "",
          suggestions: q.suggestions ?? null,
          isOr: false,
        }));
        setQuestions(normalized);
        const modes = {};
        normalized.forEach((q) => (modes[q.qid] = "latex"));
        setEditModes(modes);
      } else {
        alert("Extraction failed: " + j.error);
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- Add New Question ---------------- */
  const addNewQuestion = () => {
    const newQ = {
      qid: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      text: "",
      marks: "",
      suggestions: null,
      isOr: false,
    };
    setQuestions((prev) => [...prev, newQ]);
    setEditModes((prev) => ({ ...prev, [newQ.qid]: "latex" }));
  };

  /* ---------------- Finalize ---------------- */
  // Show toast helper
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  /* ---------------- Finalize & Navigate ---------------- */
  function handleFinalize() {
    setFinalized(true);
    const withQids = questions.map((q, i) => ({
      qid: q.qid || `${Date.now()}-${i}`,
      ...q,
    }));

    fetch(`/api/papers/${paperId}/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: withQids, intelligence }),
    })
      .then((res) => res.json())
      .then((j) => {
        if (!j.success) {
          showToast('error', 'Save failed: ' + j.error);
          setFinalized(false);
        } else {
          showToast('success', 'Questions finalized successfully!');
          // Stay on page but show Continue button
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('error', 'Save error');
        setFinalized(false);
      });
  }

  const handleContinueToBuild = () => {
    window.location.reload();
  };

  /* ---------------- Rich Text Helpers ---------------- */
  const toggleEditMode = (qid, mode) => {
    setEditModes((prev) => ({ ...prev, [qid]: mode }));
  };

  const handleRichTextChange = (qid, content) => {
    const updated = questions.map((q) =>
      q.qid === qid ? { ...q, text: content } : q
    );
    setQuestions(updated);
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const RichTextToolbar = ({ disabled }) => (
    <div className="rich-text-toolbar">
      {["bold", "italic", "underline"].map((cmd) => (
        <button
          key={cmd}
          className="toolbar-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand(cmd)}
          disabled={disabled}
          title={cmd}
        >
          {cmd[0].toUpperCase()}
        </button>
      ))}
      <button
        onClick={() => executeCommand("insertUnorderedList")}
        className="toolbar-btn"
      >
        • List
      </button>
      <button
        onClick={() => executeCommand("insertOrderedList")}
        className="toolbar-btn"
      >
        1. List
      </button>
      <button
        onClick={() => executeCommand("superscript")}
        className="toolbar-btn"
      >
        x²
      </button>
      <button
        onClick={() => executeCommand("subscript")}
        className="toolbar-btn"
      >
        x₂
      </button>
    </div>
  );

  /* ---------------- Number-Based Reordering ---------------- */
  const moveQuestionToPosition = (fromIndex, toPosition) => {
    const newPos = Math.max(1, Math.min(questions.length, toPosition));
    const toIndex = newPos - 1;
    if (fromIndex === toIndex) return;

    const copy = [...questions];
    const [movedQuestion] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, movedQuestion);
    setQuestions(copy);
  };

  /* ---------------- OR Toggle ---------------- */
  const toggleOrFlag = (qid) => {
    setQuestions((prev) =>
      prev.map((q) => (q.qid === qid ? { ...q, isOr: !q.isOr } : q))
    );
  };

  /* ---------------- Delete Question ---------------- */
  const deleteQuestion = (qid) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuestions((prev) => prev.filter((q) => q.qid !== qid));
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="upload-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)}>×</button>
        </div>
      )}

      <div className="upload-card">
        <h2 className="upload-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={24} /> Upload Question Paper PDF
        </h2>

        <div className="drag-drop-zone">
          <input
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleUpload}
            className="file-input"
          />
          <p className="drag-drop-text">
            Select a file to extract questions automatically
          </p>
          <p className="supported-formats">
            <strong>Supported formats:</strong> PDF, DOCX, TXT
          </p>
        </div>

        {loading && (
          <div className="loading-feedback">
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <Loader2 className="animate-spin" size={20} /> Extracting questions from file... this may take a few seconds
            </p>
          </div>
        )}

        {questions.length > 0 && (
          <>
            {/* Paper Health Bar */}
            {intelligence?.quickpass && (
              <PaperHealthBar intelligence={intelligence} />
            )}

            {/* Questions Container */}
            <div className="questions-column">
              <div className="extracted-questions">
                <h3 className="extracted-title">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} /> Extracted Questions ({questions.length})
                  </span>
                </h3>


                {questions.map((q, i) => {
                  // Check if this question is part of an OR pair
                  const isOrPairStart = q.isOr;
                  const isOrPairSecond = i > 0 && questions[i - 1]?.isOr;
                  const inOrPair = isOrPairStart || isOrPairSecond;

                  return (
                    <div
                      key={q.qid || i}
                      className={`question-card ${inOrPair ? 'or-question' : ''} ${finalized ? "finalized" : ""}`}
                    >
                      {/* OR Indicator Label */}
                      {isOrPairStart && (
                        <div className="or-indicator-label">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Zap size={14} /> OR Pair Start
                          </span>
                        </div>
                      )}
                      {isOrPairSecond && (
                        <div className="or-indicator-label" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Zap size={14} /> OR Pair Option
                          </span>
                        </div>
                      )}

                      <div className="question-header">
                        {/* Question Number Input */}
                        <div className="question-number-control">
                          <label className="question-label-static">Question</label>
                          <input
                            type="text"
                            defaultValue={i + 1}
                            key={`q-num-${q.qid}-${i}`}
                            disabled={finalized}
                            onBlur={(e) => {
                              const newPos = parseInt(e.target.value);
                              if (newPos && newPos >= 1 && newPos <= questions.length && newPos !== i + 1) {
                                moveQuestionToPosition(i, newPos);
                              } else {
                                e.target.value = i + 1;
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.target.blur();
                              }
                            }}
                            className="question-number-input"
                            title="Type new number and press Enter to reorder"
                          />
                        </div>

                        <div className="marks-group">
                          <span className="marks-label">Marks:</span>
                          <input
                            type="number"
                            value={q.marks ?? ""}
                            disabled={finalized}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[i].marks =
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value);
                              setQuestions(updated);
                            }}
                            className="marks-input"
                          />
                        </div>
                      </div>

                      {/* OR Toggle */}
                      <div className="or-toggle">
                        <label>
                          <input
                            type="checkbox"
                            checked={q.isOr}
                            onChange={() => toggleOrFlag(q.qid)}
                            disabled={finalized}
                          />{" "}
                          {"Mark this as \"OR\" question"}
                        </label>

                        {/* Delete Button */}
                        {!finalized && (
                          <button
                            onClick={() => deleteQuestion(q.qid)}
                            className="delete-question-btn"
                            title="Delete this question"
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Trash2 size={14} /> Delete
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Editing Controls */}
                      <div className="editing-controls">
                        <span
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            marginRight: "8px",
                          }}
                        >
                          Edit Mode:
                        </span>
                        <button
                          className={`edit-mode-btn ${editModes[q.qid] === "latex" ? "active" : ""
                            }`}
                          onClick={() => toggleEditMode(q.qid, "latex")}
                          disabled={finalized}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FileText size={14} /> LaTeX
                          </span>
                        </button>
                        <button
                          className={`edit-mode-btn ${editModes[q.qid] === "rich" ? "active" : ""
                            }`}
                          onClick={() => toggleEditMode(q.qid, "rich")}
                          disabled={finalized}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={14} /> Rich Text
                          </span>
                        </button>
                      </div>

                      {/* Editor + Preview */}
                      <div className="side-by-side">
                        <div className="editor-section">
                          <p className="section-title">
                            {editModes[q.qid] === "latex"
                              ? "LaTeX Editor:"
                              : "Rich Text Editor:"}
                          </p>

                          {editModes[q.qid] === "latex" ? (
                            <textarea
                              value={q.text ?? ""}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[i].text = e.target.value;
                                setQuestions(updated);
                              }}
                              disabled={finalized}
                              placeholder="Question text will appear here..."
                              className="textarea-question"
                            />
                          ) : (
                            <>
                              <RichTextToolbar disabled={finalized} />
                              <div
                                ref={(el) => (richTextRefs.current[q.qid] = el)}
                                contentEditable={!finalized}
                                className="rich-text-editor"
                                dangerouslySetInnerHTML={{
                                  __html: q.text || "",
                                }}
                                onInput={(e) => {
                                  handleRichTextChange(q.qid, e.target.innerHTML);
                                }}
                                style={{
                                  cursor: finalized ? "not-allowed" : "text",
                                }}
                              />
                            </>
                          )}
                        </div>

                        {/* Preview Section */}
                        <div className="preview-section">
                          <p className="section-title">
                            {editModes[q.qid] === "latex"
                              ? "LaTeX Preview:"
                              : "HTML Preview:"}
                          </p>
                          <div className="latex-preview">
                            {editModes[q.qid] === "latex" ? (
                              q.text ? (
                                <Latex>{q.text}</Latex>
                              ) : (
                                <em>Preview will appear here...</em>
                              )
                            ) : (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html:
                                    q.text ||
                                    "<em>Preview will appear here...</em>",
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {q.suggestions && (
                        <div className="suggestion-box">
                          <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Lightbulb size={16} /> <strong>Suggestion:</strong> {q.suggestions}
                          </p>
                        </div>
                      )}

                      {/* QuickPass View Issues Button */}
                      {intelligence?.quickpass && (
                        <QuestionIssues
                          qid={q.qid}
                          questionIndex={i}
                          intelligence={intelligence}
                          onApplySuggestion={(warning) => {
                            console.log('Apply suggestion:', warning);
                            alert(`Suggestion: ${warning.suggestion}`);
                          }}
                        />
                      )}
                    </div>
                  );
                })}

                {/* ➕ Add New Question */}
                {!finalized && (
                  <div className="add-question-container">
                    <button onClick={addNewQuestion} className="add-question-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', margin: '0 auto' }}>
                      <Plus size={16} /> Add New Question
                    </button>
                  </div>
                )}

                {/* ⚡ QuickPass Analysis */}
                {!finalized && (
                  <div className="quickpass-container">
                    <button
                      onClick={async () => {
                        if (questions.length === 0) {
                          alert("No questions to analyze. Please extract questions first.");
                          return;
                        }
                        setAnalyzingQuickpass(true);
                        try {
                          const res = await fetch(`/api/papers/${paperId}/quickpass/analyze`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              questions,
                              previousAnalysis: intelligence // Send previous results for consistency
                            }),
                          });
                          const json = await res.json();
                          if (json.success) {
                            setIntelligence(json.intelligence);
                            // Pass intelligence to parent for sidebar display
                            if (onIntelligenceUpdate) {
                              onIntelligenceUpdate(json.intelligence);
                            }
                          } else {
                            alert("Analysis failed: " + json.error);
                          }
                        } catch (err) {
                          console.error("Analysis error:", err);
                          alert("Error running analysis");
                        } finally {
                          setAnalyzingQuickpass(false);
                        }
                      }}
                      className="quickpass-analyze-btn"
                      disabled={analyzingQuickpass || analyzingCoverage}
                    >
                      {analyzingQuickpass ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Loader2 className="animate-spin" size={16} /> Analyzing...
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Zap size={16} /> Analyze with QuickPass
                        </span>
                      )}
                    </button>

                    <button
                      onClick={async () => {
                        if (questions.length === 0) {
                          alert("No questions to analyze.");
                          return;
                        }
                        setAnalyzingCoverage(true);
                        setCoverage(null);
                        try {
                          const res = await fetch(`/api/papers/${paperId}/analyze-coverage`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ questions }),
                          });
                          const json = await res.json();
                          if (json.success) {
                            setCoverage({ ...json.coverage, blooms: json.blooms });
                          } else {
                            alert(json.error || "No curriculum linked. Add curriculum in Step 0.");
                          }
                        } catch (err) {
                          console.error("Coverage error:", err);
                          alert("Error running coverage analysis");
                        } finally {
                          setAnalyzingCoverage(false);
                        }
                      }}
                      className="coverage-analyze-btn"
                      disabled={analyzingQuickpass || analyzingCoverage}
                    >
                      {analyzingCoverage ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Loader2 className="animate-spin" size={16} /> Analyzing...
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <BarChart3 size={16} /> Analyze Coverage
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* Advanced Coverage Report Display - Premium Dashboard */}
                {coverage && (
                  <div className={styles.reportContainer}>
                    {/* Header */}
                    <div className={styles.header}>
                      <h3 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart3 size={20} /> Paper Analysis Report
                      </h3>
                      <button onClick={() => setCoverage(null)} className={styles.closeBtn}>✕</button>
                    </div>

                    {/* Score + Recommendations Grid */}
                    <div className={styles.cardsRow}>
                      {/* Score Circle Card */}
                      <div className={`${styles.card} ${styles.scoreCard}`}>
                        <div
                          className={`${styles.scoreCircle} ${coverage.overall >= 70 ? styles.good : coverage.overall >= 30 ? styles.average : styles.poor}`}
                          style={{ '--percent': `${coverage.overall}%` }}
                        >
                          <div className={styles.scoreInner}>{coverage.overall}%</div>
                        </div>
                        <div className={styles.scoreLabel}>Topics Covered</div>
                        <div className={styles.scoreTopics}>{coverage.coveredTopics}/{coverage.totalTopics}</div>
                      </div>

                      {/* Recommendations Card */}
                      <div className={`${styles.card} ${styles.recsCard}`}>
                        <div className={styles.sectionLabel} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Lightbulb size={16} /> Recommendations
                        </div>
                        {coverage.recommendations?.map((rec, i) => (
                          <div key={i} className={`${styles.recItem} ${styles[rec.severity] || styles.info}`}>
                            <div className={styles.recMessage}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {rec.severity === 'error' ? <AlertCircle size={16} style={{ color: '#ef4444' }} /> : rec.severity === 'warning' ? <AlertTriangle size={16} style={{ color: '#f59e0b' }} /> : <CheckCircle2 size={16} style={{ color: '#10b981' }} />}
                                {rec.message}
                              </span>
                            </div>
                            <div className={styles.recSuggestion}>{rec.suggestion}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bloom's Taxonomy Card */}
                    {coverage.blooms && (
                      <div className={`${styles.card} ${styles.bloomsCard}`}>
                        <div className={styles.bloomsHeader}>
                          <div className={styles.sectionLabel} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Brain size={16} /> Bloom's Taxonomy Analysis
                          </div>
                          <span className={`${styles.qualityBadge} ${coverage.blooms.insights?.quality === 'Good' ? styles.good :
                            coverage.blooms.insights?.quality === 'Average' ? styles.average : styles.poor
                            }`}>
                            {coverage.blooms.insights?.quality} Quality
                          </span>
                        </div>

                        {/* Skill Bars */}
                        {['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].map((level, i) => {
                          const count = coverage.blooms.distribution?.[level] || 0;
                          const total = Object.values(coverage.blooms.distribution || {}).reduce((a, b) => a + b, 0) || 1;
                          const percent = Math.round((count / total) * 100);
                          const colors = ['#94a3b8', '#60a5fa', '#34d399', '#fbbf24', '#f97316', '#a855f7'];
                          return (
                            <div key={level} className={styles.skillBar}>
                              <div className={styles.skillLabel}>{level}</div>
                              <div className={styles.skillTrack}>
                                <div className={styles.skillFill} style={{ width: `${percent}%`, background: colors[i] }} />
                              </div>
                              <div className={styles.skillCount}>{count}</div>
                            </div>
                          );
                        })}

                        {/* Insights Box */}
                        <div className={styles.insightsBox}>
                          <div className={styles.insightsSummary}>{coverage.blooms.insights?.summary}</div>
                          {coverage.blooms.insights?.suggestions?.length > 0 && (
                            <ul className={styles.insightsList}>
                              {coverage.blooms.insights.suggestions.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Topic Details Accordion */}
                    <details className={styles.topicDetails}>
                      <summary className={styles.topicSummary}>
                        TOPIC DETAILS
                      </summary>
                      <div className={styles.topicContent}>
                        {coverage.units?.map((unit, ui) => (
                          <div key={ui} className={styles.unitBlock}>
                            <div className={styles.unitName}>{unit.name}</div>
                            {unit.topics?.map((topic, ti) => (
                              <div
                                key={ti}
                                className={`${styles.topicItem} ${styles[topic.status] || styles.missing}`}
                              >
                                <span className={`${styles.statusDot} ${styles[topic.status] || styles.missing}`} />
                                <span className={styles.topicName}>{topic.name}</span>
                                {topic.questions?.length > 0 && (
                                  <span className={styles.topicQuestions}>
                                    Q{topic.questions.map(q => q.index).join(', Q')}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}

                {/* ✅ Finalize */}
                <div className="finalize-container">
                  {!finalized ? (
                    <button onClick={handleFinalize} className="finalize-btn">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={18} /> Finalize Questions
                      </span>
                    </button>
                  ) : (
                    <div className="finalized-success">
                      <div className="success-icon">
                        <CheckCircle2 size={48} style={{ color: '#10b981' }} />
                      </div>
                      <h3>Questions Finalized!</h3>
                      <p>Your questions have been saved. Now add sample answers and rubric.</p>
                      <button
                        onClick={handleContinueToBuild}
                        className="continue-btn"
                      >
                        Continue to Build & Edit →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
