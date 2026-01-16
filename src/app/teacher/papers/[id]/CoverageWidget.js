// src/app/teacher/papers/[id]/CoverageWidget.js
"use client";
import React, { useState, useEffect } from "react";
import styles from "./CoverageWidget.module.css";

export default function CoverageWidget({ paperId, curriculumId }) {
    const [coverage, setCoverage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    // Fetch existing coverage
    useEffect(() => {
        async function fetchCoverage() {
            if (!paperId) return;
            setLoading(true);
            try {
                const res = await fetch(`/api/papers/${paperId}/analyze-coverage`);
                const data = await res.json();
                if (data.success && data.coverage) {
                    setCoverage(data.coverage);
                }
            } catch (err) {
                console.error("Failed to fetch coverage:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCoverage();
    }, [paperId]);

    // Run analysis
    const runAnalysis = async () => {
        setAnalyzing(true);
        try {
            const res = await fetch(`/api/papers/${paperId}/analyze-coverage`, {
                method: "POST",
            });
            const data = await res.json();
            if (data.success) {
                setCoverage(data.coverage);
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
        return <div className={styles.loading}>Loading coverage...</div>;
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
                    {analyzing ? "Analyzing..." : "🔍 Analyze Coverage"}
                </button>
            </div>
        );
    }

    // Get color based on percentage
    const getColor = (percent) => {
        if (percent >= 70) return "#10b981";
        if (percent >= 30) return "#f59e0b";
        return "#ef4444";
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h4>📊 Syllabus Coverage</h4>
                <button
                    className={styles.refreshBtn}
                    onClick={runAnalysis}
                    disabled={analyzing}
                    title="Re-analyze"
                >
                    🔄
                </button>
            </div>

            {/* Overall Score */}
            <div className={styles.overallScore}>
                <div
                    className={styles.scoreCircle}
                    style={{
                        background: `conic-gradient(${getColor(coverage.overall)} ${coverage.overall}%, #e2e8f0 ${coverage.overall}%)`
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

            {/* Unit Breakdown */}
            <div className={styles.units}>
                {coverage.units?.map((unit, i) => (
                    <div key={i} className={styles.unitRow}>
                        <div className={styles.unitInfo}>
                            <span className={styles.unitName}>{unit.name}</span>
                            <span
                                className={styles.unitPercent}
                                style={{ color: getColor(unit.coverage) }}
                            >
                                {unit.coverage}%
                            </span>
                        </div>
                        <div className={styles.unitBar}>
                            <div
                                className={styles.unitFill}
                                style={{
                                    width: `${unit.coverage}%`,
                                    background: getColor(unit.coverage)
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Uncovered Topics Warning */}
            {coverage.uncoveredTopics?.length > 0 && (
                <div className={styles.uncovered}>
                    <div className={styles.uncoveredTitle}>
                        ⚠️ {coverage.uncoveredTopics.length} Uncovered Topics
                    </div>
                    <ul className={styles.uncoveredList}>
                        {coverage.uncoveredTopics.slice(0, 5).map((t, i) => (
                            <li key={i}>{t.name}</li>
                        ))}
                        {coverage.uncoveredTopics.length > 5 && (
                            <li className={styles.more}>
                                +{coverage.uncoveredTopics.length - 5} more...
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
