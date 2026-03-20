// src/app/paper/[id]/PaperEditor.js
"use client";
import { useState } from "react";
import QuestionEditor from "./QuestionEditor";

export default function PaperEditor({ paperId, initialPaper }) {
  const [paper, setPaper] = useState(initialPaper);

  async function refresh() {
    const res = await fetch(`/api/papers/${paperId}`);
    const json = await res.json();
    if (json.success) setPaper(json.data);
  }

  if (!paper) return <div>Loading…</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>
        {paper.subject_name}: {paper.subject_code} ({paper.year})
      </h1>
      <h3>Faculty: {paper.faculty_name}</h3>

      <div style={{ marginTop: 20 }}>
        <QuestionEditor
          paperId={paperId}
          // ✅ pull from paper.paper_data.questions
          initialQuestions={paper.paper_data?.questions || []}
          onSaved={refresh}
        />
      </div>
    </div>
  );
}
