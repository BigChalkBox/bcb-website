// src/app/teacher/curricula/page.js
"use client";
import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import {
    BookOpen,
    Upload,
    Share2,
    Users,
    Trash2,
    Plus,
    X,
    Check,
    Loader2,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Copy,
    ExternalLink,
    Target,
    Layers
} from "lucide-react";
import styles from "./Curricula.module.css";
import Header from "@/components/HeaderSub";

export default function CurriculaManagement() {
    const supabase = createClientComponentClient();
    const [curricula, setCurricula] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    // Upload state
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [textInput, setTextInput] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [subjectCode, setSubjectCode] = useState("");
    const fileRef = useRef(null);

    // Share modal state
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareTargetId, setShareTargetId] = useState("");
    const [sharingCurriculum, setSharingCurriculum] = useState(null);
    const [shareLoading, setShareLoading] = useState(false);
    const [shareError, setShareError] = useState("");
    const [shareSuccess, setShareSuccess] = useState("");
    const [shares, setShares] = useState([]);
    const [loadingShares, setLoadingShares] = useState(false);

    // Delete state
    const [deletingId, setDeletingId] = useState(null);

    // Copy user ID feedback
    const [copied, setCopied] = useState(false);

    // Fetch user and curricula
    useEffect(() => {
        const fetchData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setUser(authUser);

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
        };
        fetchData();
    }, [supabase]);

    // Handle file upload
    const handleUpload = async (file) => {
        if (!file || !subjectName.trim()) {
            alert("Please enter a subject name");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("subjectCode", subjectCode || "UNKNOWN");
            formData.append("subjectName", subjectName);

            const res = await fetch("/api/curricula/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                // Refresh the list
                const refreshRes = await fetch("/api/curricula");
                const refreshData = await refreshRes.json();
                if (refreshData.success) {
                    setCurricula(refreshData.curricula || []);
                }
                setShowUpload(false);
                setSubjectName("");
                setSubjectCode("");
                alert("Syllabus uploaded and processed successfully!");
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

    // Handle text upload
    const handleTextUpload = async () => {
        if (!textInput.trim() || !subjectName.trim()) {
            alert("Please enter subject name and syllabus content");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("text", textInput);
            formData.append("subjectCode", subjectCode || "UNKNOWN");
            formData.append("subjectName", subjectName);

            const res = await fetch("/api/curricula/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                const refreshRes = await fetch("/api/curricula");
                const refreshData = await refreshRes.json();
                if (refreshData.success) {
                    setCurricula(refreshData.curricula || []);
                }
                setShowUpload(false);
                setTextInput("");
                setSubjectName("");
                setSubjectCode("");
                alert("Syllabus processed successfully!");
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

    // Open share modal and fetch existing shares
    const openShareModal = async (curriculum) => {
        setSharingCurriculum(curriculum);
        setShareTargetId("");
        setShareError("");
        setShareSuccess("");
        setShares([]);
        setShowShareModal(true);

        // Fetch existing shares
        setLoadingShares(true);
        try {
            const res = await fetch(`/api/curricula/share?curriculumId=${curriculum.id}`);
            const data = await res.json();
            if (data.success) {
                setShares(data.shares || []);
            }
        } catch (err) {
            console.error("Failed to load shares:", err);
        } finally {
            setLoadingShares(false);
        }
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
                // Refresh shares list
                const refreshRes = await fetch(`/api/curricula/share?curriculumId=${sharingCurriculum.id}`);
                const refreshData = await refreshRes.json();
                if (refreshData.success) {
                    setShares(refreshData.shares || []);
                }
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

    // Delete a curriculum
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this syllabus? This cannot be undone.")) {
            return;
        }

        setDeletingId(id);
        try {
            const res = await fetch(`/api/curricula?id=${id}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (data.success) {
                setCurricula(prev => prev.filter(c => c.id !== id));
            } else {
                alert(data.error || "Failed to delete");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    // Copy user email to clipboard
    const copyUserEmail = () => {
        if (user?.email) {
            navigator.clipboard.writeText(user.email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Toggle expanded view
    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
        // Reset full expand when collapsing
        if (expandedId === id) {
            setFullExpandedId(null);
        }
    };

    // Toggle full expanded view
    const [fullExpandedId, setFullExpandedId] = useState(null);
    const toggleFullExpand = (id) => {
        setFullExpandedId(fullExpandedId === id ? null : id);
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className={styles.container}>
                    <div className={styles.loading}>
                        <Loader2 className={styles.spinner} size={32} />
                        <p>Loading curricula...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className={styles.container}>
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.headerLeft}>
                        <h1><BookOpen size={28} /> Manage Curricula</h1>
                        <p>Upload, manage, and share your course syllabi with other teachers</p>
                    </div>
                    <button
                        className={styles.uploadBtn}
                        onClick={() => setShowUpload(!showUpload)}
                    >
                        {showUpload ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Add New Syllabus</>}
                    </button>
                </div>

                {/* Your Email Card */}
                <div className={styles.userIdCard}>
                    <div className={styles.userIdInfo}>
                        <span className={styles.userIdLabel}>Your Email (others can share syllabi with you using this):</span>
                        <code className={styles.userIdValue}>{user?.email || "Not logged in"}</code>
                    </div>
                    <button className={styles.copyBtn} onClick={copyUserEmail}>
                        {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                    </button>
                </div>

                {/* Upload Section */}
                {showUpload && (
                    <div className={styles.uploadSection}>
                        <h3><Upload size={20} /> Upload New Syllabus</h3>

                        <div className={styles.uploadForm}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Subject Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Data Structures"
                                        value={subjectName}
                                        onChange={(e) => setSubjectName(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Subject Code</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., CS201"
                                        value={subjectCode}
                                        onChange={(e) => setSubjectCode(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.uploadMethods}>
                                <div className={styles.fileUpload}>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept=".pdf,.txt,.doc,.docx"
                                        onChange={(e) => handleUpload(e.target.files[0])}
                                        hidden
                                    />
                                    <button
                                        className={styles.fileUploadBtn}
                                        onClick={() => fileRef.current?.click()}
                                        disabled={uploading || !subjectName.trim()}
                                    >
                                        {uploading ? <><Loader2 size={18} className={styles.spinner} /> Extracting...</> : "📄 Upload PDF or TXT"}
                                    </button>
                                </div>

                                <div className={styles.orDivider}>— OR —</div>

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
                                    disabled={uploading || !textInput.trim() || !subjectName.trim()}
                                >
                                    {uploading ? "Processing..." : "✨ Process with AI"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Curricula List */}
                <div className={styles.curriculaSection}>
                    <h2>Your Curricula ({curricula.length})</h2>

                    {curricula.length === 0 ? (
                        <div className={styles.emptyState}>
                            <BookOpen size={48} />
                            <h3>No syllabi yet</h3>
                            <p>Upload your first syllabus to get started</p>
                        </div>
                    ) : (
                        <div className={styles.curriculaGrid}>
                            {curricula.map(c => (
                                <div key={c.id} className={styles.curriculumCard}>
                                    <div className={styles.cardHeader} onClick={() => toggleExpand(c.id)}>
                                        <div className={styles.cardTitle}>
                                            {expandedId === c.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                            <h3>{c.subject_name}</h3>
                                            {c.subject_code && <span className={styles.codeTag}>{c.subject_code}</span>}
                                        </div>
                                        <div className={styles.cardBadges}>
                                            <span className={styles.unitsBadge}>
                                                {c.structured_topics?.units?.length || 0} units
                                            </span>
                                            {c.isOwner && (
                                                <span className={styles.ownerBadge}>Owner</span>
                                            )}
                                            {c.sharedBy && (
                                                <span className={styles.sharedByBadge}>
                                                    <Users size={12} /> Shared by {c.sharedBy}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {expandedId === c.id && (
                                        <div className={styles.cardExpanded}>
                                            {/* Units Preview */}
                                            <div className={styles.unitsPreview}>
                                                {c.structured_topics?.units?.slice(0, 3).map((unit, idx) => (
                                                    <div key={unit.id || idx} className={styles.unitItem}>
                                                        <strong>{unit.name}</strong>
                                                        <span>{unit.topics?.length || 0} topics</span>
                                                    </div>
                                                ))}
                                                {(c.structured_topics?.units?.length || 0) > 3 && fullExpandedId !== c.id && (
                                                    <div className={styles.moreUnits}>
                                                        + {c.structured_topics.units.length - 3} more units
                                                    </div>
                                                )}
                                            </div>

                                            {/* Expand More Button */}
                                            {fullExpandedId !== c.id ? (
                                                <button
                                                    className={styles.expandMoreBtn}
                                                    onClick={() => toggleFullExpand(c.id)}
                                                >
                                                    <ChevronDown size={16} /> Expand More
                                                </button>
                                            ) : (
                                                <>
                                                    {/* Full Expanded Content */}

                                                    {/* Course Outcomes */}
                                                    {c.structured_topics?.courseOutcomes?.length > 0 && (
                                                        <div className={styles.cosSection}>
                                                            <h4 className={styles.sectionTitle}><Target size={16} /> Course Outcomes</h4>
                                                            <div className={styles.cosList}>
                                                                {c.structured_topics.courseOutcomes.map((co, idx) => (
                                                                    <div key={co.id || idx} className={styles.coItem}>
                                                                        <span className={styles.coCode}>{co.code}</span>
                                                                        <span className={styles.coDesc}>{co.description}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* All Units & Topics */}
                                                    <div className={styles.unitsFullSection}>
                                                        <h4 className={styles.sectionTitle}><Layers size={16} /> All Units & Topics</h4>
                                                        {c.structured_topics?.units?.map((unit, idx) => (
                                                            <div key={unit.id || idx} className={styles.unitFullItem}>
                                                                <div className={styles.unitFullHeader}>
                                                                    <strong>{unit.name}</strong>
                                                                    {unit.weight > 0 && (
                                                                        <span className={styles.weightTag}>{unit.weight}%</span>
                                                                    )}
                                                                </div>
                                                                {unit.topics?.length > 0 && (
                                                                    <ul className={styles.topicsList}>
                                                                        {unit.topics.map((topic, ti) => (
                                                                            <li key={topic.id || ti}>{topic.name}</li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                                {unit.mappedCOs?.length > 0 && (
                                                                    <div className={styles.mappedCOs}>
                                                                        <span className={styles.mappedLabel}>Mapped COs:</span>
                                                                        {unit.mappedCOs.map((coId, mi) => (
                                                                            <span key={mi} className={styles.mappedCOTag}>
                                                                                {c.structured_topics.courseOutcomes?.find(co => co.id === coId)?.code || coId}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <button
                                                        className={styles.collapseBtn}
                                                        onClick={() => toggleFullExpand(c.id)}
                                                    >
                                                        <ChevronUp size={16} /> Show Less
                                                    </button>
                                                </>
                                            )}

                                            {/* Actions */}
                                            <div className={styles.cardActions}>
                                                {c.isOwner && (
                                                    <>
                                                        <button
                                                            className={styles.shareActionBtn}
                                                            onClick={() => openShareModal(c)}
                                                        >
                                                            <Share2 size={16} /> Share
                                                        </button>
                                                        <button
                                                            className={styles.deleteActionBtn}
                                                            onClick={() => handleDelete(c.id)}
                                                            disabled={deletingId === c.id}
                                                        >
                                                            {deletingId === c.id ? (
                                                                <Loader2 size={16} className={styles.spinner} />
                                                            ) : (
                                                                <Trash2 size={16} />
                                                            )}
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

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

                                {/* Existing Shares */}
                                {shares.length > 0 && (
                                    <div className={styles.existingShares}>
                                        <h5>Already shared with:</h5>
                                        <ul>
                                            {shares.map(s => (
                                                <li key={s.id}>
                                                    <Users size={14} />
                                                    {s.users?.full_name || s.users?.email || "Unknown"}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {loadingShares && (
                                    <div className={styles.loadingShares}>
                                        <Loader2 size={16} className={styles.spinner} /> Loading shares...
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
        </>
    );
}
