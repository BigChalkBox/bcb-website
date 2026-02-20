"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Latex from "react-latex-next";
import { FileText, CheckCircle2, Zap, XCircle, Loader2, BarChart3, Plus, Sparkles, Trash2, AlertCircle, AlertTriangle, Lightbulb, Brain, Focus, List, ChevronLeft, ChevronRight, Settings, ChevronDown, RefreshCw, SpellCheck, Eye, HelpCircle, Scale, Copy, ClipboardCheck, Rocket, Shield, Download } from "lucide-react";
import "katex/dist/katex.min.css";
import "./UploadAndExtract.css";
import "./QuickPassReview.css";
import styles from "./CoverageReport.module.css";
import { PaperHealthBar, QuestionIssues } from "./QuickPassReviewComponents";

const CHECKS_CONFIG = [
  { id: 'typos', label: 'Typos', Icon: SpellCheck, desc: 'Spelling & grammar' },
  { id: 'readability', label: 'Readability', Icon: Eye, desc: 'Language clarity' },
  { id: 'unclear', label: 'Unclear', Icon: HelpCircle, desc: 'Ambiguous phrasing' },
  { id: 'marks', label: 'Marks', Icon: BarChart3, desc: 'Effort vs allocation' },
  { id: 'or_balance', label: 'OR Balance', Icon: Scale, desc: 'Difficulty fairness' },
  { id: 'duplicates', label: 'Duplicates', Icon: Copy, desc: 'Similar questions' },
  { id: 'grading', label: 'Grading', Icon: ClipboardCheck, desc: 'Evaluation ease' },
  { id: 'blooms', label: 'Blooms', Icon: Brain, desc: 'Cognitive levels' },
  { id: 'time', label: 'Time Feasibility', Icon: AlertCircle, desc: 'Duration check' },
  { id: 'difficulty', label: 'Difficulty Mix', Icon: BarChart3, desc: 'Easy/Med/Hard' },
];

export default function UploadAndExtract({ paperId, initialPaper, onIntelligenceUpdate, onQuestionsChange }) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [finalized, setFinalized] = useState(false);
  const [editModes, setEditModes] = useState({});
  const [analyzingQuickpass, setAnalyzingQuickpass] = useState(false);
  const [analyzingCoverage, setAnalyzingCoverage] = useState(false);
  const [intelligence, setIntelligence] = useState(null);
  const [coverage, setCoverage] = useState(null); // Coverage analysis results
  const [toast, setToast] = useState(null);
  const [showQuickPassWizard, setShowQuickPassWizard] = useState(false); // QuickPass 2.0 wizard
  const [viewMode, setViewMode] = useState("list"); // "list" | "focus"
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0); // For focus mode navigation
  const [selectedChecks, setSelectedChecks] = useState(["typos", "readability", "unclear", "marks"]); // Default checks
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [analyzingStatus, setAnalyzingStatus] = useState("Analyzing...");
  const [currentPreset, setCurrentPreset] = useState("standard"); // "fast" | "standard" | "deep" | "custom"
  const [downloadingReport, setDownloadingReport] = useState(false);
  const router = useRouter();
  const richTextRefs = useRef({});

  // Sync questions to parent when they change
  useEffect(() => {
    if (onQuestionsChange) {
      onQuestionsChange(questions);
    }
  }, [questions, onQuestionsChange]);

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

  // QuickPass Apply Fix handler - updates question text
  const handleApplyQuickPassFix = (questionIndex, newText) => {
    setQuestions(prev => prev.map((q, idx) =>
      idx === questionIndex ? { ...q, text: newText } : q
    ));
    showToast("success", `Fixed Q${questionIndex + 1}`);
  };

  // QuickPass Re-analyze handler
  const handleReanalyzeQuickPass = async () => {
    if (questions.length === 0) return;
    setAnalyzingQuickpass(true);
    try {
      const res = await fetch(`/api/papers/${paperId}/quickpass/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions,
          checks: selectedChecks // Pass selected checks
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIntelligence(json.intelligence);
        if (onIntelligenceUpdate) {
          onIntelligenceUpdate(json.intelligence);
        }
      }
    } catch (err) {
      console.error("Re-analysis error:", err);
    } finally {
      setAnalyzingQuickpass(false);
    }
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
            {/* Questions Container */}
            <div className="questions-column">
              <div className="extracted-questions">
                <div className="questions-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px' }}>
                  <h3 className="extracted-title" style={{ margin: 0, border: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={20} /> Extracted Questions ({questions.length})
                    </span>
                  </h3>

                  {/* View Mode Toggle */}
                  <div className="view-mode-toggle" style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                    <button
                      onClick={() => setViewMode("list")}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: viewMode === "list" ? 'white' : 'transparent',
                        color: viewMode === "list" ? '#0f172a' : '#64748b',
                        boxShadow: viewMode === "list" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center'
                      }}
                    >
                      <List size={16} /> List
                    </button>
                    <button
                      onClick={() => setViewMode("focus")}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: viewMode === "focus" ? 'white' : 'transparent',
                        color: viewMode === "focus" ? '#6366f1' : '#64748b',
                        boxShadow: viewMode === "focus" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center'
                      }}
                    >
                      <Focus size={16} /> Focus Card
                    </button>
                  </div>
                </div>

                {/* Focus Mode Navigation */}
                {viewMode === "focus" && (
                  <div className="focus-navigation" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#eef2ff', padding: '12px 20px', borderRadius: '12px' }}>
                    <button
                      onClick={() => setCurrentFocusIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentFocusIndex === 0}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #c7d2fe', background: 'white', padding: '8px 16px', borderRadius: '8px', cursor: currentFocusIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentFocusIndex === 0 ? 0.5 : 1, color: '#4338ca', fontWeight: 600 }}
                    >
                      <ChevronLeft size={20} /> Previous
                    </button>

                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#3730a3' }}>
                      Question {currentFocusIndex + 1} of {questions.length}
                    </span>

                    <button
                      onClick={() => setCurrentFocusIndex(prev => Math.min(questions.length - 1, prev + 1))}
                      disabled={currentFocusIndex === questions.length - 1}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #c7d2fe', background: 'white', padding: '8px 16px', borderRadius: '8px', cursor: currentFocusIndex === questions.length - 1 ? 'not-allowed' : 'pointer', opacity: currentFocusIndex === questions.length - 1 ? 0.5 : 1, color: '#4338ca', fontWeight: 600 }}
                    >
                      Next <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {(viewMode === "focus" ? [questions[currentFocusIndex]] : questions).map((q, loopIndex) => {
                  const i = viewMode === "focus" ? currentFocusIndex : loopIndex;
                  if (!q) return null; // Safety check

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

                      {/* QuickPass Analysis Issues (Inline) */}
                      {intelligence && intelligence.quickpass && (
                        <div style={{ marginTop: '16px' }}>
                          <QuestionIssues
                            qid={q.qid}
                            questionIndex={i}
                            intelligence={intelligence}
                            onApplySuggestion={(newText) => {
                              const updated = [...questions];
                              updated[i].text = newText;
                              setQuestions(updated);
                              showToast("success", `Applied fix to Q${i + 1}`);
                            }}
                          />
                        </div>
                      )}

                      {/* Suggestion Box (Legacy/Manual) */}
                      {q.suggestions && (
                        <div className="suggestion-box">
                          <strong>AI Suggestion from Extraction:</strong>
                          <p>{q.suggestions}</p>
                        </div>
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
                  <div className="quickpass-container" style={{ position: 'relative' }}>
                    {/* Split Button Group */}
                    <div style={{ display: 'flex', gap: '0' }}>
                      {/* Main Analyze Button */}
                      <button
                        onClick={async () => {
                          if (questions.length === 0) {
                            alert("No questions to analyze. Please extract questions first.");
                            return;
                          }
                          if (selectedChecks.length === 0) {
                            alert("Please select at least one check to run.");
                            return;
                          }

                          setAnalyzingQuickpass(true);
                          setAnalyzingStatus("Starting checks...");

                          // Animation loop
                          let step = 0;
                          const statusInterval = setInterval(() => {
                            if (selectedChecks.length > 0) {
                              const checkId = selectedChecks[step % selectedChecks.length];
                              const checkConfig = CHECKS_CONFIG.find(c => c.id === checkId);
                              if (checkConfig) {
                                setAnalyzingStatus(`Checking ${checkConfig.label}...`);
                              }
                              step++;
                            }
                          }, 800);

                          try {
                            const res = await fetch(`/api/papers/${paperId}/quickpass/analyze`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                questions,
                                checks: selectedChecks,
                                previousAnalysis: intelligence
                              }),
                            });
                            const json = await res.json();
                            if (json.success) {
                              setIntelligence(json.intelligence);
                              if (onIntelligenceUpdate) {
                                onIntelligenceUpdate(json.intelligence);
                              }
                              showToast("success", "Analysis Complete!");
                            } else {
                              alert("Analysis failed: " + json.error);
                            }
                          } catch (err) {
                            console.error("Analysis error:", err);
                            alert("Error running analysis");
                          } finally {
                            clearInterval(statusInterval);
                            setAnalyzingQuickpass(false);
                            setAnalyzingStatus("Analyzing...");
                          }
                        }}
                        className="quickpass-analyze-btn"
                        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: '1px solid rgba(255,255,255,0.2)' }}
                        disabled={analyzingQuickpass || analyzingCoverage || selectedChecks.length === 0}
                      >
                        {analyzingQuickpass ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Loader2 className="animate-spin" size={16} /> {analyzingStatus}
                          </span>
                        ) : intelligence?.quickpass ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <RefreshCw size={16} /> Re-Analyze
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Zap size={16} /> Analyze Questions
                          </span>
                        )}
                      </button>
                      {/* Config Dropdown Toggle */}
                      <button
                        onClick={() => setShowConfigMenu(!showConfigMenu)}
                        className="quickpass-analyze-btn"
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, padding: '10px 12px', minWidth: 'auto' }}
                        disabled={analyzingQuickpass}
                      >
                        <ChevronDown size={16} style={{ transform: showConfigMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                      </button>
                    </div>

                    {/* Config Dropdown Menu */}
                    {showConfigMenu && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '8px',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        border: '1px solid #e2e8f0',
                        padding: '16px',
                        minWidth: '320px',
                        zIndex: 100,
                      }}>
                        {/* Presets */}
                        <div style={{ marginBottom: '16px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Presets</span>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            {[
                              { id: 'fast', label: 'Fast', Icon: Rocket, checks: ['typos', 'marks'] },
                              { id: 'standard', label: 'Standard', Icon: Shield, checks: ['typos', 'readability', 'unclear', 'marks'] },
                              { id: 'deep', label: 'Deep', Icon: Brain, checks: ['typos', 'readability', 'unclear', 'marks', 'or_balance', 'duplicates', 'grading', 'blooms', 'time', 'difficulty'] },
                            ].map(preset => (
                              <button
                                key={preset.id}
                                onClick={() => {
                                  setCurrentPreset(preset.id);
                                  setSelectedChecks(preset.checks);
                                }}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '8px',
                                  border: currentPreset === preset.id ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                  background: currentPreset === preset.id ? '#eef2ff' : 'white',
                                  color: currentPreset === preset.id ? '#4338ca' : '#475569',
                                  fontSize: '13px',
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                }}
                              >
                                <preset.Icon size={14} style={{ marginRight: '4px' }} />{preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Individual Toggles */}
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Checks</span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px' }}>
                            {CHECKS_CONFIG.map(check => (
                              <label
                                key={check.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  border: '1px solid #e2e8f0',
                                  background: selectedChecks.includes(check.id) ? '#f0fdf4' : '#fafafa',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedChecks.includes(check.id)}
                                  onChange={(e) => {
                                    setCurrentPreset('custom');
                                    if (e.target.checked) {
                                      setSelectedChecks(prev => [...prev, check.id]);
                                    } else {
                                      setSelectedChecks(prev => prev.filter(c => c !== check.id));
                                    }
                                  }}
                                  style={{ width: '16px', height: '16px', accentColor: '#6366f1' }}
                                />
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}><check.Icon size={14} /> {check.label}</div>
                                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{check.desc}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Apply Button */}
                        <button
                          onClick={() => setShowConfigMenu(false)}
                          style={{
                            marginTop: '16px',
                            width: '100%',
                            padding: '10px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Apply ({selectedChecks.length} checks selected)
                        </button>
                      </div>
                    )}

                    {/* Coverage Button */}
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

                    {/* Download Report Button */}
                    <button
                      onClick={async () => {
                        if (!intelligence?.quickpass) {
                          alert("Please run QuickPass analysis first");
                          return;
                        }
                        if (!coverage) {
                          const proceed = confirm("Coverage analysis not done. The report will not include coverage data. Continue anyway?");
                          if (!proceed) return;
                        }
                        setDownloadingReport(true);
                        try {
                          const res = await fetch(`/api/papers/${paperId}/moderation-report`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              paperName: initialPaper?.name || "Untitled Paper",
                              questions,
                              intelligence,
                              coverage,
                            }),
                          });
                          if (res.ok) {
                            const blob = await res.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `moderation-report-${paperId}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            showToast("success", "Report downloaded!");
                          } else {
                            const json = await res.json();
                            alert("Download failed: " + (json.error || "Unknown error"));
                          }
                        } catch (err) {
                          console.error("Download error:", err);
                          alert("Error downloading report");
                        } finally {
                          setDownloadingReport(false);
                        }
                      }}
                      className="coverage-analyze-btn"
                      style={{ background: intelligence?.quickpass ? 'linear-gradient(135deg, #059669, #10b981)' : '#9ca3af' }}
                      disabled={!intelligence?.quickpass || downloadingReport}
                    >
                      {downloadingReport ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Loader2 className="animate-spin" size={16} /> Generating...
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Download size={16} /> Download Report
                        </span>
                      )}
                    </button>
                  </div>
                )}


              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
