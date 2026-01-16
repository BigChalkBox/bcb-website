// src/app/teacher/papers/[id]/page.js
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Zap, CheckCircle2, XCircle, Search, Scale, FileText, Repeat, PenLine, BarChart3, Info } from "lucide-react";
import styles from "./PaperPage.module.css";

import PaperEditor from "./PaperEditor";
import UploadAndExtract from "./UploadAndExtract";
import CurriculumSelector from "./CurriculumSelector";

export default function PaperPage() {
  const { id } = useParams();
  const router = useRouter();

  const [paper, setPaper] = useState(null);
  const [step, setStep] = useState(0); // Start at step 0 (Curriculum)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [intelligence, setIntelligence] = useState(null);
  const [quickPassCollapsed, setQuickPassCollapsed] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      const res = await fetch(`/api/papers/${id}`);
      if (res.ok) {
        const result = await res.json();
        const paperObj = result.data;
        setPaper(paperObj);

        // Decide step based on paper data
        if (paperObj.status === "final") {
          setStep(4); // Review step
        } else if (
          paperObj.paper_data?.questions &&
          paperObj.paper_data.questions.length > 0
        ) {
          setStep(3); // Build & Edit
        } else if (paperObj.curriculum_id) {
          setStep(2); // Upload & Extract (has curriculum)
        } else {
          setStep(1); // Curriculum step
        }
      }
      setLoading(false);
    };
    fetchPaper();
  }, [id]);

  // Handle curriculum selection
  const handleCurriculumSelect = async (curriculumId) => {
    if (curriculumId === "skip") {
      setStep(2); // Skip to upload
      return;
    }

    if (curriculumId) {
      // Link curriculum to paper
      const res = await fetch(`/api/papers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculum_id: curriculumId }),
      });

      if (res.ok) {
        const result = await res.json();
        setPaper((prev) => ({ ...prev, curriculum_id: curriculumId }));
        setStep(2); // Move to Upload & Extract
      }
    } else {
      // Deselect curriculum
      setPaper((prev) => ({ ...prev, curriculum_id: null }));
    }
  };

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
      alert("Finalized successfully!");
      router.push(`/teacher/papers/${id}/review`);
    } else {
      alert("Error finalizing");
    }
  };

  // Save all questions and navigate to review
  const handleSaveAndReview = async () => {
    if (!confirm("Save and proceed to review?")) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/papers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paper,
          paper_data: paper.paper_data,
        }),
      });

      if (res.ok) {
        router.push(`/teacher/papers/${id}/review`);
      } else {
        alert("Error saving paper");
      }
    } catch (e) {
      console.error(e);
      alert("Save error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loader}>Loading...</div>;
  if (!paper) return <div className={styles.notFound}>Paper not found</div>;

  return (
    <div className={styles.container}>
      {/* Workflow Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.brandName}>
            {"DASES".split("").map((c, i) => <span key={i}>{c}</span>)}
          </div>
          <div className={styles.subBrand}>PAPER STUDIO</div>
        </div>
        <ul className={styles.steps}>
          <li className={step === 1 ? styles.active : step > 1 ? styles.completed : ""}>
            0. Course Curriculum
          </li>
          <li className={step === 2 ? styles.active : step > 2 ? styles.completed : ""}>
            1. Upload & Extract
          </li>
          <li className={step === 3 ? styles.active : step > 3 ? styles.completed : ""}>
            2. Build & Edit Paper
          </li>
          <li className={step === 4 ? styles.active : ""}>
            3. Review & Finalize
          </li>
        </ul>

        {/* QuickPass Status in Sidebar */}
        {intelligence?.quickpass && (
          <div className={styles.quickpassSidebarSection}>
            <button
              className={styles.quickpassToggle}
              onClick={() => setQuickPassCollapsed(!quickPassCollapsed)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} /> QuickPass Status
              </span>
              <span>{quickPassCollapsed ? '▼' : '▲'}</span>
            </button>

            {!quickPassCollapsed && (
              <div className={styles.quickpassContent}>
                <QuickPassSidebarStatus intelligence={intelligence} />
              </div>
            )}
          </div>
        )}
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

        {/* Step 0: Curriculum */}
        {step === 1 && (
          <CurriculumSelector
            paperId={id}
            currentCurriculumId={paper.curriculum_id}
            onSelect={handleCurriculumSelect}
            subjectCode={paper.subject_code}
            subjectName={paper.subject_name}
          />
        )}

        {/* Step 1: Upload & Extract */}
        {step === 2 && (
          <UploadAndExtract
            paperId={id}
            initialPaper={paper}
            onComplete={(updated) => {
              setPaper(updated);
              setStep(3);
            }}
            onIntelligenceUpdate={(intel) => setIntelligence(intel)}
          />
        )}

        {/* Step 2: Build & Edit */}
        {step === 3 && (
          <PaperEditor
            paperId={id}
            initialPaper={paper}
            onSave={(updated) => setPaper(updated)}
          />
        )}

        {/* Step 3: Finalized */}
        {step === 4 && (
          <div className={styles.finalNotice}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={24} style={{ color: '#10b981' }} /> Finalized
            </h3>
            <p>
              Review completed. You can now download, print, or assign submissions.
            </p>
            <button
              className={styles.backBtn}
              onClick={() => router.push(`/teacher/papers/${id}/review`)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={16} /> Go to Review
              </span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// QuickPass Sidebar Status Component - Simplified
function QuickPassSidebarStatus({ intelligence }) {
  const [showHelp, setShowHelp] = useState(false);
  const qp = intelligence.quickpass;

  const totalIssues =
    qp.ambiguity.flags.length +
    qp.or_conflicts.issues.length +
    qp.marks_effort.warnings.length +
    qp.duplicates.pairs.length +
    (qp.evaluation_smoothness?.issues?.length || 0);

  const panelStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '12px',
    padding: '1rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div style={panelStyle}>
      {/* Header with Help Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>
          Status Overview
        </span>
        <button
          onClick={() => setShowHelp(!showHelp)}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            color: 'white',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          title="Learn about metrics"
        >
          <Info size={14} />
        </button>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div style={{
          marginBottom: '12px',
          padding: '12px',
          background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
          borderRadius: '8px',
          fontSize: '0.8rem',
          border: '1px solid #c4b5fd'
        }}>
          <div style={{ fontWeight: 700, color: '#5b21b6', marginBottom: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart3 size={16} /> Metric Explanations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <MetricHelp icon={<Search size={14} />} title="Clarity" desc="Flags vague wording and questions students can interpret multiple ways" />
            <MetricHelp icon={<Scale size={14} />} title="OR Fairness" desc="Checks if OR options have equal difficulty and time requirements" />
            <MetricHelp icon={<FileText size={14} />} title="Marks" desc="Validates if marks allocated match the question complexity" />
            <MetricHelp icon={<Repeat size={14} />} title="Duplicates" desc="Detects questions testing the same concept" />
            <MetricHelp icon={<PenLine size={14} />} title="Marking" desc="Identifies questions hard to mark consistently" />
          </div>
          <button
            onClick={() => setShowHelp(false)}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '6px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Got it!
          </button>
        </div>
      )}

      {/* Total Issues Count */}
      <div style={{
        textAlign: 'center',
        padding: '12px',
        background: totalIssues > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        borderRadius: '8px',
        marginBottom: '12px'
      }}>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: totalIssues > 0 ? '#dc2626' : '#10b981' }}>
          {totalIssues}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
          {totalIssues === 0 ? 'No Issues Found' : (totalIssues === 1 ? 'Issue Found' : 'Issues Found')}
        </div>
      </div>

      {/* Issue Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
        <IssueRow label="Clarity" count={qp.ambiguity.flags.length} />
        <IssueRow label="OR Fairness" count={qp.or_conflicts.issues.length} />
        <IssueRow label="Marks" count={qp.marks_effort.warnings.length} />
        <IssueRow label="Duplicates" count={qp.duplicates.pairs.length} />
        <IssueRow label="Marking" count={qp.evaluation_smoothness?.issues?.length || 0} />
      </div>
    </div>
  );
}

function MetricHelp({ icon, title, desc }) {
  return (
    <div style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
      <span style={{ fontWeight: 600, color: '#5b21b6', display: 'flex', alignItems: 'center', gap: '4px' }}>{icon} {title}:</span>
      <span style={{ color: '#6b7280', marginLeft: '4px' }}>{desc}</span>
    </div>
  );
}

function IssueRow({ label, count }) {
  const issueText = count === 0 ? 'No issues' : (count === 1 ? '1 issue' : `${count} issues`);
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 12px',
      background: count > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
      borderRadius: '6px',
      borderLeft: `3px solid ${count > 0 ? '#ef4444' : '#10b981'}`
    }}>
      <span style={{ fontWeight: 500, color: '#374151' }}>{label}</span>
      <span style={{
        fontWeight: 600,
        color: count > 0 ? '#dc2626' : '#10b981',
        fontSize: '0.85rem'
      }}>
        {issueText}
      </span>
    </div>
  );
}


function calculateHealth(qp) {
  let score = 100;
  // Simple deduction per issue type (no severity weighting)
  score -= (qp.ambiguity.flags.length * 8);
  score -= (qp.or_conflicts.issues.length * 12);
  score -= (qp.marks_effort.warnings.length * 6);
  score -= (qp.duplicates.pairs.length * 10);
  score -= ((qp.evaluation_smoothness?.issues?.length || 0) * 8);

  return Math.max(0, Math.min(100, score));
}
