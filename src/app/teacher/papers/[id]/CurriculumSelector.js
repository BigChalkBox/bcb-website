// src/app/teacher/papers/[id]/CurriculumSelector.js
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Share2, X, Users, Check, Loader2, BookOpen, Trash2, Plus, FileText, Sparkles } from "lucide-react";
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

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={24} /> Review Extracted Curriculum
                    </h3>
                    <p className={styles.subtitle}>
                        {topics.units?.length || 0} units, {totalTopics} topics extracted. Review and edit if needed.
                    </p>
                </div>

                {/* Units List */}
                <div className={styles.unitsContainer}>
                    {topics.units?.map((unit, ui) => (
                        <div key={unit.id} className={styles.unitBlock}>
                            <div className={styles.unitHeader}>
                                <input
                                    type="text"
                                    value={unit.name}
                                    onChange={(e) => updateUnitName(ui, e.target.value)}
                                    className={styles.unitNameInput}
                                />
                                <button
                                    onClick={() => deleteUnit(ui)}
                                    className={styles.deleteBtn}
                                    title="Delete unit"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className={styles.topicsList}>
                                {unit.topics?.map((topic, ti) => (
                                    <div key={topic.id} className={styles.topicRow}>
                                        <input
                                            type="text"
                                            value={topic.name}
                                            onChange={(e) => updateTopicName(ui, ti, e.target.value)}
                                            className={styles.topicNameInput}
                                        />
                                        <input
                                            type="number"
                                            value={topic.weight}
                                            onChange={(e) => updateTopicWeight(ui, ti, e.target.value)}
                                            className={styles.weightInput}
                                            title="Weight (importance)"
                                        />
                                        <button
                                            onClick={() => deleteTopic(ui, ti)}
                                            className={styles.deleteTopicBtn}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addTopic(ui)}
                                    className={styles.addTopicBtn}
                                >
                                    + Add Topic
                                </button>
                            </div>
                        </div>
                    ))}

                    <button onClick={addUnit} className={styles.addUnitBtn}>
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

            {/* Upload New */}
            {!currentCurriculumId && (
                <div className={styles.section}>
                    <button
                        className={styles.uploadToggle}
                        onClick={() => setShowUpload(!showUpload)}
                    >
                        {showUpload ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <X size={16} /> Cancel
                            </span>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Plus size={16} /> Upload New Curriculum
                            </span>
                        )}
                    </button>

                    {showUpload && (
                        <div className={styles.uploadArea}>
                            {/* File Upload */}
                            <div className={styles.dropzone}>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".pdf,.txt,.doc,.docx"
                                    onChange={(e) => handleUpload(e.target.files[0])}
                                    hidden
                                />
                                <button
                                    className={styles.dropzoneBtn}
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Loader2 size={16} className="animate-spin" /> Extracting...
                                        </span>
                                    ) : (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FileText size={16} /> Upload PDF or TXT
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className={styles.orDivider}>— OR —</div>

                            {/* Text Paste */}
                            <textarea
                                className={styles.textInput}
                                placeholder="Paste your syllabus content here..."
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                rows={6}
                            />
                            <button
                                className={styles.processBtn}
                                onClick={handleTextUpload}
                                disabled={uploading || !textInput.trim()}
                            >
                                {uploading ? "Processing..." : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Sparkles size={16} /> Process with AI
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Skip Option */}
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
                                Share "<strong>{sharingCurriculum?.subject_name}</strong>" with another teacher
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

