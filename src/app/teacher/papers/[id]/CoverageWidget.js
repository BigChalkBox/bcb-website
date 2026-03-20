// src/app/teacher/papers/[id]/CoverageWidget.js
"use client";
import React, { useState, useEffect } from "react";
import { RefreshCw, ChevronDown, Loader2, Search } from "lucide-react";
import styles from "./CoverageWidget.module.css";

export default function CoverageWidget({ paperId, curriculumId, autoAnalyze = false, questions: propQuestions = null }) {
    const [coverage, setCoverage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState("co"); // co, unit, topic
    const [expandedId, setExpandedId] = useState(null);
    const [showAllUncovered, setShowAllUncovered] = useState(false);

    // Fetch existing coverage or run fresh analysis if autoAnalyze is true
    useEffect(() => {
        async function fetchOrAnalyzeCoverage() {
            if (!paperId) return;

            if (autoAnalyze) {
                // Run fresh analysis when autoAnalyze is true
                setAnalyzing(true);
                try {
                    const res = await fetch(`/api/papers/${paperId}/analyze-coverage`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ questions: propQuestions }),
                    });
                    const data = await res.json();
                    if (data.success) {
                        setCoverage(data.coverage);
                        if (!data.coverage.coAnalysis?.length) {
                            setActiveTab("unit");
                        }
                    }
                } catch (err) {
                    console.error("Analysis error:", err);
                } finally {
                    setAnalyzing(false);
                }
            } else {
                // Just fetch cached coverage
                setLoading(true);
                try {
                    const res = await fetch(`/api/papers/${paperId}/analyze-coverage`);
                    const data = await res.json();
                    if (data.success && data.coverage) {
                        setCoverage(data.coverage);
                        if (!data.coverage.coAnalysis?.length) {
                            setActiveTab("unit");
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch coverage:", err);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchOrAnalyzeCoverage();
    }, [paperId, autoAnalyze]);

    // Run analysis
    const runAnalysis = async () => {
        setAnalyzing(true);
        try {
            const res = await fetch(`/api/papers/${paperId}/analyze-coverage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questions: propQuestions }),
            });
            const data = await res.json();
            if (data.success) {
                setCoverage(data.coverage);
                if (!data.coverage.coAnalysis?.length) {
                    setActiveTab("unit");
                }
            } else {
                alert(`Analysis failed: ${data.error}`);
            }
        } catch (err) {
            console.error("Analysis error:", err);
            alert("Analysis failed");
        } finally {
            setAnalyzing(false);
        }
    };

    // Get color based on percentage
    const getColor = (percent) => {
        if (percent >= 70) return "#10b981";
        if (percent >= 30) return "#f59e0b";
        return "#ef4444";
    };

    if (!curriculumId) {
        return (
            <div className={styles.noCurriculum}>
                <span className={styles.icon}>📚</span>
                <p>No curriculum linked</p>
                <small>Link a syllabus to see coverage analysis</small>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader2 className={styles.spinner} size={24} />
                <p>Loading coverage...</p>
            </div>
        );
    }

    if (!coverage) {
        return (
            <div className={styles.noAnalysis}>
                <span className={styles.icon}>📊</span>
                <p>Coverage not analyzed yet</p>
                <button
                    className={styles.analyzeBtn}
                    onClick={runAnalysis}
                    disabled={analyzing}
                >
                    {analyzing ? (
                        <>
                            <Loader2 size={16} className={styles.spinner} /> Analyzing...
                        </>
                    ) : (
                        <>
                            <Search size={16} /> Analyze Coverage
                        </>
                    )}
                </button>
            </div>
        );
    }

    const hasCOs = coverage.coAnalysis?.length > 0;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h4>📊 Syllabus Coverage</h4>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={styles.refreshBtn}
                        onClick={runAnalysis}
                        disabled={analyzing}
                        title="Re-analyze"
                    >
                        <RefreshCw size={14} className={analyzing ? styles.spinner : ""} />
                    </button>
                </div>
            </div>

            {/* Overall Score */}
            <div className={styles.overallScore}>
                <div
                    className={styles.scoreCircle}
                    style={{
                        background: `conic-gradient(${getColor(coverage.overall)} ${coverage.overall}%, #e2e8f0 ${coverage.overall}%)`,
                    }}
                >
                    <span className={styles.scoreValue}>{coverage.overall}%</span>
                </div>
                <div className={styles.scoreMeta}>
                    <span className={styles.scoreLabel}>Overall Coverage</span>
                    <span className={styles.topicsMeta}>
                        {coverage.coveredTopics}/{coverage.totalTopics} topics covered
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                {hasCOs && (
                    <button
                        className={`${styles.tab} ${activeTab === "co" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("co")}
                    >
                        By CO
                    </button>
                )}
                <button
                    className={`${styles.tab} ${activeTab === "unit" ? styles.tabActive : ""}`}
                    onClick={() => setActiveTab("unit")}
                >
                    By Unit
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "topic" ? styles.tabActive : ""}`}
                    onClick={() => setActiveTab("topic")}
                >
                    By Topic
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === "co" && hasCOs && (
                <div className={styles.coSection}>
                    {coverage.coAnalysis.map((co) => (
                        <div
                            key={co.id}
                            className={`${styles.coCard} ${expandedId === co.id ? styles.coCardExpanded : ""}`}
                            onClick={() => setExpandedId(expandedId === co.id ? null : co.id)}
                        >
                            <div className={styles.coHeader}>
                                <div className={styles.coInfo}>
                                    <span className={styles.coCode}>{co.code}</span>
                                    <p className={styles.coDescription}>{co.description}</p>
                                </div>
                                <div className={styles.coStats}>
                                    <div
                                        className={styles.coProgress}
                                        style={{
                                            background: `conic-gradient(${getColor(co.coverage)} ${co.coverage}%, #e2e8f0 ${co.coverage}%)`,
                                        }}
                                    >
                                        <span className={styles.coProgressValue}>{co.coverage}%</span>
                                    </div>
                                    <ChevronDown
                                        size={18}
                                        className={`${styles.expandIcon} ${expandedId === co.id ? styles.expandIconRotated : ""}`}
                                    />
                                </div>
                            </div>

                            {expandedId === co.id && co.mappedUnits?.length > 0 && (
                                <div className={styles.coDetails}>
                                    <div className={styles.coUnitsLabel}>Mapped Units</div>
                                    <div className={styles.coUnits}>
                                        {co.mappedUnits.map((unit) => (
                                            <div key={unit.id} className={styles.coUnitItem}>
                                                <span className={styles.coUnitName}>{unit.name}</span>
                                                <span
                                                    className={styles.coUnitCoverage}
                                                    style={{ color: getColor(unit.coverage) }}
                                                >
                                                    {unit.coverage}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "unit" && (
                <div className={styles.unitsSection}>
                    {coverage.units?.map((unit) => (
                        <div
                            key={unit.id}
                            className={`${styles.unitCard} ${expandedId === unit.id ? styles.unitCardExpanded : ""}`}
                            onClick={() => setExpandedId(expandedId === unit.id ? null : unit.id)}
                        >
                            <div className={styles.unitHeader}>
                                <div className={styles.unitInfo}>
                                    <span className={styles.unitName}>{unit.name}</span>
                                    <span className={styles.unitMeta}>
                                        {unit.topics?.length || 0} topics • Expected: {unit.expectedPercent}%
                                    </span>
                                </div>
                                <div className={styles.unitStats}>
                                    <span
                                        className={styles.unitPercent}
                                        style={{ color: getColor(unit.coverage) }}
                                    >
                                        {unit.coverage}%
                                    </span>
                                    <div className={styles.unitBar}>
                                        <div
                                            className={styles.unitFill}
                                            style={{
                                                width: `${unit.coverage}%`,
                                                background: getColor(unit.coverage),
                                            }}
                                        />
                                    </div>
                                    <ChevronDown
                                        size={18}
                                        className={`${styles.expandIcon} ${expandedId === unit.id ? styles.expandIconRotated : ""}`}
                                    />
                                </div>
                            </div>

                            {expandedId === unit.id && unit.topics?.length > 0 && (
                                <div className={styles.unitTopics}>
                                    {unit.topics.map((topic) => (
                                        <div key={topic.id} className={styles.topicRow}>
                                            <span className={styles.topicName}>
                                                <span className={styles.topicStatus}>
                                                    {topic.status === "covered" || topic.status === "partial"
                                                        ? "✅"
                                                        : "❌"}
                                                </span>
                                                {topic.name}
                                            </span>
                                            <span className={styles.topicQuestions}>
                                                {topic.questions?.length > 0
                                                    ? topic.questions.map(q => `Q${q.index}`).join(", ")
                                                    : <span className={styles.noQuestions}>-</span>}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "topic" && (
                <div className={styles.topicsSection}>
                    {coverage.units?.flatMap((unit) =>
                        unit.topics?.map((topic) => (
                            <div key={topic.id} className={styles.topicCard}>
                                <div className={styles.topicInfo}>
                                    <span className={styles.topicStatus}>
                                        {topic.status === "covered" || topic.status === "partial"
                                            ? "✅"
                                            : "❌"}
                                    </span>
                                    <div className={styles.topicDetails}>
                                        <span className={styles.topicTitle}>{topic.name}</span>
                                        <span className={styles.topicUnit}>{unit.name}</span>
                                    </div>
                                </div>
                                <span className={styles.topicQuestions}>
                                    {topic.questions?.length > 0
                                        ? topic.questions.map(q => `Q${q.index}`).join(", ")
                                        : <span className={styles.noQuestions}>-</span>}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Uncovered Topics Warning */}
            {coverage.uncoveredTopics?.length > 0 && (
                <div className={styles.uncovered}>
                    <div className={styles.uncoveredTitle}>
                        ⚠️ {coverage.uncoveredTopics.length} Uncovered Topics
                    </div>
                    <ul className={styles.uncoveredList}>
                        {(showAllUncovered ? coverage.uncoveredTopics : coverage.uncoveredTopics.slice(0, 5)).map((t, i) => (
                            <li key={i}>{t.name}</li>
                        ))}
                        {coverage.uncoveredTopics.length > 5 && !showAllUncovered && (
                            <li
                                className={styles.more}
                                onClick={() => setShowAllUncovered(true)}
                                style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}
                            >
                                +{coverage.uncoveredTopics.length - 5} more...
                            </li>
                        )}
                        {coverage.uncoveredTopics.length > 5 && showAllUncovered && (
                            <li
                                className={styles.more}
                                onClick={() => setShowAllUncovered(false)}
                                style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}
                            >
                                Show less
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
