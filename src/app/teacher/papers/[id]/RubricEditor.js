//src/app/paper/[id]/RubricEditor.js




"use client";
import { useState, useEffect } from "react";

export default function RubricEditor({ paperId, initialRubrics = [], onSaved }) {
  const [rubrics, setRubrics] = useState(initialRubrics);
  const [questions, setQuestions] = useState([]);
  const [finalized, setFinalized] = useState(false);

  // Load questions from API
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/papers/${paperId}`);
      const pj = await res.json();
      if (pj.success) {
        setQuestions(pj.data.questions || []);
        if (pj.data.status === "draft") setFinalized(true);
      }
    })();
  }, [paperId]);

  const handleChange = (qid, idx, field, value) => {
    const updated = rubrics.map((r) => {
      if (r.questionQid === qid) {
        const newCriteria = [...(r.criteria || [])];
        newCriteria[idx] = { ...newCriteria[idx], [field]: value };
        return { ...r, criteria: newCriteria };
      }
      return r;
    });
    setRubrics(updated);
  };

  const addCriterion = (qid) => {
    const updated = rubrics.map((r) =>
      r.questionQid === qid
        ? { ...r, criteria: [...(r.criteria || []), { criterion: "", weight: 0 }] }
        : r
    );
    setRubrics(updated);
  };

  const removeCriterion = (qid, idx) => {
    const updated = rubrics.map((r) => {
      if (r.questionQid === qid) {
        const newCriteria = [...(r.criteria || [])];
        newCriteria.splice(idx, 1);
        return { ...r, criteria: newCriteria };
      }
      return r;
    });
    setRubrics(updated);
  };

  const save = async (statusUpdate) => {
    const res = await fetch(`/api/papers/${paperId}`);
    const pj = await res.json();
    if (!pj.success) return alert("Failed to load paper");

    let paper = pj.data;
    paper.rubrics = rubrics;
    if (statusUpdate) paper.status = statusUpdate;

    await fetch(`/api/papers/${paperId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(paper),
    });

    if (statusUpdate) {
      setFinalized(true);
      alert("Paper finalized.");
    } else {
      alert("Rubrics saved.");
    }

    onSaved && onSaved();
  };

  const finalize = async () => {
    await save("finalized");
  };

const downloadPaperPDF = async () => {
  const res = await fetch(`/api/papers/${paperId}`);
  const pj = await res.json();
  if (!pj.success) return alert("Failed to load paper");

  const paper = pj.data;

  // Build question paper content
  const newWindow = window.open("", "_blank");
  newWindow.document.write(`
    <html>
      <head>
        <title>Question Paper - ${paper.subjectName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.5; margin: 40px; }
          h1, h2, h3 { text-align: center; margin-bottom: 5px; }
          .meta { text-align: center; margin-bottom: 30px; }
          .question { margin: 20px 0; }
          .marks { float: right; font-weight: bold; }
          hr { margin: 30px 0; }
        </style>
      </head>
      <body>
        <h1>${paper.subjectName} (${paper.subjectCode})</h1>
        <h3>Year: ${paper.year}</h3>
        <div class="meta">
          Faculty: ${paper.facultyName} <br/>
          Status: ${paper.status}
        </div>
        <hr/>
        ${paper.questions
          .map((q, i) => {
            const rub = paper.rubrics.find(r => r.questionQid === q.qid);
            const totalMarks = (rub?.criteria || []).reduce(
              (sum, c) => sum + (c.weight || 0),
              0
            );
            return `
              <div class="question">
                <div><strong>Q${i + 1}.</strong> ${q.text}</div>
                <div class="marks">[${totalMarks} Marks]</div>
              </div>
            `;
          })
          .join("")}
      </body>
    </html>
  `);
  newWindow.document.close();
  newWindow.print();
};


  if (!rubrics || rubrics.length === 0) {
    return <p>No rubrics yet. Generate them first.</p>;
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: 10, marginTop: 20 }}>
      <h4>Rubric Editor</h4>

      {questions.map((q) => {
        const rub = rubrics.find((r) => r.questionQid === q.qid) || {
          questionQid: q.qid,
          criteria: [],
        };

        const totalMarks = (rub.criteria || []).reduce(
          (sum, c) => sum + (c.weight || 0),
          0
        );

        return (
          <div
            key={q.qid}
            style={{
              marginBottom: 20,
              padding: 10,
              border: "1px solid #aaa",
              borderRadius: 6,
            }}
          >
            <strong>Q: {q.text || "(Untitled Question)"}</strong>
            <div style={{ margin: "6px 0", fontStyle: "italic" }}>
              Max Marks: {totalMarks}
            </div>

            {(rub.criteria || []).map((c, i) => (
              <div key={i} style={{ marginTop: 6 }}>
                <input
                  type="text"
                  value={c.criterion}
                  onChange={(e) =>
                    handleChange(q.qid, i, "criterion", e.target.value)
                  }
                  placeholder="Criterion"
                  disabled={finalized}
                  style={{ marginRight: 10, width: "60%" }}
                />
                <input
                  type="number"
                  value={c.weight}
                  onChange={(e) =>
                    handleChange(q.qid, i, "weight", Number(e.target.value))
                  }
                  placeholder="Marks"
                  disabled={finalized}
                  style={{ marginRight: 10, width: 80 }}
                />
                {!finalized && (
                  <button onClick={() => removeCriterion(q.qid, i)}>
                    ❌ Remove
                  </button>
                )}
              </div>
            ))}

            {!finalized && (
              <button onClick={() => addCriterion(q.qid)} style={{ marginTop: 8 }}>
                + Add Criterion
              </button>
            )}
          </div>
        );
      })}

      {!finalized && (
        <div>
          <button onClick={() => save()}>💾 Save Rubrics</button>
          <button onClick={finalize} style={{ marginLeft: 10 }}>
            ✅ Finalize Paper
          </button>
        </div>
      )}

      {finalized && (
        <>
          <p style={{ color: "green" }}>✅ Paper finalized</p>
          <button onClick={downloadPaperPDF}>⬇️ Download as PDF</button>
        </>
      )}
    </div>
  );
}
