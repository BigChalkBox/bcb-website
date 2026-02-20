// src/app/teacher/papers/[id]/page.js
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Zap, CheckCircle2, XCircle, Search, Scale, FileText, Repeat, PenLine, BarChart3, Info, BookOpen, X, ArrowLeft, Brain, Clock, Target, ClipboardList, AlertTriangle, AlertOctagon, TrendingUp, Lightbulb, ArrowRight, Check } from "lucide-react";
import styles from "./PaperPage.module.css";

import PaperEditor from "./PaperEditor";
import UploadAndExtract from "./UploadAndExtract";
import CurriculumSelector from "./CurriculumSelector";
import CoverageWidget from "./CoverageWidget";

export default function PaperPage() {
  const { id } = useParams();
  const router = useRouter();

  const [paper, setPaper] = useState(null);
  const [step, setStep] = useState(0); // Start at step 0 (Curriculum)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [intelligence, setIntelligence] = useState(null);
  const [quickPassCollapsed, setQuickPassCollapsed] = useState(false);
  const [showCoverageDrawer, setShowCoverageDrawer] = useState(false);
  const [localQuestions, setLocalQuestions] = useState([]); // Track unsaved questions from UploadAndExtract
  const [analysisDetailView, setAnalysisDetailView] = useState(null); // 'blooms', 'time', 'difficulty', or null

  useEffect(() => {
    const fetchPaper = async () => {
      const res = await fetch(`/api/papers/${id}`);
      if (res.ok) {
        const result = await res.json();
        const paperObj = result.data;
        setPaper(paperObj);

        // Decide step based on paper data
        if (paperObj.status === "final" || paperObj.status === "questions_set") {
          setStep(3); // Complete - redirect to dashboard or studio
        } else if (paperObj.curriculum_id) {
          setStep(2); // Upload & Extract (has curriculum)
          // Initialize localQuestions from saved paper data if exists
          if (paperObj.paper_data?.questions?.length > 0) {
            setLocalQuestions(paperObj.paper_data.questions);
          }
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
      // Link curriculum to paper and clear old coverage analysis
      const res = await fetch(`/api/papers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curriculum_id: curriculumId,
          coverage_analysis: null // Clear old analysis when changing curriculum
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setPaper((prev) => ({ ...prev, curriculum_id: curriculumId, coverage_analysis: null }));
        setStep(2); // Move to Upload & Extract
      }
    } else {
      // Deselect curriculum - also update in database
      const res = await fetch(`/api/papers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curriculum_id: null,
          coverage_analysis: null
        }),
      });

      if (res.ok) {
        setPaper((prev) => ({ ...prev, curriculum_id: null, coverage_analysis: null }));
      }
    }
  };

  // Finalize questions - saves paper as "questions_set" and returns to dashboard
  const handleFinalizeQuestions = async () => {
    // Use localQuestions if available, otherwise fallback to saved paper data
    const questionsToSave = localQuestions.length > 0 ? localQuestions : (paper.paper_data?.questions || []);

    if (questionsToSave.length === 0) {
      alert("No questions to save. Please extract questions first.");
      return;
    }

    if (!confirm("Finalize questions and return to dashboard? You can add sample answers and rubrics later.")) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/papers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paper_data: {
            ...paper.paper_data,
            questions: questionsToSave,
          },
          status: "questions_set",
        }),
      });

      if (res.ok) {
        router.push("/teacher/dashboard");
      } else {
        alert("Error saving paper");
      }
    } catch (e) {
      console.error(e);
      alert("Error finalizing");
    } finally {
      setSaving(false);
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
          <li
            className={`${step === 1 ? styles.active : step > 1 ? styles.completed : ""} ${step >= 1 ? styles.clickable : ""}`}
            onClick={() => step >= 1 && setStep(1)}
          >
            0. Course Curriculum
          </li>
          <li
            className={`${step === 2 ? styles.active : step > 2 ? styles.completed : ""} ${step >= 2 ? styles.clickable : ""}`}
            onClick={() => step >= 2 && setStep(2)}
          >
            1. Upload & Extract
          </li>
          <li className={step === 3 ? styles.active : ""}>
            2. Save & Continue
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

        {/* Analysis Insights Section - NEW */}
        {intelligence?.quickpass && (intelligence?.quickpass.blooms || intelligence?.quickpass.time || intelligence?.quickpass.difficulty) && (
          <div className={styles.quickpassSidebarSection} style={{ marginTop: '12px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600, marginBottom: '12px' }}>
                Analysis Insights
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Bloom's Taxonomy */}
                {intelligence.quickpass.blooms && (
                  <AnalysisInsightCard
                    icon={<Brain size={16} />}
                    title="Bloom's Taxonomy"
                    hasIssues={intelligence.quickpass.blooms.warnings?.length > 0}
                    onClick={() => setAnalysisDetailView('blooms')}
                  />
                )}

                {/* Time Feasibility */}
                {intelligence.quickpass.time && (
                  <AnalysisInsightCard
                    icon={<Clock size={16} />}
                    title="Time Feasibility"
                    hasIssues={!intelligence.quickpass.time.safe}
                    onClick={() => setAnalysisDetailView('time')}
                  />
                )}

                {/* Difficulty Distribution */}
                {intelligence.quickpass.difficulty && (
                  <AnalysisInsightCard
                    icon={<BarChart3 size={16} />}
                    title="Difficulty Distribution"
                    hasIssues={intelligence.quickpass.difficulty.warnings?.length > 0}
                    onClick={() => setAnalysisDetailView('difficulty')}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analyze Coverage Button */}
        {paper.curriculum_id && step >= 2 && (
          <div className={styles.coverageButtonSection}>
            <button
              className={styles.coverageButton}
              onClick={() => setShowCoverageDrawer(true)}
            >
              <BookOpen size={16} /> Analyze Coverage
            </button>
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
          <div>
            <UploadAndExtract
              paperId={id}
              initialPaper={paper}
              onComplete={(updated) => {
                setPaper(updated);
                // Stay on step 2 so user can see Finalize button
              }}
              onIntelligenceUpdate={(intel) => setIntelligence(intel)}
              onQuestionsChange={(qs) => setLocalQuestions(qs)}
            />

            {/* Show Finalize Button ONLY when questions are extracted in current session */}
            {localQuestions.length > 0 && (
              <div className={styles.finalizeActions}>
                <button
                  className={styles.finalizeQuestionsBtn}
                  onClick={handleFinalizeQuestions}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "✓ Save Questions & Go to Dashboard"}
                </button>
                <p className={styles.finalizeHint}>
                  You can add sample answers, rubrics and do more editing from Paper Studio.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Saved - Redirect options */}
        {step === 3 && (
          <div className={styles.finalNotice}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={24} style={{ color: '#10b981' }} /> Questions Saved!
            </h3>
            <p>
              Your questions have been saved. You can now edit, add sample answers, or finalize the paper.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className={styles.backBtn}
                onClick={() => router.push(`/teacher/papers/${id}/studio`)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PenLine size={16} /> Open Paper Studio
                </span>
              </button>
              <button
                className={styles.backBtn}
                style={{ background: '#6b7280' }}
                onClick={() => router.push('/teacher/dashboard')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowLeft size={16} /> Back to Dashboard
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Coverage Drawer */}
      {
        showCoverageDrawer && (
          <div className={styles.drawerOverlay} onClick={() => setShowCoverageDrawer(false)}>
            <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
              <div className={styles.drawerHeader}>
                <h3><BookOpen size={20} /> Syllabus Coverage Analysis</h3>
                <button
                  className={styles.drawerClose}
                  onClick={() => setShowCoverageDrawer(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className={styles.drawerBody}>
                <CoverageWidget
                  paperId={id}
                  curriculumId={paper.curriculum_id}
                  questions={localQuestions.length > 0 ? localQuestions : (paper.paper_data?.questions || [])}
                />
              </div>
            </div>
          </div>
        )
      }

      {/* Analysis Detail Drawer - NEW */}
      {
        analysisDetailView && intelligence?.quickpass && (
          <div className={styles.drawerOverlay} onClick={() => setAnalysisDetailView(null)}>
            <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
              <div className={styles.drawerHeader}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {analysisDetailView === 'blooms' && <><Brain size={20} /> Bloom&apos;s Taxonomy Analysis</>}
                  {analysisDetailView === 'time' && <><Clock size={20} /> Time Feasibility Analysis</>}
                  {analysisDetailView === 'difficulty' && <><BarChart3 size={20} /> Difficulty Distribution Analysis</>}
                </h3>
                <button
                  className={styles.drawerClose}
                  onClick={() => setAnalysisDetailView(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className={styles.drawerBody}>
                <AnalysisDetailContent
                  type={analysisDetailView}
                  data={intelligence.quickpass[analysisDetailView]}
                  questions={localQuestions.length > 0 ? localQuestions : (paper.paper_data?.questions || [])}
                />
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

// QuickPass Sidebar Status Component - Simplified
function QuickPassSidebarStatus({ intelligence }) {
  const [showHelp, setShowHelp] = useState(false);
  const qp = intelligence.quickpass;
  const checksRun = qp.checks_run || [];

  // Calculate total issues only for checks with numeric issue counts (exclude analytical summaries)
  const totalIssues =
    (qp.spelling?.errors?.length || 0) +
    (qp.clarity?.issues?.length || 0) +
    (qp.ambiguity?.flags?.length || 0) +
    (qp.marks_effort?.warnings?.length || 0) +
    (qp.or_conflicts?.issues?.length || 0) +
    (qp.duplicates?.pairs?.length || 0) +
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
            <MetricHelp icon={<Search size={14} />} title="Typos" desc="Spelling and grammar errors" />
            <MetricHelp icon={<Search size={14} />} title="Readability" desc="Language clarity and flow" />
            <MetricHelp icon={<Search size={14} />} title="Unclear" desc="Ambiguous phrasing" />
            <MetricHelp icon={<FileText size={14} />} title="Marks" desc="Effort vs marks allocation" />
            <MetricHelp icon={<Scale size={14} />} title="OR Balance" desc="Difficulty fairness in OR options" />
            <MetricHelp icon={<Repeat size={14} />} title="Duplicates" desc="Similar questions" />
            <MetricHelp icon={<PenLine size={14} />} title="Grading" desc="Evaluation ease" />
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

      {/* Issue Breakdown - Only checks with numeric issue counts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
        <IssueRow label="Typos" count={qp.spelling?.errors?.length} analyzed={checksRun.includes('typos')} />
        <IssueRow label="Readability" count={qp.clarity?.issues?.length} analyzed={checksRun.includes('readability')} />
        <IssueRow label="Unclear" count={qp.ambiguity?.flags?.length} analyzed={checksRun.includes('unclear')} />
        <IssueRow label="Marks" count={qp.marks_effort?.warnings?.length} analyzed={checksRun.includes('marks')} />
        <IssueRow label="OR Balance" count={qp.or_conflicts?.issues?.length} analyzed={checksRun.includes('or_balance')} />
        <IssueRow label="Duplicates" count={qp.duplicates?.pairs?.length} analyzed={checksRun.includes('duplicates')} />
        <IssueRow label="Grading" count={qp.evaluation_smoothness?.issues?.length} analyzed={checksRun.includes('grading')} />
      </div>
    </div>
  );
}


// Analysis Detail Content Component
function AnalysisDetailContent({ type, data, questions = [] }) {
  if (!data) return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No data available</div>;

  // Helper for consistent card styling
  const Card = ({ children, style }) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      padding: '20px',
      marginBottom: '20px',
      ...style
    }}>
      {children}
    </div>
  );

  const SectionTitle = ({ icon, title }) => (
    <h4 style={{
      margin: '0 0 16px 0',
      color: '#111827',
      fontSize: '1rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {icon} {title}
    </h4>
  );

  // BLOOM'S TAXONOMY DETAILS
  if (type === 'blooms') {
    const levels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
    const levelColors = ['#94a3b8', '#60a5fa', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e']; // Custom palette

    return (
      <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100%' }}>


        {/* Distribution Chart */}
        <Card>
          <SectionTitle icon={<Target size={20} />} title="Cognitive Distribution" />
          <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
            {levels.map((level, idx) => {
              const levelNum = idx + 1;
              const pct = data.percentageByLevel?.[levelNum] || 0;
              if (pct === 0) return null;
              return (
                <div key={level} style={{
                  width: `${pct}%`,
                  background: levelColors[idx],
                  position: 'relative',
                  transition: 'width 0.5s ease'
                }} title={`${level}: ${pct}%`} />
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {levels.map((level, idx) => {
              const levelNum = idx + 1;
              const pct = Math.round(data.percentageByLevel?.[levelNum] || 0);
              const count = data.distribution?.[levelNum] || 0;

              return (
                <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: levelColors[idx] }} />
                  <div style={{ flex: 1, fontWeight: 500, color: '#374151' }}>{level}</div>
                  <div style={{ color: '#6b7280' }}>{pct}% <span style={{ opacity: 0.5 }}>({count})</span></div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Question Classification Table */}
        <Card>
          <SectionTitle icon={<ClipboardList size={20} />} title="Question Breakdown" />
          {data.questionsClassified && data.questionsClassified.length > 0 ? (
            <div style={{ maxHeight: '400px', overflowY: 'auto', margin: '0 -20px' }}>
              <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
                  <tr>
                    <th style={{ padding: '12px 20px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Q</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Marks</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Level</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {data.questionsClassified.map((item, idx) => {
                    const level = item.bloomsLevel || 2;
                    const color = levelColors[level - 1];

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 20px', fontWeight: 600, color: '#374151' }}>Q{idx + 1}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>{item.marks || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            background: `${color}15`,
                            color: color,
                            border: `1px solid ${color}40`,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                          }}>
                            {levels[level - 1]}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', color: '#4b5563', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                          {item.bloomsReasoning || item.reasoning || item.analysis || 'No detailed analysis available for this question.'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
              No detailed classification available.
            </div>
          )}
        </Card>

        {/* Recommendations & Warnings */}
        {(data.warnings?.length > 0 || true) && (
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Dynamic Recommendations */}
            {data.avgCognitiveLevel < 2.5 && (
              <div style={{ padding: '16px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', display: 'flex', gap: '12px' }}>
                <div><Lightbulb size={24} color="#d97706" /></div>
                <div>
                  <div style={{ fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>Boost Complexity</div>
                  <div style={{ fontSize: '0.875rem', color: '#b45309' }}>Add more Apply/Analyze questions to reach balanced difficulty.</div>
                </div>
              </div>
            )}

            {/* Warnings */}
            {data.warnings?.map((w, i) => (
              <div key={i} style={{
                padding: '16px',
                background: w.severity === 'high' ? '#fef2f2' : '#eff6ff',
                border: `1px solid ${w.severity === 'high' ? '#fecaca' : '#bfdbfe'}`,
                borderRadius: '12px',
                display: 'flex',
                gap: '12px'
              }}>
                <div>{w.severity === 'high' ? <AlertOctagon size={24} color="#dc2626" /> : <Info size={24} color="#2563eb" />}</div>
                <div>
                  <div style={{ fontWeight: 600, color: w.severity === 'high' ? '#991b1b' : '#1e40af', marginBottom: '4px' }}>
                    {w.type?.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: w.severity === 'high' ? '#b91c1c' : '#1d4ed8' }}>{w.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // TIME FEASIBILITY DETAILS
  if (type === 'time') {
    const percentageUsed = Math.min((data.totalEstimatedTime / data.examDuration) * 100, 100);
    const isTight = !data.safe;

    return (
      <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100%' }}>
        {/* Main Time Status */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            Estimated Completion Time
          </div>
          <div style={{ fontSize: '3.5rem', fontWeight: 800, color: isTight ? '#ea580c' : '#16a34a', lineHeight: 1, marginBottom: '8px' }}>
            {data.totalEstimatedTime}<span style={{ fontSize: '1.5rem', fontWeight: 500, color: '#9ca3af' }}>m</span>
          </div>
          <div style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '24px' }}>
            vs {data.examDuration}m exam duration
          </div>

          {/* Progress Bar */}
          <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', maxWidth: '400px', margin: '0 auto 12px' }}>
            <div style={{
              width: `${percentageUsed}%`,
              height: '100%',
              background: isTight ? '#f97316' : '#22c55e',
              transition: 'width 1s ease',
              borderRadius: '6px'
            }} />
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: isTight ? '#c2410c' : '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {data.safe ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {data.safe ? 'Comfortable Buffer' : 'Very Tight Schedule'}
          </div>
        </div>

        {/* Question Time Table */}
        <Card>
          <SectionTitle icon={<Clock size={20} />} title="Time Breakdown per Question" />
          <div style={{ maxHeight: '400px', overflowY: 'auto', margin: '0 -20px' }}>
            <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Q</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Marks</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Est. Time</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Pacing</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const rows = [];
                  const estimates = data.timeEstimates || [];
                  let effectiveTotal = 0;
                  let i = 0;

                  while (i < estimates.length) {
                    const est = estimates[i];
                    const q = questions[i];
                    const isOrStart = q?.isOr && i + 1 < estimates.length;

                    if (isOrStart) {
                      const estB = estimates[i + 1];
                      const avgTime = Math.round(((est.total_time || 0) + (estB.total_time || 0)) / 2);
                      const avgMarks = ((est.marks || 0) + (estB.marks || 0)) / 2;
                      const avgMinPerMark = avgMarks > 0 ? avgTime / avgMarks : 0;
                      effectiveTotal += avgTime;

                      // OR pair header row
                      rows.push(
                        <tr key={`or-header-${i}`} style={{ background: '#f5f3ff', borderBottom: 'none' }}>
                          <td colSpan={4} style={{ padding: '8px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>OR PAIR</span>
                            Student answers one — avg time counted
                          </td>
                        </tr>
                      );

                      // Option A
                      const minPerMarkA = est.marks > 0 ? est.total_time / est.marks : 0;
                      const isSlowA = minPerMarkA > 2.5;
                      rows.push(
                        <tr key={`or-a-${i}`} style={{ borderBottom: '1px dashed #e9e5f5', background: '#faf8ff' }}>
                          <td style={{ padding: '8px 20px 8px 32px', fontWeight: 600, color: '#6b7280', fontSize: '0.8rem' }}>{est.qid} <span style={{ color: '#a78bfa', fontSize: '0.7rem' }}>Option A</span></td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', color: '#9ca3af' }}>{est.marks}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', color: '#9ca3af' }}>{est.total_time}m</td>
                          <td style={{ padding: '8px 20px', textAlign: 'center' }}>
                            <span style={{ background: isSlowA ? '#fff7ed' : '#f0fdf4', color: isSlowA ? '#c2410c' : '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              {minPerMarkA.toFixed(1)} m/mk
                            </span>
                          </td>
                        </tr>
                      );

                      // Option B
                      const minPerMarkB = estB.marks > 0 ? estB.total_time / estB.marks : 0;
                      const isSlowB = minPerMarkB > 2.5;
                      rows.push(
                        <tr key={`or-b-${i}`} style={{ borderBottom: '1px dashed #e9e5f5', background: '#faf8ff' }}>
                          <td style={{ padding: '8px 20px 8px 32px', fontWeight: 600, color: '#6b7280', fontSize: '0.8rem' }}>{estB.qid} <span style={{ color: '#a78bfa', fontSize: '0.7rem' }}>Option B</span></td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', color: '#9ca3af' }}>{estB.marks}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', color: '#9ca3af' }}>{estB.total_time}m</td>
                          <td style={{ padding: '8px 20px', textAlign: 'center' }}>
                            <span style={{ background: isSlowB ? '#fff7ed' : '#f0fdf4', color: isSlowB ? '#c2410c' : '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              {minPerMarkB.toFixed(1)} m/mk
                            </span>
                          </td>
                        </tr>
                      );

                      // Average row
                      const isSlowAvg = avgMinPerMark > 2.5;
                      rows.push(
                        <tr key={`or-avg-${i}`} style={{ borderBottom: '2px solid #ede9fe', background: '#f5f3ff' }}>
                          <td style={{ padding: '8px 20px 8px 32px', fontWeight: 700, color: '#7c3aed', fontSize: '0.8rem' }}>→ Avg (counted)</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#7c3aed' }}>{avgMarks % 1 === 0 ? avgMarks : avgMarks.toFixed(1)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#7c3aed' }}>{avgTime}m</td>
                          <td style={{ padding: '8px 20px', textAlign: 'center' }}>
                            <span style={{ background: isSlowAvg ? '#fff7ed' : '#ede9fe', color: isSlowAvg ? '#c2410c' : '#7c3aed', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                              {avgMinPerMark.toFixed(1)} m/mk
                            </span>
                          </td>
                        </tr>
                      );

                      i += 2;
                    } else {
                      // Regular question
                      const minPerMark = est.marks > 0 ? est.total_time / est.marks : 0;
                      const isSlow = minPerMark > 2.5;
                      effectiveTotal += est.total_time || 0;

                      rows.push(
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 20px', fontWeight: 600, color: '#374151' }}>{est.qid}</td>
                          <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>{est.marks}</td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#1e293b' }}>{est.total_time}m</td>
                          <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                            <span style={{ background: isSlow ? '#fff7ed' : '#f0fdf4', color: isSlow ? '#c2410c' : '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              {minPerMark.toFixed(1)} m/mk
                            </span>
                          </td>
                        </tr>
                      );
                      i++;
                    }
                  }

                  // Total row
                  rows.push(
                    <tr key="total" style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 700, color: '#111827' }}>Total</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}></td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{effectiveTotal}m</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>of {data.examDuration}m</td>
                    </tr>
                  );

                  return rows;
                })()}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // DIFFICULTY DISTRIBUTION DETAILS
  if (type === 'difficulty') {
    const { easy, medium, hard } = data.percentageByDifficulty || { easy: 0, medium: 0, hard: 0 };

    return (
      <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100%' }}>
        {/* Distribution Visual */}
        <Card style={{ textAlign: 'center' }}>
          <SectionTitle icon={<BarChart3 size={20} />} title="Difficulty Mix" />
          <div style={{ display: 'flex', height: '40px', borderRadius: '20px', overflow: 'hidden', margin: '20px 0', border: '4px solid white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ width: `${easy}%`, background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>
              {easy > 10 && `${Math.round(easy)}%`}
            </div>
            <div style={{ width: `${medium}%`, background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>
              {medium > 10 && `${Math.round(medium)}%`}
            </div>
            <div style={{ width: `${hard}%`, background: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>
              {hard > 10 && `${Math.round(hard)}%`}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>Easy ({data.distribution?.easy || 0})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>Medium ({data.distribution?.medium || 0})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f87171' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>Hard ({data.distribution?.hard || 0})</span>
            </div>
          </div>
        </Card>

        {/* Progression Timeline */}
        {data.progression_check && (
          <Card>
            <SectionTitle icon={<TrendingUp size={20} />} title="Flow & Progression" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Paper Start', status: data.progression_check.starts_easy ? 'Good' : 'Warning', text: data.progression_check.starts_easy ? 'Starts with approachable questions' : 'Starts with difficult questions' },
                { label: 'Difficulty Curve', status: data.progression_check.gradual_increase ? 'Good' : 'Warning', text: data.progression_check.gradual_increase ? 'Gradual increase in challenge' : 'Sudden spikes in difficulty' },
                { label: 'Question Spacing', status: !data.progression_check.hard_clustering ? 'Good' : 'Warning', text: !data.progression_check.hard_clustering ? 'Exams pace is well distributed' : 'Hard questions are clustered' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: item.status === 'Good' ? '#dcfce7' : '#fef3c7',
                    color: item.status === 'Good' ? '#16a34a' : '#d97706',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.875rem'
                  }}>
                    {item.status === 'Good' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{item.label}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Detailed List */}
        <Card>
          <SectionTitle icon={<ClipboardList size={20} />} title="Question Classification" />
          <div style={{ maxHeight: '300px', overflowY: 'auto', margin: '0 -20px' }}>
            <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Q</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {(data.classification || []).map((item, idx) => {
                  const diffColor = item.difficulty === 'easy' ? '#34d399' : item.difficulty === 'medium' ? '#fbbf24' : '#f87171';
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 600, color: '#374151' }}>{item.qid}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          color: diffColor,
                          background: `${diffColor}15`,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase'
                        }}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', color: '#6b7280', fontSize: '0.8125rem' }}>{item.reasoning}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}


// Analysis Insight Card Component
function AnalysisInsightCard({ icon, title, hasIssues, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 12px',
        background: hasIssues ? 'rgba(251, 191, 36, 0.08)' : 'rgba(16, 185, 129, 0.08)',
        borderRadius: '8px',
        borderLeft: `3px solid ${hasIssues ? '#f59e0b' : '#10b981'}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {icon} {title}
        </span>
        <ArrowRight size={14} style={{ opacity: 0.4, color: '#6b7280' }} />
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

function IssueRow({ label, count, analyzed }) {
  // Determine display text and styling based on analysis state
  let issueText, bgColor, borderColor, textColor;

  if (!analyzed) {
    issueText = 'Not analyzed';
    bgColor = 'rgba(156, 163, 175, 0.1)';
    borderColor = '#9ca3af';
    textColor = '#9ca3af';
  } else if (count === 0 || count === undefined) {
    issueText = 'No issues';
    bgColor = 'rgba(16, 185, 129, 0.08)';
    borderColor = '#10b981';
    textColor = '#10b981';
  } else {
    issueText = count === 1 ? '1 issue' : `${count} issues`;
    bgColor = 'rgba(239, 68, 68, 0.08)';
    borderColor = '#ef4444';
    textColor = '#dc2626';
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 12px',
      background: bgColor,
      borderRadius: '6px',
      borderLeft: `3px solid ${borderColor}`
    }}>
      <span style={{ fontWeight: 500, color: '#374151' }}>{label}</span>
      <span style={{
        fontWeight: 600,
        color: textColor,
        fontSize: '0.85rem',
        fontStyle: !analyzed ? 'italic' : 'normal'
      }}>
        {issueText}
      </span>
    </div>
  );
}


function calculateHealth(qp) {
  let score = 100;
  // Simple deduction per issue type (no severity weighting)
  score -= ((qp.ambiguity?.flags?.length || 0) * 8);
  score -= ((qp.or_conflicts?.issues?.length || 0) * 12);
  score -= ((qp.marks_effort?.warnings?.length || 0) * 6);
  score -= ((qp.duplicates?.pairs?.length || 0) * 10);
  score -= ((qp.evaluation_smoothness?.issues?.length || 0) * 8);

  return Math.max(0, Math.min(100, score));
}
