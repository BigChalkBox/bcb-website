// src/app/teacher/papers/[id]/quickpass/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FileText, AlertTriangle, CheckCircle2, XCircle, Zap, Lightbulb } from "lucide-react";
import styles from "./QuickPassPage.module.css";

export default function QuickPassPage() {
    const { id } = useParams();
    const router = useRouter();

    const [paper, setPaper] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [intelligence, setIntelligence] = useState(null);
    const [loading, setLoading] = useState(true);
    const [locking, setLocking] = useState(false);

    // Fetch paper data
    useEffect(() => {
        fetchPaper();
    }, [id]);

    async function fetchPaper() {
        try {
            const res = await fetch(`/api/papers/${id}`);
            const json = await res.json();
            if (json.success) {
                setPaper(json.data);
                setIntelligence(json.data.intelligence);
                setLoading(false);
            }
        } catch (err) {
            console.error("Failed to load paper:", err);
            setLoading(false);
        }
    }

    async function runAnalysis() {
        setAnalyzing(true);
        try {
            const res = await fetch(`/api/papers/${id}/quickpass/analyze`, {
                method: "POST",
            });
            const json = await res.json();

            if (json.success) {
                setIntelligence(json.intelligence);
                alert("Analysis complete!");
                fetchPaper(); // Refresh to get updated data
            } else {
                alert("Analysis failed: " + json.error);
            }
        } catch (err) {
            console.error("Analysis error:", err);
            alert("Error running analysis");
        } finally {
            setAnalyzing(false);
        }
    }

    async function approvePaper() {
        if (!confirm("Lock this paper and approve it for evaluation?")) return;

        setLocking(true);
        try {
            const res = await fetch(`/api/papers/${id}/lock`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ approved_by: "teacher_id" }), // TODO: Use actual teacher ID
            });

            const json = await res.json();
            if (json.success) {
                alert("Paper locked and approved!");
                router.push(`/teacher/papers/${id}/review`);
            } else {
                alert("Failed to lock paper: " + json.error);
            }
        } catch (err) {
            console.error("Lock error:", err);
            alert("Error locking paper");
        } finally {
            setLocking(false);
        }
    }

    if (loading) {
        return <div className={styles.container}>Loading...</div>;
    }

    if (!paper) {
        return <div className={styles.container}>Paper not found</div>;
    }

    const questions = paper.paper_data?.questions || [];
    const qp = intelligence?.quickpass;

    // Count stats
    const totalWarnings = qp
        ? qp.ambiguity.flags.length +
        qp.or_conflicts.issues.length +
        qp.marks_effort.warnings.length +
        qp.duplicates.pairs.length
        : 0;

    const criticalIssues = qp
        ? qp.ambiguity.flags.filter((f) => f.severity === "high").length +
        qp.or_conflicts.issues.length
        : 0;

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={28} /> QuickPass Analysis
                </h1>
                <p className={styles.paperInfo}>
                    {paper.subject_name} ({paper.subject_code}) - {paper.year}
                </p>
                <p className={styles.questionCount}>
                    {questions.length} questions to analyze
                </p>
            </header>

            {/* Status Banner */}
            {!qp && (
                <div className={styles.banner}>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={20} /> Run QuickPass to check this paper for safety before evaluation
                    </p>
                </div>
            )}

            {qp && (
                <div
                    className={`${styles.banner} ${qp.overall_safe ? styles.safe : styles.warning}`}
                >
                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {qp.overall_safe ? (
                            <><CheckCircle2 size={20} style={{ color: '#10b981' }} /> Paper appears safe for evaluation</>
                        ) : (
                            <><AlertTriangle size={20} style={{ color: '#f59e0b' }} /> Critical issues found - review before approving</>
                        )}
                    </p>
                    <small>Analyzed: {new Date(qp.analyzed_at).toLocaleString()}</small>
                </div>
            )}

            {/* Safety Checks Summary */}
            {qp && (
                <div className={styles.checksCard}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={22} /> Safety Checks
                    </h2>
                    <div className={styles.checksList}>
                        <CheckItem
                            icon={qp.ambiguity.safe ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                            label="Ambiguity Check"
                            count={qp.ambiguity.flags.length}
                            status={qp.ambiguity.safe}
                        />
                        <CheckItem
                            icon={qp.or_conflicts.safe ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                            label="OR Questions Validated"
                            count={qp.or_conflicts.issues.length}
                            status={qp.or_conflicts.safe}
                        />
                        <CheckItem
                            icon={qp.marks_effort.safe ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                            label="Marks vs Effort"
                            count={qp.marks_effort.warnings.length}
                            status={qp.marks_effort.safe}
                        />
                        <CheckItem
                            icon={qp.duplicates.safe ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                            label="Duplicate Detection"
                            count={qp.duplicates.pairs.length}
                            status={qp.duplicates.safe}
                        />
                    </div>
                </div>
            )}

            {/* Warnings Detail */}
            {qp && totalWarnings > 0 && (
                <div className={styles.warningsCard}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={22} /> Attention Required ({totalWarnings}
                        {criticalIssues > 0 && `, ${criticalIssues} critical`})
                    </h2>

                    {/* Ambiguity warnings */}
                    {qp.ambiguity.flags.map((flag, i) => (
                        <WarningItem
                            key={`amb-${i}`}
                            severity={flag.severity}
                            title={`Ambiguity in question`}
                            issue={flag.issue}
                            suggestion={flag.suggestion}
                            qid={flag.qid}
                        />
                    ))}

                    {/* OR conflicts */}
                    {qp.or_conflicts.issues.map((issue, i) => (
                        <WarningItem
                            key={`or-${i}`}
                            severity="high"
                            title={`OR Question Imbalance`}
                            issue={issue.issue}
                            suggestion={issue.recommendation}
                            qid={issue.pair.join(" vs ")}
                        />
                    ))}

                    {/* Marks-effort warnings */}
                    {qp.marks_effort.warnings.map((warn, i) => (
                        <WarningItem
                            key={`effort-${i}`}
                            severity="medium"
                            title={`Marks Allocation Issue`}
                            issue={warn.reason}
                            suggestion={`Consider adjusting from ${warn.allocated_marks} to ${warn.recommended_marks} marks`}
                            qid={warn.qid}
                        />
                    ))}

                    {/* Duplicates */}
                    {qp.duplicates.pairs.map((dup, i) => (
                        <WarningItem
                            key={`dup-${i}`}
                            severity="medium"
                            title={`Duplicate Content`}
                            issue={dup.explanation}
                            suggestion="Consider removing one or modifying to test different aspects"
                            qid={dup.pair.join(" & ")}
                        />
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
                <button
                    className={styles.analyzeBtn}
                    onClick={runAnalysis}
                    disabled={analyzing}
                >
                    {analyzing ? "Analyzing..." : qp ? "Re-analyze" : "Analyze with QuickPass"}
                </button>

                {qp && (
                    <button
                        className={styles.approveBtn}
                        onClick={approvePaper}
                        disabled={locking || paper.locked_at}
                    >
                        {locking
                            ? "Approving..."
                            : paper.locked_at
                                ? <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} /> Already Locked</span>
                                : "Approve Paper →"}
                    </button>
                )}
            </div>
        </div>
    );
}

function CheckItem({ icon, label, count, status }) {
    return (
        <div className={`${styles.checkItem} ${status ? styles.checkSafe : styles.checkWarning}`}>
            <span className={styles.checkIcon}>{typeof icon === 'string' ? icon : icon}</span>
            <span className={styles.checkLabel}>{label}</span>
            <span className={styles.checkCount}>
                {count === 0 ? "No issues" : `${count} ${count === 1 ? "issue" : "issues"}`}
            </span>
        </div>
    );
}

function WarningItem({ severity, title, issue, suggestion, qid }) {
    const severityClass =
        severity === "high"
            ? styles.severityHigh
            : severity === "medium"
                ? styles.severityMedium
                : styles.severityLow;

    return (
        <div className={`${styles.warningItem} ${severityClass}`}>
            <div className={styles.warningHeader}>
                <span className={styles.severityBadge}>{severity}</span>
                <h3>{title}</h3>
                <span className={styles.qid}>{qid}</span>
            </div>
            <p className={styles.issue}>{issue}</p>
            <p className={styles.suggestion} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lightbulb size={16} /> Suggestion: {suggestion}
            </p>
        </div>
    );
}
