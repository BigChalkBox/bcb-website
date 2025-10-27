"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import "./UploadAndExtract.css";

export default function UploadAndExtract({ paperId, initialPaper }) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [finalized, setFinalized] = useState(false);
  const [editModes, setEditModes] = useState({});
  const router = useRouter();
  const richTextRefs = useRef({});
  const dragItem = useRef();
  const dragOverItem = useRef();

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
  function handleFinalize() {
    setFinalized(true);
    const withQids = questions.map((q, i) => ({
      qid: q.qid || `${Date.now()}-${i}`,
      ...q,
    }));

    fetch(`/api/papers/${paperId}/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: withQids }),
    })
      .then((res) => res.json())
      .then((j) => {
        if (!j.success) {
          alert("Save failed: " + j.error);
          setFinalized(false);
        } else {
          router.push(`/teacher/papers/${paperId}`);
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Save error");
        setFinalized(false);
      });
  }

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

  /* ---------------- Drag and Drop Handlers ---------------- */
  const handleDragStart = (index) => (dragItem.current = index);
  const handleDragEnter = (index) => (dragOverItem.current = index);
  const handleDrop = () => {
    const copy = [...questions];
    const dragItemContent = copy[dragItem.current];
    copy.splice(dragItem.current, 1);
    copy.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setQuestions(copy);
  };

  /* ---------------- OR Toggle ---------------- */
  const toggleOrFlag = (qid) => {
    setQuestions((prev) =>
      prev.map((q) => (q.qid === qid ? { ...q, isOr: !q.isOr } : q))
    );
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2 className="upload-title">📄 Upload Question Paper PDF</h2>

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
            <p>⏳ Extracting questions from file... this may take a few seconds</p>
          </div>
        )}

        {questions.length > 0 && (
          <div className="extracted-questions">
            <h3 className="extracted-title">
              📝 Extracted Questions ({questions.length})
            </h3>

            {questions.map((q, i) => (
              <div
                key={q.qid || i}
                className={`question-card ${finalized ? "finalized" : ""}`}
                draggable={!finalized}
                onDragStart={() => handleDragStart(i)}
                onDragEnter={() => handleDragEnter(i)}
                onDragEnd={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="question-header">
                  <label className="question-label">
                    {q.isOr ? `OR Question ${i + 1}` : `Question ${i + 1}`}
                  </label>

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
                    Mark this as "OR" question
                  </label>
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
                    className={`edit-mode-btn ${
                      editModes[q.qid] === "latex" ? "active" : ""
                    }`}
                    onClick={() => toggleEditMode(q.qid, "latex")}
                    disabled={finalized}
                  >
                    📝 LaTeX
                  </button>
                  <button
                    className={`edit-mode-btn ${
                      editModes[q.qid] === "rich" ? "active" : ""
                    }`}
                    onClick={() => toggleEditMode(q.qid, "rich")}
                    disabled={finalized}
                  >
                    ✨ Rich Text
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
                    <p>
                      💡 <strong>Suggestion:</strong> {q.suggestions}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* ➕ Add New Question */}
            {!finalized && (
              <div className="add-question-container">
                <button onClick={addNewQuestion} className="add-question-btn">
                  ➕ Add New Question
                </button>
              </div>
            )}

            {/* ✅ Finalize */}
            <div className="finalize-container">
              {!finalized ? (
                <button onClick={handleFinalize} className="finalize-btn">
                  ✅ Finalize Questions
                </button>
              ) : (
                <div className="final-message">
                  <p>✅ Questions finalized! Proceed to next phase.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
