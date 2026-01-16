// Floating QuickPass Status Button Component
"use client";
import React, { useState } from "react";
import "./FloatingQuickPassStatus.css";

export function FloatingQuickPassStatus({ intelligence, onReanalyze, onApprove, analyzing, locked }) {
    const [expanded, setExpanded] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    if (!intelligence?.quickpass) return null;

    const qp = intelligence.quickpass;
    const health = calculatePaperHealth(intelligence);
    const totalIssues = qp.ambiguity.flags.length + qp.or_conflicts.issues.length +
        qp.marks_effort.warnings.length + qp.duplicates.pairs.length;

    return (
        <>
            {/* Floating Button */}
            <button
                className={`floating-quickpass-btn ${expanded ? 'expanded' : ''}`}
                onClick={() => setExpanded(!expanded)}
                title="QuickPass Status"
            >
                <span className="floating-icon">⚡</span>
                {!expanded && (
                    <span className="floating-badge">{totalIssues}</span>
                )}
            </button>

            {/* Expanded Panel */}
            {expanded && (
                <div className="floating-quickpass-panel">
                    <div className="floating-panel-header">
                        <h3>⚡ QuickPass Status</h3>
                        <div className="header-buttons">
                            <button
                                className="help-btn"
                                onClick={() => setShowHelp(!showHelp)}
                                title="Learn about metrics"
                            >
                                ℹ️
                            </button>
                            <button
                                className="close-floating-btn"
                                onClick={() => setExpanded(false)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="floating-health-score">
                        <div className="health-label">Paper Health</div>
                        <div className="health-value">{health}/100</div>
                        <div className="health-bar-mini">
                            <div
                                className="health-bar-fill-mini"
                                style={{
                                    width: `${health}%`,
                                    backgroundColor: health >= 85 ? '#10b981' : health >= 65 ? '#f59e0b' : '#ef4444'
                                }}
                            />
                        </div>
                    </div>

                    <div className="floating-metrics">
                        <MetricRow label="Ambiguity" count={qp.ambiguity.flags.length} safe={qp.ambiguity.safe} />
                        <MetricRow label="OR Conflicts" count={qp.or_conflicts.issues.length} safe={qp.or_conflicts.safe} />
                        <MetricRow label="Marks Issues" count={qp.marks_effort.warnings.length} safe={qp.marks_effort.safe} />
                        <MetricRow label="Duplicates" count={qp.duplicates.pairs.length} safe={qp.duplicates.safe} />
                    </div>

                    <div className="floating-actions">
                        <button
                            className="floating-action-btn reanalyze"
                            onClick={(e) => {
                                e.stopPropagation();
                                onReanalyze();
                            }}
                            disabled={analyzing}
                        >
                            {analyzing ? '⏳ Analyzing...' : '🔄 Re-analyze'}
                        </button>
                        <button
                            className="floating-action-btn approve"
                            onClick={(e) => {
                                e.stopPropagation();
                                onApprove();
                            }}
                            disabled={locked || health < 50}
                        >
                            {locked ? '✅ Locked' : '✓ Approve'}
                        </button>
                    </div>

                    {/* Help Modal */}
                    {showHelp && (
                        <div className="help-modal">
                            <h4>📊 Understanding QuickPass Metrics</h4>
                            <div className="help-content">
                                <div className="help-item">
                                    <div className="help-title">🔍 Clarity</div>
                                    <p>Flags questions where students can interpret the question in multiple ways, scope is unclear, or key terms need definition.</p>
                                </div>
                                <div className="help-item">
                                    <div className="help-title">⚖️ OR Fairness</div>
                                    <p>Checks if OR options have equal difficulty and time requirements. Flags pairs where one option is clearly easier or takes longer to answer.</p>
                                </div>
                                <div className="help-item">
                                    <div className="help-title">📝 Marks</div>
                                    <p>Validates if marks allocated match the question complexity. Flags when marks are too high for simple questions or too low for complex ones.</p>
                                </div>
                                <div className="help-item">
                                    <div className="help-title">🔁 Duplicates</div>
                                    <p>Detects questions that test the same concept or skill. Prevents students from getting &quot;free marks&quot; through repetition.</p>
                                </div>
                                <div className="help-item">
                                    <div className="help-title">✏️ Marking</div>
                                    <p>Identifies questions that will be hard to mark consistently. Flags overly open-ended questions or those with no clear expected answer.</p>
                                </div>
                            </div>
                            <button
                                className="close-help-btn"
                                onClick={() => setShowHelp(false)}
                            >
                                Got it!
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

function MetricRow({ label, count, safe }) {
    return (
        <div className="floating-metric-row">
            <span className="metric-label">{label}</span>
            <span className={`metric-value ${!safe ? 'has-issues' : ''}`}>
                {count > 0 ? `⚠ ${count}` : '✓'}
            </span>
        </div>
    );
}

function calculatePaperHealth(intelligence) {
    if (!intelligence?.quickpass) return 100;
    const qp = intelligence.quickpass;
    let score = 100;

    const highAmbiguity = qp.ambiguity.flags.filter(f => f.severity === 'high').length;
    const mediumAmbiguity = qp.ambiguity.flags.filter(f => f.severity === 'medium').length;
    const lowAmbiguity = qp.ambiguity.flags.filter(f => f.severity === 'low').length;

    score -= (highAmbiguity * 15);
    score -= (mediumAmbiguity * 8);
    score -= (lowAmbiguity * 3);
    score -= (qp.or_conflicts.issues.length * 12);
    score -= (qp.marks_effort.warnings.length * 6);
    score -= (qp.duplicates.pairs.length * 10);

    return Math.max(0, Math.min(100, score));
}
