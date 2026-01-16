// QuickPass Professional Review Console Components
"use client";
import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, AlertCircle, FileText, Loader2, RefreshCw, Scale, BarChart3, Repeat, Lightbulb, HelpCircle } from "lucide-react";
import "./QuickPassReview.css";

/**
 * Calculate Paper Health Score (0-100)
 */
function calculatePaperHealth(intelligence) {
    if (!intelligence?.quickpass) return 100;

    const qp = intelligence.quickpass;
    let score = 100;

    // Simple deduction per issue type (no severity weighting)
    score -= (qp.ambiguity.flags.length * 8);
    score -= (qp.or_conflicts.issues.length * 12);
    score -= (qp.marks_effort.warnings.length * 6);
    score -= (qp.duplicates.pairs.length * 10);
    score -= ((qp.evaluation_smoothness?.issues?.length || 0) * 8);

    return Math.max(0, Math.min(100, score));
}

/**
 * Get risk assessment
 */
function getRiskLevel(score) {
    if (score >= 85) return { level: 'Low', color: 'low', message: 'Paper is well-structured and safe for evaluation' };
    if (score >= 65) return { level: 'Medium', color: 'medium', message: 'Paper may lead to 2-3 marking disputes' };
    return { level: 'High', color: 'high', message: 'Paper has significant issues that need attention' };
}

/**
 * Paper Health Bar Component - With Faculty Insights
 */
export function PaperHealthBar({ intelligence }) {
    const qp = intelligence.quickpass;

    const totalIssues =
        qp.ambiguity.flags.length +
        qp.or_conflicts.issues.length +
        qp.marks_effort.warnings.length +
        qp.duplicates.pairs.length +
        (qp.evaluation_smoothness?.issues?.length || 0);

    // Generate faculty-focused insights
    const insights = [];

    if (qp.ambiguity.flags.length > 0) {
        insights.push({ icon: AlertTriangle, text: `${qp.ambiguity.flags.length} question(s) may cause student confusion - review wording for clarity` });
    }
    if (qp.or_conflicts.issues.length > 0) {
        insights.push({ icon: Scale, text: `${qp.or_conflicts.issues.length} OR pair(s) have fairness issues - students may complain about unequal difficulty` });
    }
    if (qp.marks_effort.warnings.length > 0) {
        insights.push({ icon: BarChart3, text: `${qp.marks_effort.warnings.length} question(s) have marks allocation concerns - may face scrutiny during moderation` });
    }
    if (qp.duplicates.pairs.length > 0) {
        insights.push({ icon: Repeat, text: `${qp.duplicates.pairs.length} pair(s) test overlapping concepts - reduces paper quality` });
    }
    if ((qp.evaluation_smoothness?.issues?.length || 0) > 0) {
        insights.push({ icon: FileText, text: `${qp.evaluation_smoothness.issues.length} question(s) may produce inconsistent marking across evaluators` });
    }

    // Determine overall status
    let statusColor, statusBg, StatusIcon, statusText;
    if (totalIssues === 0) {
        statusColor = '#10b981';
        statusBg = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
        StatusIcon = CheckCircle2;
        statusText = 'Paper is ready for evaluation. No issues detected.';
    } else if (totalIssues <= 3) {
        statusColor = '#f59e0b';
        statusBg = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
        StatusIcon = AlertTriangle;
        statusText = 'Review recommended before finalizing.';
    } else {
        statusColor = '#ef4444';
        statusBg = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
        StatusIcon = AlertCircle;
        statusText = 'Significant review required.';
    }

    return (
        <div className="paper-health-header" style={{
            padding: '20px 24px',
            background: statusBg,
            borderLeft: `5px solid ${statusColor}`
        }}>
            {/* Main Status */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: insights.length > 0 ? '16px' : '0',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#1f2937'
            }}>
                <StatusIcon size={24} style={{ color: statusColor }} />
                <span>{statusText}</span>
            </div>

            {/* Detailed Insights */}
            {insights.length > 0 && (
                <div style={{
                    background: 'rgba(255,255,255,0.7)',
                    borderRadius: '8px',
                    padding: '12px 16px'
                }}>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                    }}>
                        Key Concerns for Faculty
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {insights.map((insight, i) => {
                            const InsightIcon = insight.icon;
                            return (
                                <div key={i} style={{
                                    fontSize: '0.9rem',
                                    color: '#374151',
                                    paddingLeft: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <InsightIcon size={16} style={{ flexShrink: 0 }} />
                                    <span>{insight.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Sticky Approval Panel (Right Side)
 */
export function ApprovalPanel({ intelligence, onReanalyze, onApprove, analyzing, locked }) {
    const qp = intelligence.quickpass;
    const health = calculatePaperHealth(intelligence);

    return (
        <div className="approval-panel">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                QuickPass Status
            </h3>

            <div className="panel-metrics">
                <div className="panel-metric">
                    <span className="panel-metric-label">Ambiguity</span>
                    <span className={`panel-metric-value ${qp.ambiguity.flags.length > 0 ? 'has-issues' : ''}`}>
                        {qp.ambiguity.flags.length > 0 ? `⚠ ${qp.ambiguity.flags.length}` : '✓'}
                    </span>
                </div>
                <div className="panel-metric">
                    <span className="panel-metric-label">OR Conflicts</span>
                    <span className={`panel-metric-value ${qp.or_conflicts.issues.length > 0 ? 'has-issues' : ''}`}>
                        {qp.or_conflicts.issues.length > 0 ? `⚠ ${qp.or_conflicts.issues.length}` : '✓'}
                    </span>
                </div>
                <div className="panel-metric">
                    <span className="panel-metric-label">Marks Issues</span>
                    <span className={`panel-metric-value ${qp.marks_effort.warnings.length > 0 ? 'has-issues' : ''}`}>
                        {qp.marks_effort.warnings.length > 0 ? `⚠ ${qp.marks_effort.warnings.length}` : '✓'}
                    </span>
                </div>
                <div className="panel-metric">
                    <span className="panel-metric-label">Duplicates</span>
                    <span className={`panel-metric-value ${qp.duplicates.pairs.length > 0 ? 'has-issues' : ''}`}>
                        {qp.duplicates.pairs.length > 0 ? `⚠ ${qp.duplicates.pairs.length}` : '✓'}
                    </span>
                </div>
            </div>

            <div className="panel-actions">
                <button
                    className="panel-btn reanalyze-btn"
                    onClick={onReanalyze}
                    disabled={analyzing}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                >
                    {analyzing ? (
                        <><Loader2 className="animate-spin" size={16} /> Analyzing...</>
                    ) : (
                        <><RefreshCw size={16} /> Re-analyze</>
                    )}
                </button>
                <button
                    className="panel-btn approve-btn"
                    onClick={onApprove}
                    disabled={locked || health < 50}
                    title={health < 50 ? 'Health score too low to approve' : ''}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                >
                    {locked ? (
                        <><CheckCircle2 size={16} /> Already Locked</>
                    ) : (
                        '✓ Approve Paper'
                    )}
                </button>
            </div>
        </div>
    );
}

/**
 * Inspection Card Component (Collapsible)
 */
function InspectionCard({ warning, onApplySuggestion }) {
    const [expanded, setExpanded] = useState(false);

    const getIcon = () => {
        if (warning.type === 'ambiguity') return HelpCircle;
        if (warning.type === 'marks') return BarChart3;
        if (warning.type === 'or_conflict') return Scale;
        if (warning.type === 'smoothness') return FileText;
        if (warning.type === 'duplicate') return Repeat;
        return AlertTriangle;
    };

    const getTitle = () => {
        if (warning.type === 'ambiguity') return 'Clarity Issue';
        if (warning.type === 'marks') return 'Marks Mismatch';
        if (warning.type === 'or_conflict') return 'Unfair OR Options';
        if (warning.type === 'smoothness') return 'Marking Difficulty';
        if (warning.type === 'duplicate') return 'Repeated Concept';
        return 'Issue';
    };

    // Parse issue into bullet points
    const bullets = warning.issue.split(/[.\n]/).filter(s => s.trim().length > 10);

    return (
        <div
            className={`inspection-card ${expanded ? 'expanded' : 'collapsed'}`}
            style={{ border: '2px solid #e5e7eb', background: '#fafafa' }}
            onClick={() => setExpanded(!expanded)}
        >
            <div className="card-header">
                <span className="card-icon">{React.createElement(getIcon(), { size: 20 })}</span>
                <span className="card-title">{getTitle()}</span>
                <span className="expand-icon">{expanded ? '▲' : '▼'}</span>
            </div>

            {expanded && (
                <div className="card-body" onClick={(e) => e.stopPropagation()}>
                    <ul className="traffic-light-list">
                        {bullets.length > 1 ? (
                            bullets.map((bullet, i) => <li key={i}>{bullet.trim()}</li>)
                        ) : (
                            <li>{warning.issue}</li>
                        )}
                    </ul>

                    <div className="card-suggestion">
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Lightbulb size={16} /> Suggested Fix:
                        </strong>
                        <p>{warning.suggestion}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * View Issues Button + Cards for a Question
 */
export function QuestionIssues({ qid, questionIndex, intelligence, onApplySuggestion }) {
    const [showIssues, setShowIssues] = useState(false);
    const qp = intelligence.quickpass;
    const warnings = [];

    // Collect warnings for this question
    qp.ambiguity.flags.forEach((flag) => {
        if (flag.qid === qid || flag.qid === `q_${questionIndex}` || flag.qid === `Q${questionIndex + 1}`) {
            warnings.push({
                type: 'ambiguity',
                severity: flag.severity,
                issue: flag.issue,
                suggestion: flag.suggestion,
            });
        }
    });

    qp.marks_effort.warnings.forEach((warn) => {
        if (warn.qid === qid || warn.qid === `q_${questionIndex}` || warn.qid === `Q${questionIndex + 1}`) {
            warnings.push({
                type: 'marks',
                severity: 'medium',
                issue: warn.reason,
                suggestion: `Adjust from ${warn.allocated_marks} to ${warn.recommended_marks} marks`,
            });
        }
    });

    qp.or_conflicts.issues.forEach((issue) => {
        // Check if this question is in the pair (handle multiple ID formats)
        const possibleIds = [qid, `Q${questionIndex + 1}`, `q_${questionIndex}`, String(questionIndex + 1)];
        const isInPair = issue.pair.some(pid => possibleIds.includes(pid) || pid === qid);
        if (isInPair) {
            warnings.push({
                type: 'or_conflict',
                severity: 'high',
                issue: issue.issue,
                suggestion: issue.recommendation,
            });
        }
    });


    qp.duplicates.pairs.forEach((dup) => {
        // Check if this question is in the pair (handle multiple ID formats)
        const possibleIds = [qid, `Q${questionIndex + 1}`, `q_${questionIndex}`, String(questionIndex + 1)];
        const isInPair = dup.pair.some(pid => possibleIds.includes(pid) || pid === qid);
        if (isInPair) {
            warnings.push({
                type: 'duplicate',
                severity: 'medium',
                issue: dup.explanation,
                suggestion: 'Consider removing one or modifying to test different aspects',
            });
        }
    });

    // Evaluation smoothness issues (marking consistency)
    qp.evaluation_smoothness?.issues?.forEach((issue) => {
        if (issue.qid === qid || issue.qid === `Q${questionIndex + 1}`) {
            warnings.push({
                type: 'smoothness',
                severity: 'medium',
                issue: issue.issue,
                suggestion: issue.risk || 'Consider making the expected answer more specific',
            });
        }
    });

    if (warnings.length === 0) return null;

    return (
        <>
            <button
                className="view-issues-btn"
                onClick={() => setShowIssues(!showIssues)}
            >
                <span>{showIssues ? '▼' : '▶'} View Issues</span>
                <span className="badge">{warnings.length}</span>
            </button>

            {showIssues && (
                <div className="inspection-cards">
                    {warnings.map((warning, idx) => (
                        <InspectionCard
                            key={idx}
                            warning={warning}
                            onApplySuggestion={onApplySuggestion}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
