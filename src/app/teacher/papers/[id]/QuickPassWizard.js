"use client";
import React, { useState, useEffect } from "react";
import {
    CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft,
    Loader2, SpellCheck, MessageSquare, HelpCircle, Shield,
    Check, X, RefreshCw, ArrowLeft, ArrowRight
} from "lucide-react";
import "./QuickPassWizard.css";

const STAGES = [
    { id: "spelling", title: "Spelling & Grammar", icon: SpellCheck, description: "Fix typos and grammar errors" },
    { id: "clarity", title: "Language & Clarity", icon: MessageSquare, description: "Improve question readability" },
    { id: "moderation", title: "Paper Moderation", icon: Shield, description: "Marks & Fairness Check" },
];

/**
 * QuickPass 2.0 Wizard Component
 * Sequential moderation workflow with Apply functionality
 */
export default function QuickPassWizard({
    intelligence,
    questions,
    onApplyFix,
    onClose,
    onReanalyze,
    analyzing
}) {
    const [currentStage, setCurrentStage] = useState(0);
    const qp = intelligence?.quickpass;

    if (!qp) {
        return (
            <div className="qpw-loading">
                <Loader2 className="qpw-spinner" size={32} />
                <p>Running analysis...</p>
            </div>
        );
    }

    const getStageStatus = (stageId) => {
        switch (stageId) {
            case "spelling":
                return qp.spelling?.errors?.length === 0 ? "pass" : "issues";
            case "clarity":
                return qp.clarity?.issues?.length === 0 ? "pass" : "issues";
            case "moderation": // Combined Ambiguity + Moderation for simplicity? Or keeping them separate?
                // The logical flow: Basics -> Language -> Technical
                // Let's keep Ambiguity as part of "Language" or "Moderation"?
                // User asked for "Ambiguity of question" after Language.
                // My STAGES array above missed Ambiguity! fixing it now.
                return "pending";
            default:
                return "pending";
        }
    };

    // Stages with new simplified naming
    const FINAL_STAGES = [
        { id: "typos", title: "Typos", icon: SpellCheck, status: (qp.typos?.errors?.length || qp.spelling?.errors?.length || 0) === 0 ? "pass" : "issues" },
        { id: "readability", title: "Readability", icon: MessageSquare, status: (qp.readability?.issues?.length || qp.clarity?.issues?.length || 0) === 0 ? "pass" : "issues" },
        { id: "unclear", title: "Unclear", icon: HelpCircle, status: (qp.unclear?.flags?.length || qp.ambiguity?.flags?.length || 0) === 0 ? "pass" : "issues" },
        { id: "moderation", title: "Moderation", icon: Shield, status: ((qp.moderation?.or_conflicts?.issues?.length || 0) + (qp.moderation?.marks_effort?.warnings?.length || 0) + (qp.moderation?.duplicates?.pairs?.length || 0)) === 0 ? "pass" : "issues" },
    ];

    const handleNext = () => {
        if (currentStage < FINAL_STAGES.length - 1) {
            setCurrentStage(currentStage + 1);
        }
    };

    const handlePrev = () => {
        if (currentStage > 0) {
            setCurrentStage(currentStage - 1);
        }
    };

    const handleApplySpellingFix = (qid, correctedText) => {
        const match = qid.match(/Q(\d+)/i);
        if (match) {
            const index = parseInt(match[1], 10) - 1;
            onApplyFix(index, correctedText);
        }
    };

    const handleApplyClarityFix = (qid, suggestedText) => {
        const match = qid.match(/Q(\d+)/i);
        if (match) {
            const index = parseInt(match[1], 10) - 1;
            onApplyFix(index, suggestedText);
        }
    };

    return (
        <div className="qpw-container">
            {/* Header */}
            <div className="qpw-header">
                <div className="qpw-header-title">
                    <h2>✨ Paper Polish Wizard</h2>
                    <span className="qpw-subtitle">Step-by-step moderation assistant</span>
                </div>
                <div className="qpw-actions">
                    <button
                        className="qpw-btn-secondary"
                        onClick={onReanalyze}
                        disabled={analyzing}
                    >
                        {analyzing ? <Loader2 className="qpw-spinner-small" size={16} /> : <RefreshCw size={16} />}
                        Re-analyze
                    </button>
                    <button className="qpw-btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Stages Stepper */}
            <div className="qpw-progress">
                {FINAL_STAGES.map((stage, index) => {
                    const StageIcon = stage.icon;
                    const isActive = index === currentStage;
                    const isComplete = index < currentStage;

                    return (
                        <div
                            key={stage.id}
                            className={`qpw-stage ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''} ${stage.status}`}
                            onClick={() => setCurrentStage(index)}
                        >
                            <div className="qpw-stage-icon">
                                {stage.status === "pass" ? <CheckCircle2 size={18} /> :
                                    stage.status === "issues" ? <AlertTriangle size={18} /> :
                                        <StageIcon size={18} />}
                            </div>
                            <span className="qpw-stage-title">{stage.title}</span>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Area - Carousel Mode */}
            <div className="qpw-content">
                {currentStage === 0 && (
                    <CarouselStage
                        title="Typos"
                        items={qp.typos?.errors || qp.spelling?.errors || []}
                        emptyMessage="No spelling or grammar errors found! 🎉"
                        renderItem={(item) => (
                            <SpellingCard
                                item={item}
                                onApply={(text) => handleApplySpellingFix(item.qid, text)}
                            />
                        )}
                    />
                )}
                {currentStage === 1 && (
                    <CarouselStage
                        title="Readability"
                        items={qp.readability?.issues || qp.clarity?.issues || []}
                        emptyMessage="Language is clear and readable! 👁️"
                        renderItem={(item) => (
                            <ClarityCard
                                item={item}
                                onApply={(text) => handleApplyClarityFix(item.qid, text)}
                            />
                        )}
                    />
                )}
                {currentStage === 2 && (
                    <CarouselStage
                        title="Unclear Questions"
                        items={qp.unclear?.flags || qp.ambiguity?.flags || []}
                        emptyMessage="No ambiguity detected. Questions are sharp! 🧠"
                        renderItem={(item) => (
                            <AmbiguityCard item={item} />
                        )}
                    />
                )}
                {currentStage === 3 && (
                    <ModerationDashboard data={qp.moderation || {}} />
                )}
            </div>

            {/* Footer */}
            <div className="qpw-footer">
                <button
                    className="qpw-btn-nav"
                    onClick={handlePrev}
                    disabled={currentStage === 0}
                >
                    <ChevronLeft size={18} /> Back
                </button>

                <div className="qpw-dots">
                    {FINAL_STAGES.map((_, i) => (
                        <div key={i} className={`qpw-dot ${i === currentStage ? 'active' : ''}`} />
                    ))}
                </div>

                {currentStage < FINAL_STAGES.length - 1 ? (
                    <button className="qpw-btn-nav qpw-btn-primary" onClick={handleNext}>
                        Next Stage <ChevronRight size={18} />
                    </button>
                ) : (
                    <button className="qpw-btn-nav qpw-btn-complete" onClick={onClose}>
                        <Check size={18} /> Finish Review
                    </button>
                )}
            </div>
        </div>
    );
}

/**
 * Reusable Carousel Component for Focus View
 */
function CarouselStage({ title, items, emptyMessage, renderItem }) {
    const [index, setIndex] = useState(0);

    if (!items || items.length === 0) {
        return (
            <div className="qpw-stage-empty">
                <CheckCircle2 size={64} className="qpw-success-icon" />
                <h3>All Clear!</h3>
                <p>{emptyMessage}</p>
            </div>
        );
    }

    const currentItem = items[index];

    return (
        <div className="qpw-carousel-container">
            <div className="qpw-carousel-header">
                <h3>{title} <span className="qpw-count-badge">{items.length} Issues</span></h3>
                <span className="qpw-counter">Issue {index + 1} of {items.length}</span>
            </div>

            <div className="qpw-carousel-body">
                <button
                    className="qpw-nav-arrow left"
                    disabled={index === 0}
                    onClick={() => setIndex(i => i - 1)}
                >
                    <ChevronLeft size={32} />
                </button>

                <div className="qpw-card-wrapper animate-fade-in">
                    {renderItem(currentItem)}
                </div>

                <button
                    className="qpw-nav-arrow right"
                    disabled={index === items.length - 1}
                    onClick={() => setIndex(i => i + 1)}
                >
                    <ChevronRight size={32} />
                </button>
            </div>

            <div className="qpw-carousel-footer">
                {/* Optional: Add "Skip" or "Mark as Ignored" buttons here later */}
            </div>
        </div>
    );
}

/* --- Card Components --- */

function SpellingCard({ item, onApply }) {
    return (
        <div className="qpw-focus-card spelling">
            <div className="qpw-focus-header">
                <div className="qpw-qid-badge">{item.qid}</div>
                <div className="qpw-issue-label">Spelling & Grammar</div>
            </div>

            <div className="qpw-focus-content">
                <div className="qpw-error-list">
                    {item.errors.map((e, i) => (
                        <div key={i} className="qpw-error-chip"><AlertTriangle size={12} /> {e}</div>
                    ))}
                </div>

                <div className="qpw-correction-preview">
                    <div className="qpw-preview-label">Proposed Fix:</div>
                    <div className="qpw-preview-text">{item.corrected_text}</div>
                </div>
            </div>

            <div className="qpw-focus-actions">
                <button className="qpw-action-btn primary" onClick={() => onApply(item.corrected_text)}>
                    <Check size={16} /> Apply Fix
                </button>
            </div>
        </div>
    );
}

function ClarityCard({ item, onApply }) {
    return (
        <div className="qpw-focus-card clarity">
            <div className="qpw-focus-header">
                <div className="qpw-qid-badge">{item.qid}</div>
                <div className="qpw-issue-label">Clarity Issue</div>
            </div>

            <div className="qpw-focus-content">
                <div className="qpw-issue-description">
                    <AlertTriangle size={16} className="text-orange-500" />
                    <p>{item.issue}</p>
                </div>

                <div className="qpw-diff-view">
                    <div className="qpw-diff-box original">
                        <span>Original</span>
                        <p>{item.original_text}</p>
                    </div>
                    <div className="qpw-diff-arrow"><ArrowRight size={20} /></div>
                    <div className="qpw-diff-box suggested">
                        <span>Suggested</span>
                        <p>{item.suggested_text}</p>
                    </div>
                </div>
            </div>

            <div className="qpw-focus-actions">
                <button className="qpw-action-btn primary" onClick={() => onApply(item.suggested_text)}>
                    <RefreshCw size={16} /> Replace with Suggestion
                </button>
            </div>
        </div>
    );
}

function AmbiguityCard({ item }) {
    return (
        <div className={`qpw-focus-card ambiguity ${item.severity}`}>
            <div className="qpw-focus-header">
                <div className="qpw-qid-badge">{item.qid}</div>
                <span className={`qpw-severity-badge ${item.severity}`}>
                    {item.severity} SEVERITY
                </span>
            </div>

            <div className="qpw-focus-content">
                <h3>Ambiguity Detected</h3>
                <p className="qpw-issue-text">{item.issue}</p>

                <div className="qpw-suggestion-box">
                    <strong>💡 Recommendation:</strong>
                    <p>{item.suggestion}</p>
                </div>
            </div>

            <div className="qpw-focus-actions">
                {/* Ambiguity usually requires manual editing, so maybe a 'Edit' button that closes wizard? 
                    For now just acknowledgment. */}
                <button className="qpw-action-btn secondary">
                    Acknowledged
                </button>
            </div>
        </div>
    );
}

function ModerationDashboard({ data }) {
    const orConflicts = data?.or_conflicts?.issues || [];
    const marksWarnings = data?.marks_effort?.warnings || [];
    const duplicates = data?.duplicates?.pairs || [];
    const smoothnessIssues = data?.evaluation_smoothness?.issues || [];
    const total = orConflicts.length + marksWarnings.length + duplicates.length + smoothnessIssues.length;

    if (total === 0) {
        return (
            <div className="qpw-stage-empty">
                <Shield size={64} className="qpw-success-icon" />
                <h3>Paper is Robust!</h3>
                <p>No critical moderation issues found.</p>
            </div>
        );
    }

    return (
        <div className="qpw-dashboard">
            <div className="qpw-dashboard-header">
                <h3>Moderation Report</h3>
                <span className="qpw-count-badge warning">{total} Issues Found</span>
            </div>
            <div className="qpw-dashboard-grid">
                {/* We can still use lists here as these are summary items, or grouped cards */}
                {orConflicts.map((i, idx) => (
                    <div key={`or-${idx}`} className="qpw-mod-card">
                        <div className="qpw-mod-icon"><Shield size={16} /> OR Fairness</div>
                        <p>{i.issue}</p>
                        <div className="qpw-mod-meta">{i.pair.join(" vs ")}</div>
                    </div>
                ))}
                {marksWarnings.map((i, idx) => (
                    <div key={`mk-${idx}`} className="qpw-mod-card">
                        <div className="qpw-mod-icon"><AlertTriangle size={16} /> Marks</div>
                        <p>{i.reason}</p>
                        <div className="qpw-mod-meta">Q{i.qid} • {i.allocated_marks} → {i.recommended_marks} marks</div>
                    </div>
                ))}
                {duplicates.map((i, idx) => (
                    <div key={`dp-${idx}`} className="qpw-mod-card">
                        <div className="qpw-mod-icon"><RefreshCw size={16} /> Duplicate</div>
                        <p>{i.explanation}</p>
                        <div className="qpw-mod-meta">{i.pair.join(" & ")}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
