// src/app/teacher/papers/[id]/page.js
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./PaperPage.module.css";

import PaperEditor from "./PaperEditor";
import UploadAndExtract from "./UploadAndExtract";

export default function PaperPage() {
  const { id } = useParams();
  const router = useRouter();

  const [paper, setPaper] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaper = async () => {
      const res = await fetch(`/api/papers/${id}`);
      if (res.ok) {
        const result = await res.json();
        const paperObj = result.data;
        setPaper(paperObj);

        // Decide step based on paper data
        if (paperObj.status === "final") {
          setStep(3); // Review step
        } else {
          setStep(
            paperObj.paper_data?.questions &&
            paperObj.paper_data.questions.length > 0
              ? 2
              : 1
          );
        }
      }
      setLoading(false);
    };
    fetchPaper();
  }, [id]);

  const handleFinalize = async () => {
    if (!confirm("Finalize this paper?")) return;

    const res = await fetch(`/api/papers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paper_data: {
          ...paper.paper_data,
          questions: paper.paper_data?.questions || [],
        },
        status: "final",
      }),
    });

    if (res.ok) {
      alert("✅ Finalized successfully!");
      router.push(`/teacher/papers/${id}/review`); // 🔥 Go to Review
    } else {
      alert("❌ Error finalizing");
    }
  };

  if (loading) return <div className={styles.loader}>Loading...</div>;
  if (!paper) return <div className={styles.notFound}>Paper not found</div>;

  return (
    <div className={styles.container}>
      {/* Workflow Sidebar */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>Paper Workflow</h2>
        <ul className={styles.steps}>
          <li className={step === 1 ? styles.active : ""}>1. Upload & Extract</li>
          <li className={step === 2 ? styles.active : ""}>2. Build & Edit Paper</li>
          <li className={step === 3 ? styles.active : ""}>3. Review & Finalize</li>
        </ul>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1>
            {paper.subject_name} — {paper.subject_code} ({paper.year})
          </h1>
          <h3>
            Faculty: {paper.faculty_name} | Program: {paper.program} | Sem: {paper.semester}
          </h3>
        </header>

        {step === 1 && (
          <UploadAndExtract
            paperId={id}
            initialPaper={paper}
            onComplete={(updated) => {
              setPaper(updated);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <PaperEditor
            paperId={id}
            initialPaper={paper}
            onSave={(updated) => setPaper(updated)}
          />
        )}

        {step === 2 && (
          <div className={styles.finalActions}>
            
          </div>
        )}

        {step === 3 && (
          <div className={styles.finalNotice}>
            <h3>✅ Finalized</h3>
            <p>
              Review completed. You can now download, print, or assign submissions.
            </p>
            <button
              className={styles.backBtn}
              onClick={() => router.push(`/teacher/papers/${id}/review`)}
            >
              🔍 Go to Review
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
