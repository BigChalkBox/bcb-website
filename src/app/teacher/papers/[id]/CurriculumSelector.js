// src/app/teacher/papers/[id]/CurriculumSelector.js
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Share2, X, Users, Check, Loader2, BookOpen, Trash2, Plus, FileText, Sparkles, Edit2 } from "lucide-react";
import styles from "./CurriculumSelector.module.css";

export default function CurriculumSelector({
    paperId,
    currentCurriculumId,
    onSelect,
    subjectCode,
    subjectName
}) {
    const [curricula, setCurricula] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [textInput, setTextInput] = useState("");
    const [extractedCurriculum, setExtractedCurriculum] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const fileRef = useRef(null);

    // Share modal state
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareTargetId, setShareTargetId] = useState("");
    const [sharingCurriculum, setSharingCurriculum] = useState(null);
    const [shareLoading, setShareLoading] = useState(false);
    const [shareError, setShareError] = useState("");
    const [shareSuccess, setShareSuccess] = useState("");

    // Fetch existing curricula
    useEffect(() => {
        async function fetchCurricula() {
            try {
                const res = await fetch("/api/curricula");
                const data = await res.json();
                if (data.success) {
                    setCurricula(data.curricula || []);
                }
            } catch (err) {
                console.error("Failed to fetch curricula:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCurricula();
    }, []);

    // Handle file upload - extract but don't save yet
    const handleUpload = async (file) => {
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("subjectCode", subjectCode || "UNKNOWN");
            formData.append("subjectName", subjectName || "Unknown Subject");

            const res = await fetch("/api/curricula/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                // Show extracted data for review/edit
                setExtractedCurriculum(data.curriculum);
                setShowUpload(false);
                setEditMode(true);
            } else {
                alert(`Upload failed: ${data.error}`);
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    // Handle text paste upload
    const handleTextUpload = async () => {
        if (!textInput.trim()) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("text", textInput);
            formData.append("subjectCode", subjectCode || "UNKNOWN");
            formData.append("subjectName", subjectName || "Unknown Subject");

            const res = await fetch("/api/curricula/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                setExtractedCurriculum(data.curriculum);
                setShowUpload(false);
                setTextInput("");
                setEditMode(true);
            } else {
                alert(`Processing failed: ${data.error}`);
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Processing failed");
        } finally {
            setUploading(false);
        }
    };

    // Update unit name
    const updateUnitName = (unitIndex, newName) => {
        const updated = { ...extractedCurriculum };
        updated.structured_topics.units[unitIndex].name = newName;
        setExtractedCurriculum(updated);
    };

    // Update unit weight
    const updateUnitWeight = (unitIndex, newWeight) => {
        const updated = { ...extractedCurriculum };
        updated.structured_topics.units[unitIndex].weight = parseInt(newWeight) || 0;
        setExtractedCurriculum(updated);
    };

    // Update topic name
    const updateTopicName = (unitIndex, topicIndex, newName) => {
        const updated = { ...extractedCurriculum };
        updated.structured_topics.units[unitIndex].topics[topicIndex].name = newName;
        setExtractedCurriculum(updated);
    };

    // Update topic weight
    const updateTopicWeight = (unitIndex, topicIndex, newWeight) => {
        const updated = { ...extractedCurriculum };
        updated.structured_topics.units[unitIndex].topics[topicIndex].weight = parseInt(newWeight) || 0;
        setExtractedCurriculum(updated);
    };

    // Add new topic
    const addTopic = (unitIndex) => {
        const updated = { ...extractedCurriculum };
        const unit = updated.structured_topics.units[unitIndex];
        const newId = `u${unitIndex + 1}-t${unit.topics.length + 1}`;
        unit.topics.push({ id: newId, name: "New Topic", weight: 5 });
        setExtractedCurriculum(updated);
    };

    // Delete topic
    const deleteTopic = (unitIndex, topicIndex) => {
        const updated = { ...extractedCurriculum };
        updated.structured_topics.units[unitIndex].topics.splice(topicIndex, 1);
        setExtractedCurriculum(updated);
    };

    // Add new unit
    const addUnit = () => {
        const updated = { ...extractedCurriculum };
        const newId = `unit-${updated.structured_topics.units.length + 1}`;
        updated.structured_topics.units.push({
            id: newId,
            name: "New Unit",
            weight: 10,
            topics: [{ id: `${newId}-t1`, name: "New Topic", weight: 5 }]
        });
        setExtractedCurriculum(updated);
    };

    // Delete unit
    const deleteUnit = (unitIndex) => {
        if (!confirm("Delete this unit and all its topics?")) return;
        const updated = { ...extractedCurriculum };
        updated.structured_topics.units.splice(unitIndex, 1);
        setExtractedCurriculum(updated);
    };

    // Update CO description
    const updateCODescription = (coIndex, newDesc) => {
        const updated = { ...extractedCurriculum };
        if (!updated.structured_topics.courseOutcomes) {
            updated.structured_topics.courseOutcomes = [];
        }
        updated.structured_topics.courseOutcomes[coIndex].description = newDesc;
        setExtractedCurriculum(updated);
    };

    // Update CO code
    const updateCOCode = (coIndex, newCode) => {
        const updated = { ...extractedCurriculum };
        updated.structured_topics.courseOutcomes[coIndex].code = newCode;
        updated.structured_topics.courseOutcomes[coIndex].id = newCode;
        setExtractedCurriculum(updated);
    };

    // Add new CO
    const addCO = () => {
        const updated = { ...extractedCurriculum };
        if (!updated.structured_topics.courseOutcomes) {
            updated.structured_topics.courseOutcomes = [];
        }
        const coCount = updated.structured_topics.courseOutcomes.length + 1;
        updated.structured_topics.courseOutcomes.push({
            id: `CO${coCount}`,
            code: `CO${coCount}`,
            description: "New Course Outcome"
        });
        setExtractedCurriculum(updated);
    };

    // Delete CO
    const deleteCO = (coIndex) => {
        const updated = { ...extractedCurriculum };
        updated.structured_topics.courseOutcomes.splice(coIndex, 1);
        setExtractedCurriculum(updated);
    };

    // Update Unit's mapped COs
    const updateUnitCOMapping = (unitIndex, coId, isChecked) => {
        const updated = { ...extractedCurriculum };
        const unit = updated.structured_topics.units[unitIndex];

        if (!unit.mappedCOs) {
            unit.mappedCOs = [];
        }

        if (isChecked) {
            // Add CO if not already present
            if (!unit.mappedCOs.includes(coId)) {
                unit.mappedCOs.push(coId);
            }
        } else {
            // Remove CO
            unit.mappedCOs = unit.mappedCOs.filter(id => id !== coId);
        }

        setExtractedCurriculum(updated);
    };

    // Toggle CO mapping enabled
    const toggleCOMapping = (enabled) => {
        const updated = { ...extractedCurriculum };
        updated.structured_topics.coMappingEnabled = enabled;
        setExtractedCurriculum(updated);
    };

    // Confirm and save updated curriculum
    const confirmCurriculum = async () => {
        try {
            // Update the curriculum in database
            const res = await fetch(`/api/curricula/${extractedCurriculum.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    structured_topics: extractedCurriculum.structured_topics
                }),
            });

            // Link to paper
            await fetch(`/api/papers/${paperId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ curriculum_id: extractedCurriculum.id }),
            });

            onSelect(extractedCurriculum.id);
            setEditMode(false);
            setExtractedCurriculum(null);
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to save curriculum");
        }
    };

    // Link existing curriculum to paper
    const linkCurriculum = async (curriculumId) => {
        try {
            const res = await fetch(`/api/papers/${paperId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ curriculum_id: curriculumId }),
            });

            if (res.ok) {
                onSelect(curriculumId);
            }
        } catch (err) {
            console.error("Link error:", err);
        }
    };

    // Edit an existing curriculum
    const editExistingCurriculum = (curriculum) => {
        // Load the curriculum into edit mode
        setExtractedCurriculum(curriculum);
        setEditMode(true);
    };

    // Open share modal
    const openShareModal = (curriculum) => {
        setSharingCurriculum(curriculum);
        setShareTargetId("");
        setShareError("");
        setShareSuccess("");
        setShowShareModal(true);
    };

    // Handle share submission
    const handleShare = async () => {
        if (!shareTargetId.trim()) {
            setShareError("Please enter a teacher email");
            return;
        }

        setShareLoading(true);
        setShareError("");
        setShareSuccess("");

        try {
            const res = await fetch("/api/curricula/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    curriculumId: sharingCurriculum.id,
                    targetEmail: shareTargetId.trim()
                }),
            });

            const data = await res.json();

            if (data.success) {
                setShareSuccess(data.message || "Syllabus shared successfully!");
                setShareTargetId("");
                // Close modal after a short delay
                setTimeout(() => {
                    setShowShareModal(false);
                    setSharingCurriculum(null);
                }, 1500);
            } else {
                setShareError(data.error || "Failed to share syllabus");
            }
        } catch (err) {
            console.error("Share error:", err);
            setShareError("An error occurred while sharing");
        } finally {
            setShareLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading curricula...</div>;
    }

    // Show edit view for extracted curriculum
    if (editMode && extractedCurriculum) {
        const topics = extractedCurriculum.structured_topics;
        const totalTopics = topics.units?.reduce((sum, u) => sum + (u.topics?.length || 0), 0) || 0;
        const totalCOs = topics.courseOutcomes?.length || 0;

        return (
            <div className={`${styles.container} ${styles.editModeContainer}`}>
                {/* Glassmorphism Header */}
                <div className={styles.editHeader}>
                    <h3 className={styles.editHeaderTitle}>
                        <BookOpen size={26} /> Review Extracted Curriculum
                    </h3>
                    <p className={styles.editHeaderMeta}>
                        <span className={styles.metaBadge}>📚 {topics.units?.length || 0} Units</span>
                        <span className={styles.metaBadge}>📝 {totalTopics} Topics</span>
                        {totalCOs > 0 && <span className={styles.metaBadge}>🎯 {totalCOs} COs</span>}
                    </p>
                </div>

                {/* Course Outcomes Section */}
                <div className={styles.coSection}>
                    <div className={styles.coSectionHeader}>
                        <h4 className={styles.coSectionTitle}>🎯 Course Outcomes</h4>
                        <button onClick={addCO} className={styles.addTopicModern}>+ Add CO</button>
                    </div>
                    <div className={styles.coChipsContainer}>
                        {topics.courseOutcomes?.map((co, ci) => (
                            <div key={co.id} className={styles.coChip}>
                                <input
                                    type="text"
                                    value={co.code}
                                    onChange={(e) => updateCOCode(ci, e.target.value)}
                                    className={styles.coChipCode}
                                />
                                <input
                                    type="text"
                                    value={co.description}
                                    onChange={(e) => updateCODescription(ci, e.target.value)}
                                    placeholder="Description"
                                    className={styles.coChipDesc}
                                />
                                <button onClick={() => deleteCO(ci)} className={styles.coChipDelete}>✕</button>
                            </div>
                        ))}
                        {(!topics.courseOutcomes || topics.courseOutcomes.length === 0) && (
                            <span style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>No COs defined. Click &quot;+ Add CO&quot; to add.</span>
                        )}
                    </div>
                </div>

                {/* CO Mapping Toggle */}
                {topics.courseOutcomes?.length > 0 && (
                    <div className={`${styles.coToggleBar} ${topics.coMappingEnabled ? styles.coToggleBarEnabled : ''}`}>
                        <label className={styles.coToggleLabel}>
                            <input
                                type="checkbox"
                                checked={topics.coMappingEnabled || false}
                                onChange={(e) => toggleCOMapping(e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#16a34a' }}
                            />
                            {topics.coMappingEnabled ? '✓ CO Analysis Enabled' : 'Enable CO Analysis for Coverage Reports'}
                        </label>
                    </div>
                )}

                {/* Units Section Header */}
                <div className={styles.coSectionHeader} style={{ marginBottom: '16px' }}>
                    <h4 className={styles.coSectionTitle}>📚 Units & Topics</h4>
                </div>

                {/* Units List */}
                <div className={styles.unitsContainer}>
                    {topics.units?.map((unit, ui) => (
                        <div key={unit.id} className={styles.floatingCard}>
                            {/* Unit Header */}
                            <div className={styles.unitCardHeader}>
                                <input
                                    type="text"
                                    value={unit.name}
                                    onChange={(e) => updateUnitName(ui, e.target.value)}
                                    className={styles.unitNameLarge}
                                    placeholder="Unit name..."
                                />
                                <div className={styles.weightBadge}>
                                    <span>Weight</span>
                                    <input
                                        type="number"
                                        value={unit.weight || 0}
                                        onChange={(e) => updateUnitWeight(ui, e.target.value)}
                                        min="0" max="100"
                                    />
                                    <span>%</span>
                                </div>
                                <button onClick={() => deleteUnit(ui)} className={styles.deleteBtn} title="Delete unit">
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Topics Area */}
                            <div className={styles.topicsArea}>
                                {unit.topics?.map((topic, ti) => (
                                    <div key={topic.id} className={styles.topicItemModern}>
                                        <span className={styles.topicBullet}></span>
                                        <input
                                            type="text"
                                            value={topic.name}
                                            onChange={(e) => updateTopicName(ui, ti, e.target.value)}
                                            className={styles.topicInputModern}
                                            placeholder="Topic name..."
                                        />
                                        <button onClick={() => deleteTopic(ui, ti)} className={styles.topicDeleteBtn}>✕</button>
                                    </div>
                                ))}
                                <button onClick={() => addTopic(ui)} className={styles.addTopicModern}>+ Add Topic</button>
                            </div>

                            {/* CO Mapping Footer */}
                            {topics.coMappingEnabled && topics.courseOutcomes?.length > 0 && (
                                <div className={styles.coMappingFooter}>
                                    <span className={styles.coMappingLabel}>Mapped COs</span>
                                    <div className={styles.coPillContainer}>
                                        {topics.courseOutcomes?.map(co => {
                                            const isSelected = unit.mappedCOs?.includes(co.id) || unit.mappedCOs?.includes(co.code);
                                            return (
                                                <button
                                                    key={co.id}
                                                    onClick={() => updateUnitCOMapping(ui, co.id, !isSelected)}
                                                    className={`${styles.coPill} ${isSelected ? styles.coPillActive : ''}`}
                                                >
                                                    {isSelected && '✓ '}{co.code}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    <button onClick={addUnit} className={styles.addUnitCTA}>
                        + Add New Unit
                    </button>
                </div>

                {/* Action Buttons */}
                <div className={styles.editActions}>
                    <button
                        onClick={() => {
                            setEditMode(false);
                            setExtractedCurriculum(null);
                        }}
                        className={styles.cancelBtn}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmCurriculum}
                        className={styles.confirmBtn}
                    >
                        <Check size={16} /> Confirm & Continue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={24} /> Course Curriculum
                </h3>
                <p className={styles.subtitle}>
                    Link a syllabus to analyze how well your paper covers the course
                </p>
            </div>

            {/* Current Selection */}
            {currentCurriculumId && (
                <div className={styles.currentSelection}>
                    <Check size={16} /> Curriculum linked
                    <button
                        className={styles.changeBtn}
                        onClick={() => onSelect(null)}
                    >
                        Change
                    </button>
                </div>
            )}

            {/* Existing Curricula */}
            {!currentCurriculumId && curricula.length > 0 && (
                <div className={styles.section}>
                    <label className={styles.label}>Select Existing Curriculum</label>
                    <div className={styles.curriculaList}>
                        {curricula.map(c => (
                            <div key={c.id} className={styles.curriculumRow}>
                                <button
                                    className={styles.curriculumItem}
                                    onClick={() => linkCurriculum(c.id)}
                                >
                                    <span className={styles.curriculumName}>{c.subject_name}</span>
                                    <span className={styles.curriculumCode}>{c.subject_code}</span>
                                    <span className={styles.topicCount}>
                                        {c.structured_topics?.units?.length || 0} units
                                    </span>
                                    {/* Shared By Badge */}
                                    {c.sharedBy && (
                                        <span className={styles.sharedByBadge}>
                                            <Users size={12} />
                                            Shared by {c.sharedBy}
                                        </span>
                                    )}
                                </button>

                                {/* Share Button - only for owned curricula */}
                                {c.isOwner && (
                                    <button
                                        className={styles.shareBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openShareModal(c);
                                        }}
                                        title="Share this syllabus"
                                    >
                                        <Share2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {!currentCurriculumId && (
                <button
                    className={styles.skipBtn}
                    onClick={() => onSelect("skip")}
                >
                    Skip — analyze without curriculum
                </button>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className={styles.modalOverlay} onClick={() => setShowShareModal(false)}>
                    <div className={styles.shareModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h4><Share2 size={18} /> Share Syllabus</h4>
                            <button
                                className={styles.modalCloseBtn}
                                onClick={() => setShowShareModal(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <p className={styles.modalSubtitle}>
                                Share &quot;<strong>{sharingCurriculum?.subject_name}</strong>&quot; with another teacher
                            </p>

                            <label className={styles.modalLabel}>
                                Teacher Email Address
                            </label>
                            <input
                                type="email"
                                className={styles.modalInput}
                                placeholder="e.g., teacher@university.edu"
                                value={shareTargetId}
                                onChange={(e) => setShareTargetId(e.target.value)}
                                disabled={shareLoading}
                            />

                            {shareError && (
                                <div className={styles.shareError}>{shareError}</div>
                            )}

                            {shareSuccess && (
                                <div className={styles.shareSuccess}>
                                    <Check size={16} /> {shareSuccess}
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.modalCancelBtn}
                                onClick={() => setShowShareModal(false)}
                                disabled={shareLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.modalShareBtn}
                                onClick={handleShare}
                                disabled={shareLoading || !shareTargetId.trim()}
                            >
                                {shareLoading ? (
                                    <>
                                        <Loader2 size={16} className={styles.spinner} /> Sharing...
                                    </>
                                ) : (
                                    <>
                                        <Share2 size={16} /> Share
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

