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
import Image from "next/image";

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
  const [toast, setToast] = useState(null); // Toast notification
  const [expandedQuestions, setExpandedQuestions] = useState({}); // Collapsible state
  const [bulkGenExpanded, setBulkGenExpanded] = useState(false); // Bulk generation collapsible
  const [bulkInstruction, setBulkInstruction] = useState(""); // Global instruction for bulk generation
  const [bulkGenerating, setBulkGenerating] = useState(false); // Bulk generation status
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 }); // Progress tracker
  // 🆕 Bulk Rubric Generation State
  const [bulkRubricGenExpanded, setBulkRubricGenExpanded] = useState(false);
  const [bulkRubricGenerating, setBulkRubricGenerating] = useState(false);
  const [bulkRubricProgress, setBulkRubricProgress] = useState({ current: 0, total: 0 });
  const router = useRouter();

  useEffect(() => {
    setQuestions(initialQuestions);
    // Keep all questions collapsed on load
    const expanded = {};
    initialQuestions.forEach(q => { expanded[q.qid] = false; });
    setExpandedQuestions(expanded);
  }, [initialQuestions]);

  // Toast helper
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Toggle question collapse
  const toggleExpand = (qid) => {
    setExpandedQuestions(prev => ({ ...prev, [qid]: !prev[qid] }));
  };

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

      // Remove enriched fields that were added by GET but don't exist in DB
      const { institute, teacher_name, ...paperToSave } = paper;

      const put = await fetch(`/api/papers/${paperId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...paperToSave,
          paper_data: updatedPaperData,
        }),
      });

      const putj = await put.json();
      if (!putj.success) {
        console.error('API Error:', putj);
        throw new Error(putj.error || putj.message || "Failed to save");
      }

      setQuestions(newQuestions);
      onSaved?.(putj.data);
      showToast('success', '✅ Saved successfully!');
    } catch (e) {
      console.error(e);
      showToast('error', 'Save error — check console.');
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

  // 🆕 Retry helper with exponential backoff
  async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const isLastAttempt = attempt === maxRetries - 1;

        // Check if error is retryable (503, 429, network errors, etc)
        const isRetryable =
          error.message?.includes('503') ||
          error.message?.includes('429') ||
          error.message?.includes('overload') ||
          error.message?.includes('timeout') ||
          error.message?.includes('network') ||
          error.status === 503 ||
          error.status === 429;

        if (!isRetryable || isLastAttempt) {
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // 🟩 CHANGE: Toggle OR flag for a specific question
  function toggleOrFlag(qid) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.qid === qid ? { ...q, isOr: !q.isOr } : q
      )
    );
  }

  // 🆕 Bulk Answer Generation
  async function handleBulkGenerate() {
    if (!bulkInstruction.trim()) {
      alert("Please provide generation instructions.");
      return;
    }

    if (!confirm(`Generate sample answers for all questions with instruction: "${bulkInstruction}"?`)) {
      return;
    }

    // Helper function to convert URL to base64
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

    setBulkGenerating(true);

    // Calculate total items to generate
    // Count each sample that will be generated (questions with text will get samples)
    let totalItems = 0;
    questions.forEach(q => {
      if (q.text?.trim()) {
        // Each question with text will have samples generated
        const sampleCount = q.samples && q.samples.length > 0 ? q.samples.length : 1;
        totalItems += sampleCount;
      }
    });

    setBulkProgress({ current: 0, total: totalItems });

    let currentItem = 0;
    const updatedQuestions = [...questions];

    try {
      for (let qIdx = 0; qIdx < updatedQuestions.length; qIdx++) {
        const question = updatedQuestions[qIdx];

        if (!question.text?.trim()) {
          showToast('warning', `⚠️ Skipping Q${qIdx + 1} - no question text`);
          continue;
        }

        if (!question.samples || question.samples.length === 0) {
          // Create one sample if none exists
          updatedQuestions[qIdx].samples = [blankSample()];
        }

        for (let sIdx = 0; sIdx < updatedQuestions[qIdx].samples.length; sIdx++) {
          const sample = updatedQuestions[qIdx].samples[sIdx];

          try {
            const allPaths = [...(sample.instructionImages || [])];
            const base64Images = await Promise.all(allPaths.map(urlToBase64));

            // Wrap API call with retry logic
            await retryWithBackoff(async () => {
              const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  prompt: question.text,
                  instructions: bulkInstruction,
                  images: base64Images,
                  marks: question.marks || 0,
                  n: 1,
                }),
              });

              const j = await res.json();
              if (!j.success) {
                const error = new Error(j.error || "Generation failed");
                error.status = res.status;
                throw error;
              }

              const parsedSamples = [];

              // Helper to extract actual answer from potentially JSON-wrapped strings
              const extractAnswer = (ans) => {
                if (typeof ans !== 'string') return String(ans);
                let text = ans;
                // If the answer is a JSON string, parse it and extract the answer
                try {
                  if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
                    const parsed = JSON.parse(text);
                    text = parsed.answer1 || parsed.answer2 || parsed.answer ||
                      parsed.content || parsed.text || Object.values(parsed)[0] || text;
                  }
                } catch (e) { /* Not JSON, use as is */ }
                // Clean up escaping - handle all newline variants
                return text
                  .replace(/\\\\n/g, '\n')
                  .replace(/\\n/g, '\n')
                  .replace(/\\\\/g, '\\')
                  .replace(/\\\$/g, '$');
              };

              (j.samples || []).forEach((s) => {
                if (typeof s === "string") parsedSamples.push({ answer: extractAnswer(s), answerImages: [] });
                else if (typeof s === "object")
                  Object.values(s).forEach((ans) =>
                    parsedSamples.push({ answer: extractAnswer(ans), answerImages: [] })
                  );
              });

              if (parsedSamples.length > 0) {
                updatedQuestions[qIdx].samples[sIdx].answer = parsedSamples[0].answer;
                updatedQuestions[qIdx].samples[sIdx].answerImages = parsedSamples[0].answerImages || [];
              }
            });

            currentItem++;
            setBulkProgress({ current: currentItem, total: totalItems });

          } catch (err) {
            console.error(`Error generating answer for Q${qIdx + 1}, Variant ${sIdx + 1}:`, err);
            showToast('error', `❌ Failed Q${qIdx + 1}, Variant ${sIdx + 1}`);
          }
        }
      }

      setQuestions(updatedQuestions);
      showToast('success', `✅ Bulk generation complete! Generated ${currentItem} answer(s).`);

    } catch (e) {
      console.error(e);
      showToast('error', '❌ Bulk generation error');
    } finally {
      setBulkGenerating(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  }

  // 🆕 Bulk Rubric Generation
  async function handleBulkRubricGenerate() {
    if (!confirm(`Generate rubrics for all samples in all questions?`)) {
      return;
    }

    setBulkRubricGenerating(true);

    // Calculate total items to generate rubrics for
    let totalItems = 0;
    questions.forEach(q => {
      if (q.samples && q.samples.length > 0) {
        // Only count samples that have answers
        q.samples.forEach(s => {
          if (s.answer?.trim() || (s.answerImages && s.answerImages.length > 0)) {
            totalItems++;
          }
        });
      }
    });

    if (totalItems === 0) {
      showToast('warning', '⚠️ No samples with answers found to generate rubrics for.');
      setBulkRubricGenerating(false);
      return;
    }

    setBulkRubricProgress({ current: 0, total: totalItems });

    let currentItem = 0;
    const updatedQuestions = [...questions];

    try {
      for (let qIdx = 0; qIdx < updatedQuestions.length; qIdx++) {
        const question = updatedQuestions[qIdx];

        if (!question.text?.trim()) {
          showToast('warning', `⚠️ Skipping Q${qIdx + 1} - no question text`);
          continue;
        }

        if (!question.samples || question.samples.length === 0) {
          continue;
        }

        for (let sIdx = 0; sIdx < updatedQuestions[qIdx].samples.length; sIdx++) {
          const sample = updatedQuestions[qIdx].samples[sIdx];

          // Skip samples without answers
          if (!sample.answer?.trim() && (!sample.answerImages || sample.answerImages.length === 0)) {
            continue;
          }

          try {
            // Wrap API call with retry logic
            await retryWithBackoff(async () => {
              const res = await fetch(`/api/papers/${paperId}/questions/${question.qid}/rubric`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  sampleAnswer: sample.answer || "",
                  maxMarks: question.marks || 0,
                  sampleImages: sample.answerImages || [],
                  questionText: question.text,
                }),
              });

              const j = await res.json();

              if (j.success && j.rubric && Array.isArray(j.rubric)) {
                updatedQuestions[qIdx].samples[sIdx].rubric = {
                  criteria: j.rubric.map(r => ({
                    criterion: r.criteria,
                    weight: r.max_marks
                  }))
                };
              } else {
                const error = new Error(j.error || "Failed to generate rubric");
                error.status = res.status;
                throw error;
              }
            });

            currentItem++;
            setBulkRubricProgress({ current: currentItem, total: totalItems });

          } catch (err) {
            console.error(`Error generating rubric for Q${qIdx + 1}, Variant ${sIdx + 1}:`, err);
            showToast('error', `❌ Failed rubric Q${qIdx + 1}, Variant ${sIdx + 1}`);
          }
        }
      }

      setQuestions(updatedQuestions);
      showToast('success', `✅ Bulk rubric generation complete! Generated ${currentItem} rubric(s).`);

    } catch (e) {
      console.error(e);
      showToast('error', '❌ Bulk rubric generation error');
    } finally {
      setBulkRubricGenerating(false);
      setBulkRubricProgress({ current: 0, total: 0 });
    }
  }

  return (
    <div className="question-editor">
      {/* Toast Notification */}
      {toast && (
        <div className={`qe-toast ${toast.type}`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)}>×</button>
        </div>
      )}

      <div className="question-editor-header">
        <h3>📝 Questions & Sample Answers</h3>
        <div className="header-buttons">
          <button onClick={addQuestion} className="btn-icon btn-add">
            <span className="icon">➕</span> Add Question
          </button>
          <button
            onClick={handleSaveAndReview}
            disabled={saving}
            className="btn-icon btn-save"
          >
            <span className="icon">💾</span> {saving ? "Saving…" : "Save & Review"}
          </button>
        </div>
      </div>

      {/* 🆕 Bulk Generation Sections - Grouped */}
      {questions.length > 0 && (
        <div className="bulk-actions-wrapper">
          {/* Bulk Answer Generation */}
          <div className="bulk-generation-section">
            <div
              className="bulk-gen-header"
              onClick={() => setBulkGenExpanded(!bulkGenExpanded)}
              style={{ cursor: 'pointer' }}
            >
              <div className="bulk-gen-title">
                <span className="expand-arrow">{bulkGenExpanded ? '▼' : '▶'}</span>
                <h4>⚡ Bulk Answer Generation</h4>
              </div>
              <span className="bulk-gen-hint">Generate answers for all questions at once</span>
            </div>

            {bulkGenExpanded && (
              <div className="bulk-gen-content">
                <div className="form-group">
                  <label className="form-label">
                    Global Instruction for All Answers
                  </label>
                  <p className="field-description">
                    Provide one instruction that will be applied to generate answers for all questions.
                    Example: "generate simple theoretical answers" or "use practical examples with diagrams"
                  </p>
                  <textarea
                    value={bulkInstruction}
                    onChange={(e) => setBulkInstruction(e.target.value)}
                    rows={2}
                    className="form-textarea"
                    placeholder="e.g., Focus on theoretical explanations with simple language..."
                    disabled={bulkGenerating}
                  />
                </div>

                <div className="bulk-gen-controls">
                  <button
                    onClick={handleBulkGenerate}
                    disabled={bulkGenerating || !bulkInstruction.trim()}
                    className="btn btn-generate"
                  >
                    {bulkGenerating
                      ? `Generating... (${bulkProgress.current}/${bulkProgress.total})`
                      : "✨ Generate All Answers"}
                  </button>

                  {bulkGenerating && (
                    <div className="bulk-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(bulkProgress.current / bulkProgress.total) * 100}%`
                          }}
                        />
                      </div>
                      <span className="progress-text">
                        {bulkProgress.current} of {bulkProgress.total} completed
                      </span>
                    </div>
                  )}
                </div>

                <p className="ai-disclaimer">
                  ⚠️ This will generate answers for ALL questions sequentially.
                  Individual sample instructions will be overridden by this global instruction.
                </p>
              </div>
            )}
          </div>

          {/* Divider between sections */}
          <div className="bulk-divider"></div>

          {/* 🆕 Bulk Rubric Generation Section */}
          <div className="bulk-generation-section bulk-rubric-section">
            <div
              className="bulk-gen-header"
              onClick={() => setBulkRubricGenExpanded(!bulkRubricGenExpanded)}
              style={{ cursor: 'pointer' }}
            >
              <div className="bulk-gen-title">
                <span className="expand-arrow">{bulkRubricGenExpanded ? '▼' : '▶'}</span>
                <h4>📋 Bulk Rubric Generation</h4>
              </div>
              <span className="bulk-gen-hint">Generate rubrics for all sample answers at once</span>
            </div>

            {bulkRubricGenExpanded && (
              <div className="bulk-gen-content">
                <p className="field-description">
                  This will generate evaluation rubrics for all samples that have answers.
                  The rubric is generated based on the question text, sample answer, and maximum marks.
                </p>

                <div className="bulk-gen-controls">
                  <button
                    onClick={handleBulkRubricGenerate}
                    disabled={bulkRubricGenerating}
                    className="btn btn-generate"
                  >
                    {bulkRubricGenerating
                      ? `Generating... (${bulkRubricProgress.current}/${bulkRubricProgress.total})`
                      : "✨ Generate All Rubrics"}
                  </button>

                  {bulkRubricGenerating && (
                    <div className="bulk-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(bulkRubricProgress.current / bulkRubricProgress.total) * 100}%`
                          }}
                        />
                      </div>
                      <span className="progress-text">
                        {bulkRubricProgress.current} of {bulkRubricProgress.total} completed
                      </span>
                    </div>
                  )}
                </div>

                <p className="ai-disclaimer">
                  ⚠️ This will generate rubrics for ALL samples with answers sequentially.
                  Existing rubrics will be replaced.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {questions.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>No questions yet. Click "Add Question" to get started.</p>
        </div>
      )}

      {(() => {
        const elements = [];
        let i = 0;

        while (i < questions.length) {
          const q = questions[i];
          const isExpanded = expandedQuestions[q.qid] !== false;
          const previewText = q.text?.substring(0, 80) || "No question text";

          // Check if this starts an OR pair
          if (q.isOr && i + 1 < questions.length) {
            const q2 = questions[i + 1];
            const isExpanded2 = expandedQuestions[q2.qid] !== false;
            const previewText2 = q2.text?.substring(0, 80) || "No question text";

            // Wrap both questions in ONE OR container
            elements.push(
              <div key={`or-pair-${q.qid}`} className="or-pair-container">
                <div className="or-pair-label">⚡ OR Pair</div>

                {/* First question in pair */}
                <div className={`question-container ${isExpanded ? 'expanded' : 'collapsed'} in-or-pair`}>
                  <div className="question-header-collapsible" onClick={() => toggleExpand(q.qid)}>
                    <div className="header-left">
                      <span className="expand-arrow">{isExpanded ? '▼' : '▶'}</span>
                      <h4 className="question-title">
                        Q{i + 1}
                        <span className="or-badge">OR</span>
                        <span className="marks-badge">{q.marks} marks</span>
                      </h4>
                      {!isExpanded && <span className="question-preview">{previewText}...</span>}
                    </div>
                    <div className="header-right" onClick={e => e.stopPropagation()}>
                      <label className="or-checkbox">
                        <input type="checkbox" checked={q.isOr} onChange={() => toggleOrFlag(q.qid)} /> OR
                      </label>
                      <button onClick={() => deleteQuestion(q.qid)} className="btn-icon btn-delete-small" title="Delete">🗑️</button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="question-content">
                      <QuestionCard paperId={paperId} question={q} onQuestionChange={(payload) => updateQuestion(q.qid, payload)} onFileUpload={handleFileUpload} onSaveSingle={() => persistQuestions(questions)} />
                    </div>
                  )}
                </div>

                {/* OR Divider */}
                <div className="or-divider-inside">
                  <span>— OR —</span>
                </div>

                {/* Second question in pair */}
                <div className={`question-container ${isExpanded2 ? 'expanded' : 'collapsed'} in-or-pair`}>
                  <div className="question-header-collapsible" onClick={() => toggleExpand(q2.qid)}>
                    <div className="header-left">
                      <span className="expand-arrow">{isExpanded2 ? '▼' : '▶'}</span>
                      <h4 className="question-title">
                        Q{i + 2}
                        <span className="marks-badge">{q2.marks} marks</span>
                      </h4>
                      {!isExpanded2 && <span className="question-preview">{previewText2}...</span>}
                    </div>
                    <div className="header-right" onClick={e => e.stopPropagation()}>
                      <button onClick={() => deleteQuestion(q2.qid)} className="btn-icon btn-delete-small" title="Delete">🗑️</button>
                    </div>
                  </div>
                  {isExpanded2 && (
                    <div className="question-content">
                      <QuestionCard paperId={paperId} question={q2} onQuestionChange={(payload) => updateQuestion(q2.qid, payload)} onFileUpload={handleFileUpload} onSaveSingle={() => persistQuestions(questions)} />
                    </div>
                  )}
                </div>
              </div>
            );
            i += 2; // Skip both questions
          } else {
            // Regular question (not in OR pair)
            elements.push(
              <div key={q.qid} className={`question-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
                <div className="question-header-collapsible" onClick={() => toggleExpand(q.qid)}>
                  <div className="header-left">
                    <span className="expand-arrow">{isExpanded ? '▼' : '▶'}</span>
                    <h4 className="question-title">
                      Q{i + 1}
                      <span className="marks-badge">{q.marks} marks</span>
                    </h4>
                    {!isExpanded && <span className="question-preview">{previewText}...</span>}
                  </div>
                  <div className="header-right" onClick={e => e.stopPropagation()}>
                    <label className="or-checkbox">
                      <input type="checkbox" checked={q.isOr} onChange={() => toggleOrFlag(q.qid)} /> OR
                    </label>
                    <button onClick={() => deleteQuestion(q.qid)} className="btn-icon btn-delete-small" title="Delete">🗑️</button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="question-content">
                    <QuestionCard paperId={paperId} question={q} onQuestionChange={(payload) => updateQuestion(q.qid, payload)} onFileUpload={handleFileUpload} onSaveSingle={() => persistQuestions(questions)} />
                  </div>
                )}
              </div>
            );
            i += 1;
          }
        }

        return elements;
      })()}
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
  // Clarity analysis state
  const [clarityAnalysis, setClarityAnalysis] = useState(null);
  const [analyzingClarity, setAnalyzingClarity] = useState(false);

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

  // Clarity analysis handler with retry for 503 errors
  async function analyzeClarity() {
    if (!question.text?.trim()) {
      alert("Please enter question text first.");
      return;
    }

    const samples = question.samples || [];
    if (!samples.length || !samples.some(s => s.answer?.trim())) {
      alert("Please generate at least one sample answer first.");
      return;
    }

    setAnalyzingClarity(true);
    setClarityAnalysis(null);

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const res = await fetch("/api/analyze-clarity", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            question: question.text,
            marks: question.marks || 0,
            samples: samples.filter(s => s.answer?.trim()).map(s => ({
              answer: s.answer,
              answerImages: s.answerImages || []
            }))
          }),
        });

        // Handle 503 with retry
        if (res.status === 503 || res.status === 429) {
          attempt++;
          if (attempt < maxRetries) {
            const delay = 1000 * Math.pow(2, attempt); // Exponential backoff: 2s, 4s
            console.log(`Got ${res.status}, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        const data = await res.json();
        if (data.success && data.analysis) {
          setClarityAnalysis(data.analysis);
          break; // Success, exit loop
        } else {
          // Non-retryable error
          alert(data.error || "Failed to analyze clarity");
          break;
        }
      } catch (err) {
        console.error("Clarity analysis error:", err);
        attempt++;
        if (attempt >= maxRetries) {
          alert("Error analyzing question clarity after multiple retries");
          break;
        }
        // Wait before retry
        const delay = 1000 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    setAnalyzingClarity(false);
  }

  // Accept suggested question
  function acceptSuggestedQuestion() {
    if (clarityAnalysis?.suggestedQuestion) {
      setField("text", clarityAnalysis.suggestedQuestion);
      setClarityAnalysis(null);
    }
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



      {/* ANSWER VARIANTS */}
      <div className="samples-section">
        <div className="samples-header">
          <div className="samples-title-group">
            <h4 className="samples-title">Answer Variants</h4>
            <p className="samples-description">Add one or more valid answers for this question. Each variant will have its own rubric for evaluation.</p>
          </div>
          <button onClick={addSample} className="btn btn-primary btn-small">
            + Add Variant
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
            onChange={(payload) => updateSample(s.id, payload)}
            onDelete={() => deleteSample(s.id)}
            onFileUpload={(e, field) =>
              onFileUpload(question.qid, e, field, s.id)
            }
          />
        ))}
      </div>

      {/* CLARITY ANALYSIS SECTION */}
      {(question.samples?.length > 0 && question.samples.some(s => s.answer?.trim())) && (
        <div className="clarity-analysis-section">
          <div className="clarity-header">
            <h4>🔍 Question Clarity Check</h4>
            <button
              onClick={analyzeClarity}
              disabled={analyzingClarity}
              className="btn btn-analyze"
            >
              {analyzingClarity ? "Analyzing..." : "Analyze Clarity"}
            </button>
          </div>

          {clarityAnalysis && (
            <div className={`clarity-results ${clarityAnalysis.isUnambiguous ? 'clarity-success' : 'clarity-warning'}`}>
              {clarityAnalysis.isUnambiguous ? (
                <div className="clarity-status-good">
                  <span className="status-icon">✅</span>
                  <span>Question is clear and unambiguous!</span>
                </div>
              ) : (
                <>
                  <div className="clarity-status-warning">
                    <span className="status-icon">⚠️</span>
                    <span>Some issues found with question clarity</span>
                  </div>

                  {clarityAnalysis.issues?.length > 0 && (
                    <div className="clarity-issues">
                      <strong>Issues:</strong>
                      <ul>
                        {clarityAnalysis.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {clarityAnalysis.reasoning && (
                    <div className="clarity-reasoning">
                      <strong>Analysis:</strong>
                      <p>{clarityAnalysis.reasoning}</p>
                    </div>
                  )}

                  {clarityAnalysis.suggestedQuestion && clarityAnalysis.suggestedQuestion !== question.text && (
                    <div className="clarity-suggestion">
                      <strong>Suggested Question:</strong>
                      <div className="suggested-text">
                        <Latex>{clarityAnalysis.suggestedQuestion}</Latex>
                      </div>
                      <div className="suggestion-actions">
                        <button onClick={acceptSuggestedQuestion} className="btn btn-accept">
                          ✓ Accept Suggestion
                        </button>
                        <button onClick={() => setClarityAnalysis(null)} className="btn btn-dismiss">
                          ✕ Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

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
      const allPaths = [...(sample.instructionImages || [])];
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

      // Helper to extract actual answer from potentially JSON-wrapped strings
      const extractAnswer = (ans) => {
        if (typeof ans !== 'string') return String(ans);
        let text = ans;
        try {
          if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
            const parsed = JSON.parse(text);
            text = parsed.answer1 || parsed.answer2 || parsed.answer ||
              parsed.content || parsed.text || Object.values(parsed)[0] || text;
          }
        } catch (e) { /* Not JSON */ }
        return text
          .replace(/\\\\n/g, '\n')
          .replace(/\\n/g, '\n')
          .replace(/\\\\/g, '\\')
          .replace(/\\\$/g, '$');
      };

      (j.samples || []).forEach((s) => {
        if (typeof s === "string") parsedSamples.push({ answer: extractAnswer(s), answerImages: [] });
        else if (typeof s === "object")
          Object.values(s).forEach((ans) =>
            parsedSamples.push({ answer: extractAnswer(ans), answerImages: [] })
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
        <h5 className="sample-title">Variant {index + 1}</h5>
        <button onClick={onDelete} className="btn btn-danger btn-small">
          Remove
        </button>
      </div>

      {/* DASES AI GUIDANCE */}
      <div className="form-group">
        <label className="form-label">DASES AI Guidance <span className="label-hint">(optional)</span></label>
        <p className="field-description">Provide hints or specific instructions for DASES AI to generate this answer variant.</p>
        <textarea
          value={sample.instructions}
          onChange={(e) => onChange({ instructions: e.target.value })}
          rows={2}
          className="form-textarea"
          placeholder="e.g., Focus on theoretical explanation, use simple language, include a worked example..."
        />
      </div>

      {/* REFERENCE IMAGES */}
      <div className="form-group">
        <label className="form-label">Reference Images <span className="label-hint">(optional)</span></label>
        <p className="field-description">Upload diagrams, graphs, or figures that DASES AI should reference when generating the answer.</p>
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
          {generatingAnswer ? "Generating…" : "✨ Generate with DASES AI"}
        </button>
        <span className="generation-hint">or write the answer manually below</span>
      </div>
      <p className="ai-disclaimer">DASES AI can make mistakes. Always review generated content.</p>

      {/* ANSWER TEXT */}
      <div className="form-group">
        <label className="form-label">Model Answer</label>
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
          <Image src={p} alt={`img-${i}`} />
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
