// // src/app/paper/[id]/QuestionEditor.js

// "use client";
// import React, { useEffect, useState } from "react";
// import Latex from "react-latex-next"; // Import for LaTeX rendering
// import 'katex/dist/katex.min.css'; // Import KaTeX styles (move to global if preferred)

// /* ---------- Helpers ---------- */
// function uuid() {
//   return (crypto.randomUUID && crypto.randomUUID()) || Date.now().toString();
// }
// function blankSample() {
//   return {
//     id: uuid(), // ✅ always unique
//     answer: "",
//     answerImages: [],
//     rubric: { criteria: [] },
//   };
// }
// function blankQuestion() {
//   return {
//     qid: uuid(),
//     text: "",
//     instructions: "",
//     marks: 0,
//     images: [],
//     samples: [], // <— NEW
//   };
// }

// /* ---------- Top-level component ---------- */
// export default function QuestionEditor({ paperId, initialQuestions = [], onSaved }) {
//   const [questions, setQuestions] = useState(initialQuestions);
//   const [saving, setSaving] = useState(false);

//   /* sync incoming props */
//   useEffect(() => setQuestions(initialQuestions), [initialQuestions]);

//   /* ---------- persistence ---------- */
//   async function persistQuestions(newQuestions) {
//     setSaving(true);
//     try {
//       /* load existing paper */
//       const res = await fetch(`/api/papers/${paperId}`);
//       const { success, data: paper } = await res.json();
//       if (!success) throw new Error("Failed to load paper");

//       /* overwrite questions + save */
//       const put = await fetch(`/api/papers/${paperId}`, {
//         method: "PUT",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify({ ...paper, questions: newQuestions }),
//       });
//       const putj = await put.json();
//       if (!putj.success) throw new Error("Failed to save");

//       setQuestions(newQuestions);
//       onSaved?.(putj.data);
//     } catch (e) {
//       console.error(e);
//       alert("Save error — check console.");
//     } finally {
//       setSaving(false);
//     }
//   }

//   /* ---------- question-level helpers ---------- */
//   function addQuestion() {
//     setQuestions([...questions, blankQuestion()]);
//   }
//   function deleteQuestion(qid) {
//     if (!confirm("Delete this question?")) return;
//     const updated = questions.filter((q) => q.qid !== qid);
//     setQuestions(updated);
//     persistQuestions(updated); // hard-delete immediately
//   }
//   function updateQuestion(qid, payload) {
//     setQuestions((prev) =>
//       prev.map((q) => (q.qid === qid ? { ...q, ...payload } : q)),
//     );
//   }

//   /* ---------- file uploads (question-level) ---------- */
//   async function handleFileUpload(qid, e, targetField, sampleId = null) {
//     const files = Array.from(e.target.files);
//     if (!files.length) return;

//     /* upload sequentially; collect paths */
//     const uploaded = [];
//     for (const f of files) {
//       const fd = new FormData();
//       fd.append("file", f);
//       const up = await fetch("/api/upload", { method: "POST", body: fd });
//       const j = await up.json();
//       if (j.success) uploaded.push(j.path);
//     }

//     /* decide where to store */
//     setQuestions((prev) =>
//       prev.map((q) => {
//         if (q.qid !== qid) return q;
//         if (!sampleId) {
//           return { ...q, [targetField]: [...(q[targetField] || []), ...uploaded] };
//         }
//         /* sample-level attachment */
//         const samples = q.samples.map((s) =>
//           s.id === sampleId
//             ? { ...s, [targetField]: [...(s[targetField] || []), ...uploaded] }
//             : s,
//         );
//         return { ...q, samples };
//       }),
//     );
//   }

//   async function generateRubric() {
//     setGeneratingRubric(true);
//     try {
//       const res = await fetch(`/api/papers/${paperId}/questions/${questionId}/rubric`, {
//         method: "POST",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify({
//           sampleAnswer: sample.answer,
//           maxMarks: questionMarks,
//           sampleImages: sample.answerImages || [],
//           questionText: questionText, // pass question text from parent
//         }),
//       });
//       const j = await res.json();
//       if (j.success && j.rubric) {
//         onChange({ rubric: j.rubric });
//       } else {
//         alert("Failed to generate rubric");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error generating rubric");
//     } finally {
//       setGeneratingRubric(false);
//     }
//   }

//   /* ---------- render ---------- */
//   return (
//     <div style={{ marginTop: 12 }}>
//       {/* Header row */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <h3>Questions</h3>
//         <div>
//           <button onClick={addQuestion} style={{ marginRight: 8 }}>
//             + Add Question
//           </button>
//           <button onClick={() => persistQuestions(questions)} disabled={saving}>
//             {saving ? "Saving…" : "💾 Save All"}
//           </button>
//         </div>
//       </div>

//       {questions.length === 0 && <p style={{ color: "#666" }}>No questions yet</p>}

//       {questions.map((q, idx) => (
//         <div key={q.qid} style={{ border: "1px solid #444", padding: 12, marginBottom: 12, borderRadius: 6 }}>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//             <strong>Question {idx + 1}</strong>
//             <button onClick={() => deleteQuestion(q.qid)} style={{ color: "red" }}>Delete</button>
//           </div>

//           <QuestionCard
//             paperId={paperId}
//             question={q}
//             onQuestionChange={(payload) => updateQuestion(q.qid, payload)}
//             onFileUpload={handleFileUpload} // ✅ pass the function here
//             onSaveSingle={() => persistQuestions(questions)}
//           />
//         </div>
//       ))}
//     </div>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /* -----------------------------   QuestionCard   --------------------------- */
// /* -------------------------------------------------------------------------- */

// function QuestionCard({ paperId, question, onQuestionChange, onFileUpload, onSaveSingle }) {
//   /* ---------- basic field setters ---------- */
//   function setField(field, val) {
//     onQuestionChange({ [field]: val });
//   }

//   /* ---------- sample helpers ---------- */
//   function addSample() {
//     const current = question.samples || [];
//     onQuestionChange({ samples: [...current, blankSample()] });
//   }

//   function updateSample(sid, payload) {
//     const current = question.samples || [];
//     const samples = current.map((s) => (s.id === sid ? { ...s, ...payload } : s));
//     onQuestionChange({ samples });
//   }

//   function deleteSample(sid) {
//     if (!confirm("Remove this sample?")) return;
//     const current = question.samples || [];
//     onQuestionChange({ samples: current.filter((s) => s.id !== sid) });
//   }

//   /* ---------- generate N samples via LLM ---------- */
//   const [nSamples, setNSamples] = useState(1);
//   const [generating, setGenerating] = useState(false);

//   async function generateSamples() {
//     if (!question.text?.trim()) {
//       alert("Please enter question text first.");
//       return;
//     }
//     setGenerating(true);
//     try {
//       const res = await fetch("/api/generate", {
//         method: "POST",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify({
//           prompt: question.text,
//           instructions: question.instructions || "",
//           images: question.images || [],
//           marks: question.marks || 0,
//           n: nSamples,
//         }),
//       });

//       const j = await res.json();
//       if (!j.success) throw new Error("Generation failed");

//       // j.samples might be [{answer1, answer2}, ...] OR strings
//       const parsedSamples = [];

//       (j.samples || []).forEach((s) => {
//         if (typeof s === "string") {
//           parsedSamples.push({ id: uuid(), answer: s, answerImages: [], rubric: { criteria: [] } });
//         } else if (typeof s === "object") {
//           // flatten answer1, answer2, ...
//           Object.values(s).forEach((ans) => {
//             parsedSamples.push({ id: uuid(), answer: ans, answerImages: [], rubric: { criteria: [] } });
//           });
//         }
//       });

//       // ✅ Generate rubric per sample
//       const enriched = parsedSamples.map((s) => ({ ...s, rubric: { criteria: [] } }));

//       onQuestionChange({
//         samples: [...(question.samples || []), ...enriched],
//       });
//     } catch (e) {
//       console.error(e);
//       alert("Generation error");
//     } finally {
//       setGenerating(false);
//     }
//   }

//   /* ---------- UI ---------- */
//   return (
//     <div style={{ marginTop: 8 }}>
//       {/* QUESTION TEXT */}
//       <div style={{ marginBottom: 8 }}>
//         <label style={{ display: "block", fontWeight: 600 }}>Question Text:</label>
//         <textarea
//           value={question.text}
//           onChange={(e) => setField("text", e.target.value)}
//           rows={3}
//           style={{ width: "100%" }}
//         />
//         {question.text && (
//           <div style={{ marginTop: 8, padding: 10, border: "1px solid #d1d5db", borderRadius: 6, backgroundColor: "#f9fafb" }}>
//             <Latex>{question.text}</Latex>
//           </div>
//         )}
//       </div>

//       {/* MARKS */}
//       <div style={{ marginBottom: 8 }}>
//         <label style={{ display: "block", fontWeight: 600 }}>Maximum Marks:</label>
//         <input
//           type="number"
//           value={question.marks}
//           onChange={(e) => setField("marks", Number(e.target.value))}
//           style={{ width: 120 }}
//         />
//       </div>

//       {/* QUESTION IMAGES */}
//       <div style={{ marginBottom: 8 }}>
//         <label style={{ display: "block", fontWeight: 600 }}>Question Images:</label>
//         <input type="file" accept="image/*" multiple onChange={(e) => onFileUpload(question.qid, e, "images")} />
//         <ImageThumbs
//           paths={question.images}
//           onDelete={(idx) =>
//             setField(
//               "images",
//               question.images.filter((_, i) => i !== idx),
//             )
//           }
//         />
//       </div>

//       {/* INSTRUCTIONS */}
//       <div style={{ marginBottom: 8 }}>
//         <label style={{ display: "block", fontWeight: 600 }}>Additional Instructions (for LLM):</label>
//         <textarea
//           value={question.instructions}
//           onChange={(e) => setField("instructions", e.target.value)}
//           rows={2}
//           style={{ width: "100%" }}
//         />
//       </div>

//       {/* LLM GENERATION CONTROLS */}
//       <div style={{ marginBottom: 12 }}>
//         <input
//           type="number"
//           min={1}
//           value={nSamples}
//           onChange={(e) => setNSamples(Number(e.target.value))}
//           style={{ width: 60, marginRight: 6 }}
//         />
//         <button onClick={generateSamples} disabled={generating}>
//           {generating ? "Generating…" : `⚡ Generate ${nSamples} Sample(s)`}
//         </button>
//       </div>

//       {/* SAMPLES LIST */}
//       <div style={{ marginBottom: 8 }}>
//         <strong>Sample Answers:</strong>{" "}
//         <button onClick={addSample} style={{ marginLeft: 6 }}>
//           + Add Sample
//         </button>
//       </div>

//       {(question.samples ?? []).map((s, idx) => (
//         <SampleCard
//           key={s.id}
//           index={idx}
//           sample={s}
//           questionMarks={question.marks}
//           paperId={paperId}
//           questionId={question.qid}
//           questionText={question.text}
//           onChange={(payload) => updateSample(s.id, payload)}
//           onDelete={() => deleteSample(s.id)}
//           onFileUpload={(e, field) =>
//             handleFileUpload(question.qid, e, field, s.id) // ✅ correct mapping
//           }
//         />
//       ))}

//       {/* SAVE BUTTON */}
//       <div style={{ marginTop: 6 }}>
//         <button onClick={onSaveSingle}>Save Question</button>
//       </div>
//     </div>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /* -----------------------------   SampleCard   ----------------------------- */
// /* -------------------------------------------------------------------------- */

// function SampleCard({ index, sample, questionMarks, paperId, questionId, questionText, onChange, onDelete, onFileUpload }) {

//   const [generatingRubric, setGeneratingRubric] = useState(false);

//   /* rubric helpers */
//   function addCriterion() {
//     onChange({
//       rubric: {
//         criteria: [...sample.rubric.criteria, { criterion: "", weight: 0 }],
//       },
//     });
//   }
//   function updateCriterion(i, field, val) {
//     const updated = sample.rubric.criteria.map((c, idx) =>
//       idx === i ? { ...c, [field]: field === "weight" ? Number(val) : val } : c,
//     );
//     /* validate sum */
//     const total = updated.reduce((sum, c) => sum + (c.weight || 0), 0);
//     if (total > questionMarks) {
//       alert("Total rubric weight exceeds max marks!");
//       return;
//     }
//     onChange({ rubric: { criteria: updated } });
//   }
//   function deleteCriterion(i) {
//     onChange({
//       rubric: { criteria: sample.rubric.criteria.filter((_, idx) => idx !== i) },
//     });
//   }

//   async function generateRubric() {
//     setGeneratingRubric(true);
//     try {
//       // Make sure you pass all required fields
//       const res = await fetch(`/api/papers/${paperId}/questions/${questionId}/rubric`, {
//         method: "POST",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify({
//           sampleAnswer: sample.answer,
//           maxMarks: questionMarks,
//           sampleImages: sample.answerImages || [],
//           questionText: questionText || "", // ✅ now correctly scoped
//         }),
//       });

//       const j = await res.json();

//       // Check for success and rubric
//       if (j.success && j.rubric && Array.isArray(j.rubric)) {
//         // j.rubric should now be in the format your SampleCard expects
//         onChange({ rubric: { criteria: j.rubric.map(r => ({ criterion: r.criteria, weight: r.max_marks })) } });
//       } else {
//         console.error("Rubric API response:", j);
//         alert("Failed to generate rubric. Check console for details.");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error generating rubric");
//     } finally {
//       setGeneratingRubric(false);
//     }
//   }

//   return (
//     <div style={{ border: "1px dashed #666", padding: 10, marginBottom: 12, borderRadius: 4 }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <em>Sample {index + 1}</em>
//         <button onClick={onDelete} style={{ color: "red" }}>
//           Delete Sample
//         </button>
//       </div>

//       {/* ANSWER TEXT */}
//       <div style={{ marginTop: 8, marginBottom: 8 }}>
//         <label style={{ display: "block", fontWeight: 600 }}>Answer:</label>
//         <textarea
//           value={sample.answer}
//           onChange={(e) => onChange({ answer: e.target.value })}
//           rows={4}
//           style={{ width: "100%" }}
//         />
//         {sample.answer && (
//           <div style={{ marginTop: 8, padding: 10, border: "1px solid #d1d5db", borderRadius: 6, backgroundColor: "#f9fafb" }}>
//             <Latex>{sample.answer}</Latex>
//           </div>
//         )}
//       </div>

//       {/* ANSWER IMAGES */}
//       <div style={{ marginBottom: 8 }}>
//         <label style={{ display: "block", fontWeight: 600 }}>Answer Images:</label>
//         <input
//           type="file"
//           accept="image/*"
//           multiple
//           onChange={(e) => onFileUpload(e, "answerImages")}
//         />
//         <ImageThumbs
//           paths={sample.answerImages}
//           onDelete={(idx) =>
//             onChange({
//               answerImages: sample.answerImages.filter((_, i) => i !== idx),
//             })
//           }
//         />
//       </div>

//       <button onClick={generateRubric} disabled={generatingRubric} style={{ marginBottom: 8 }}>
//         {generatingRubric ? "Generating…" : "⚡ Generate Rubric"}
//       </button>

//       {/* RUBRIC */}
//       <div style={{ marginBottom: 8 }}>
//         <label style={{ display: "block", fontWeight: 600 }}>Rubric (marks ≤ {questionMarks}):</label>
//         {sample.rubric.criteria.map((c, i) => (
//           <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
//             <input
//               type="text"
//               value={c.criterion}
//               onChange={(e) => updateCriterion(i, "criterion", e.target.value)}
//               placeholder="Criterion"
//               style={{ flex: 1 }}
//             />
//             <input
//               type="number"
//               value={c.weight}
//               onChange={(e) => updateCriterion(i, "weight", e.target.value)}
//               style={{ width: 80 }}
//             />
//             <button onClick={() => deleteCriterion(i)} style={{ color: "red" }}>
//               ✕
//             </button>
//           </div>
//         ))}
//         <button onClick={addCriterion}>+ Add Criterion</button>
//       </div>
//     </div>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /* -----------------------------   ImageThumbs   ---------------------------- */
// /* -------------------------------------------------------------------------- */

// function ImageThumbs({ paths, onDelete }) {
//   if (!paths?.length) return null;
//   return (
//     <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
//       {paths.map((p, i) => (
//         <div key={i} style={{ position: "relative", display: "inline-block" }}>
//           <img src={p} alt={`img-${i}`} style={{ width: 90, height: 60, objectFit: "cover", borderRadius: 4 }} />
//           <button
//             type="button"
//             onClick={() => onDelete(i)}
//             style={{
//               position: "absolute",
//               top: -6,
//               right: -6,
//               background: "red",
//               color: "white",
//               border: "none",
//               borderRadius: "50%",
//               width: 20,
//               height: 20,
//               cursor: "pointer",
//               fontSize: 12,
//             }}
//           >
//             ✕
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }




// ✅ src/app/paper/[id]/QuestionEditor.js
"use client";
import React, { useEffect, useState } from "react";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import "./QuestionEditor.css";
import { useRouter } from "next/navigation";

/* ---------- Helpers ---------- */
function uuid() {
  return (crypto.randomUUID && crypto.randomUUID()) || Date.now().toString();
}

function blankSample() {
  return {
    id: uuid(),
    instructions: "",
    instructionImages: [],
    answer: "",
    answerImages: [],
    rubric: { criteria: [] },
  };
}

function blankQuestion() {
  return {
    qid: uuid(),
    text: "",
    marks: 0,
    images: [],
    samples: [],
    isOr: false, // 🟩 CHANGE: Added isOr flag
  };
}

/* ---------- Top-level component ---------- */
export default function QuestionEditor({
  paperId,
  initialQuestions = [],
  onSaved,
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => setQuestions(initialQuestions), [initialQuestions]);

  async function handleSaveAndReview() {
    if (!confirm("Are you sure you want to save and review the paper?")) return;
    await persistQuestions(questions);
    router.push(`/teacher/papers/${paperId}/review`);
  }

  async function persistQuestions(newQuestions) {
    setSaving(true);
    try {
      const res = await fetch(`/api/papers/${paperId}`);
      const { success, data: paper } = await res.json();
      if (!success) throw new Error("Failed to load paper");

      const updatedPaperData = {
        ...paper.paper_data,
        questions: newQuestions,
      };

      const put = await fetch(`/api/papers/${paperId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...paper,
          paper_data: updatedPaperData,
        }),
      });

      const putj = await put.json();
      if (!putj.success) throw new Error("Failed to save");

      setQuestions(newQuestions);
      onSaved?.(putj.data);
    } catch (e) {
      console.error(e);
      alert("Save error — check console.");
    } finally {
      setSaving(false);
    }
  }

  function addQuestion() {
    setQuestions([...questions, blankQuestion()]);
  }

  function deleteQuestion(qid) {
    if (!confirm("Delete this question?")) return;
    const updated = questions.filter((q) => q.qid !== qid);
    setQuestions(updated);
    persistQuestions(updated);
  }

  function updateQuestion(qid, payload) {
    setQuestions((prev) =>
      prev.map((q) => (q.qid === qid ? { ...q, ...payload } : q))
    );
  }

  async function handleFileUpload(qid, e, targetField, sampleId = null) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const uploadedUrls = [];
    for (const f of files) {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("paperId", paperId);
      fd.append("qid", qid);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await res.json();

      if (j.success) uploadedUrls.push(j.url);
      else alert(`Failed to upload: ${f.name}`);
    }

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.qid !== qid) return q;
        if (!sampleId) {
          return {
            ...q,
            [targetField]: [...(q[targetField] || []), ...uploadedUrls],
          };
        }
        const samples = q.samples.map((s) =>
          s.id === sampleId
            ? {
              ...s,
              [targetField]: [...(s[targetField] || []), ...uploadedUrls],
            }
            : s
        );
        return { ...q, samples };
      })
    );
  }

  // 🟩 CHANGE: Toggle OR flag for a specific question
  function toggleOrFlag(qid) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.qid === qid ? { ...q, isOr: !q.isOr } : q
      )
    );
  }

  return (
    <div className="question-editor">
      <div className="question-editor-header">
        <h3>Questions</h3>
        <div className="header-buttons">
          <button onClick={addQuestion} className="btn btn-primary">
            + Add Question
          </button>
          <button
            onClick={handleSaveAndReview}
            disabled={saving}
            className="btn btn-success"
          >
            {saving ? "Saving…" : "💾 Save All"}
          </button>
        </div>
      </div>

      {questions.length === 0 && (
        <div className="empty-state">No questions yet</div>
      )}

      {questions.map((q, idx) => (
        <React.Fragment key={q.qid}>
          <div className="question-container">
            <div className="question-header">
              <h4 className="question-title">
                Question {idx + 1}{" "}
                {q.isOr && <span className="or-label">(OR)</span>}
              </h4>
              <div className="or-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={q.isOr}
                    onChange={() => toggleOrFlag(q.qid)}
                  />{" "}
                  Mark this as "OR" question
                </label>
              </div>
              <button
                onClick={() => deleteQuestion(q.qid)}
                className="btn btn-danger btn-small"
              >
                Delete
              </button>
            </div>

            <div className="question-content">
              <QuestionCard
                paperId={paperId}
                question={q}
                onQuestionChange={(payload) => updateQuestion(q.qid, payload)}
                onFileUpload={handleFileUpload}
                onSaveSingle={() => persistQuestions(questions)}
              />
            </div>
          </div>

          {/* 🟩 CHANGE: Render "OR" divider when this question or the next one has isOr=true */}
          {q.isOr && idx < questions.length - 1 && (
            <div className="or-divider">
              <span>— OR —</span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------- QuestionCard ---------- */
function QuestionCard({
  paperId,
  question,
  onQuestionChange,
  onFileUpload,
  onSaveSingle,
}) {
  function setField(field, val) {
    onQuestionChange({ [field]: val });
  }

  function addSample() {
    const current = question.samples || [];
    onQuestionChange({ samples: [...current, blankSample()] });
  }

  function updateSample(sid, payload) {
    const current = question.samples || [];
    const samples = current.map((s) => (s.id === sid ? { ...s, ...payload } : s));
    onQuestionChange({ samples });
  }

  function deleteSample(sid) {
    if (!confirm("Remove this sample?")) return;
    const current = question.samples || [];
    onQuestionChange({ samples: current.filter((s) => s.id !== sid) });
  }

  return (
    <div>
      {/* QUESTION TEXT */}
      <div className="form-group">
        <label className="form-label">Question Text:</label>
        <textarea
          value={question.text}
          onChange={(e) => setField("text", e.target.value)}
          rows={3}
          className="form-textarea"
        />
        {question.text && (
          <div className="latex-preview">
            <Latex>{question.text}</Latex>
          </div>
        )}
      </div>

      {/* MARKS */}
      <div className="form-group">
        <label className="form-label">Maximum Marks:</label>
        <input
          type="number"
          value={question.marks}
          onChange={(e) => setField("marks", Number(e.target.value))}
          className="form-input"
        />
      </div>

      {/* QUESTION IMAGES */}
      <div className="form-group">
        <label className="form-label">Question Images:</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onFileUpload(question.qid, e, "images")}
          className="form-file"
        />
        <ImageThumbs
          paths={question.images}
          onDelete={(idx) =>
            setField(
              "images",
              question.images.filter((_, i) => i !== idx)
            )
          }
        />
      </div>

      {/* SAMPLES LIST */}
      <div className="samples-section">
        <div className="samples-header">
          <h4 className="samples-title">Sample Answers</h4>
          <button onClick={addSample} className="btn btn-primary btn-small">
            + Add Sample
          </button>
        </div>

        {(question.samples ?? []).map((s, idx) => (
          <SampleCard
            key={s.id}
            index={idx}
            sample={s}
            questionMarks={question.marks}
            paperId={paperId}
            questionId={question.qid}
            questionText={question.text}
            questionImages={question.images}
            onChange={(payload) => updateSample(s.id, payload)}
            onDelete={() => deleteSample(s.id)}
            onFileUpload={(e, field) =>
              onFileUpload(question.qid, e, field, s.id)
            }
          />
        ))}
      </div>

      <div className="save-section">
        <button onClick={onSaveSingle} className="btn btn-secondary">
          Save Question
        </button>
      </div>
    </div>
  );
}

/* ---------- SampleCard ---------- */
function SampleCard({
  index,
  sample,
  questionMarks,
  paperId,
  questionId,
  questionText,
  questionImages,
  onChange,
  onDelete,
  onFileUpload,
}) {
  const [generatingRubric, setGeneratingRubric] = useState(false);
  const [generatingAnswer, setGeneratingAnswer] = useState(false);

  async function generateAnswer() {
    if (!questionText?.trim()) {
      alert("Please enter question text first.");
      return;
    }

    async function urlToBase64(url) {
      const res = await fetch(url);
      const blob = await res.blob();
      const buffer = await blob.arrayBuffer();

      function arrayBufferToBase64(buffer) {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, chunk);
        }
        return btoa(binary);
      }

      return {
        data: arrayBufferToBase64(buffer),
        mimeType: blob.type || "image/jpeg",
      };
    }

    setGeneratingAnswer(true);
    try {
      const allPaths = [
        ...(questionImages || []),
        ...(sample.instructionImages || []),
      ];
      const base64Images = await Promise.all(allPaths.map(urlToBase64));

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: questionText,
          instructions: sample.instructions || "",
          images: base64Images,
          marks: questionMarks || 0,
          n: 1,
        }),
      });

      const j = await res.json();
      if (!j.success) throw new Error("Generation failed");

      const parsedSamples = [];
      (j.samples || []).forEach((s) => {
        if (typeof s === "string") parsedSamples.push({ answer: s, answerImages: [] });
        else if (typeof s === "object")
          Object.values(s).forEach((ans) =>
            parsedSamples.push({ answer: ans, answerImages: [] })
          );
      });

      if (parsedSamples.length > 0)
        onChange({
          answer: parsedSamples[0].answer,
          answerImages: parsedSamples[0].answerImages || [],
        });
    } catch (e) {
      console.error(e);
      alert("Generation error");
    } finally {
      setGeneratingAnswer(false);
    }
  }

  function addCriterion() {
    onChange({
      rubric: {
        criteria: [...sample.rubric.criteria, { criterion: "", weight: 0 }],
      },
    });
  }

  function updateCriterion(i, field, val) {
    const updated = sample.rubric.criteria.map((c, idx) =>
      idx === i
        ? { ...c, [field]: field === "weight" ? Number(val) : val }
        : c
    );
    const total = updated.reduce((sum, c) => sum + (c.weight || 0), 0);
    if (total > questionMarks) {
      alert("Total rubric weight exceeds max marks!");
      return;
    }
    onChange({ rubric: { criteria: updated } });
  }

  function deleteCriterion(i) {
    onChange({
      rubric: { criteria: sample.rubric.criteria.filter((_, idx) => idx !== i) },
    });
  }

  async function generateRubric() {
    setGeneratingRubric(true);
    try {
      const res = await fetch(
        `/api/papers/${paperId}/questions/${questionId}/rubric`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            sampleAnswer: sample.answer,
            maxMarks: questionMarks,
            sampleImages: sample.answerImages || [],
            questionText: questionText || "",
          }),
        }
      );
      const j = await res.json();
      if (j.success && j.rubric && Array.isArray(j.rubric)) {
        onChange({
          rubric: {
            criteria: j.rubric.map((r) => ({
              criterion: r.criteria,
              weight: r.max_marks,
            })),
          },
        });
      } else {
        console.error("Rubric API response:", j);
        alert("Failed to generate rubric.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating rubric");
    } finally {
      setGeneratingRubric(false);
    }
  }

  return (
    <div className="sample-card">
      <div className="sample-header">
        <h5 className="sample-title">Sample {index + 1}</h5>
        <button onClick={onDelete} className="btn btn-danger btn-small">
          Delete Sample
        </button>
      </div>

      {/* INSTRUCTIONS */}
      <div className="form-group">
        <label className="form-label">Additional Instructions:</label>
        <textarea
          value={sample.instructions}
          onChange={(e) => onChange({ instructions: e.target.value })}
          rows={2}
          className="form-textarea"
        />
      </div>

      {/* INSTRUCTION IMAGES */}
      <div className="form-group">
        <label className="form-label">Instruction Images:</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onFileUpload(e, "instructionImages")}
          className="form-file"
        />
        <ImageThumbs
          paths={sample.instructionImages}
          onDelete={(idx) =>
            onChange({
              instructionImages: sample.instructionImages.filter((_, i) => i !== idx),
            })
          }
        />
      </div>

      {/* GENERATE ANSWER */}
      <div className="generation-controls">
        <button
          onClick={generateAnswer}
          disabled={generatingAnswer}
          className="btn btn-generate"
        >
          {generatingAnswer ? "Generating…" : "Generate Answer"}
        </button>
      </div>

      {/* ANSWER TEXT */}
      <div className="form-group">
        <label className="form-label">Answer:</label>
        <textarea
          value={sample.answer}
          onChange={(e) => onChange({ answer: e.target.value })}
          rows={4}
          className="form-textarea"
        />
{sample.answer && (
  <div className="latex-preview">
    {sample.answer
      .split(/\n{2,}/) // split on double or more newlines
      .map((para, i) => (
        <div key={i} style={{ marginBottom: "1em" }}>
          {para.split(/\n/).map((line, j) => (
            <div key={j}>
              <Latex>{line}</Latex>
            </div>
          ))}
        </div>
      ))}
  </div>
)}


      </div>

      {/* ANSWER IMAGES */}
      <div className="form-group">
        <label className="form-label">Answer Images:</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onFileUpload(e, "answerImages")}
          className="form-file"
        />
        <ImageThumbs
          paths={sample.answerImages}
          onDelete={(idx) =>
            onChange({
              answerImages: sample.answerImages.filter((_, i) => i !== idx),
            })
          }
        />
      </div>

      {/* GENERATE RUBRIC */}
      <button
        onClick={generateRubric}
        disabled={generatingRubric}
        className="btn btn-generate"
      >
        {generatingRubric ? "Generating…" : "Generate Rubric"}
      </button>

      {/* RUBRIC */}
      <div className="rubric-section">
        <div className="rubric-title">
          Rubric (marks ≤ {questionMarks}):
        </div>
        {sample.rubric.criteria.map((c, i) => (
          <div key={i} className="rubric-item">
            <input
              type="text"
              value={c.criterion}
              onChange={(e) => updateCriterion(i, "criterion", e.target.value)}
              placeholder="Criterion"
              className="form-input rubric-criterion"
            />
            <input
              type="number"
              value={c.weight}
              onChange={(e) => updateCriterion(i, "weight", e.target.value)}
              className="form-input rubric-weight"
            />
            <button onClick={() => deleteCriterion(i)} className="rubric-delete">
              ✕
            </button>
          </div>
        ))}
        <button onClick={addCriterion} className="btn btn-primary btn-small">
          + Add Criterion
        </button>
      </div>
    </div>
  );
}

/* ---------- ImageThumbs ---------- */
function ImageThumbs({ paths, onDelete }) {
  if (!paths?.length) return null;
  return (
    <div className="image-thumbnails">
      {paths.map((p, i) => (
        <div key={i} className="image-thumb">
          <img src={p} alt={`img-${i}`} />
          <button
            type="button"
            onClick={() => onDelete(i)}
            className="image-delete-btn"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
