// src/app/teacher/curricula/new/page.js
"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    BookOpen,
    Upload,
    FileText,
    Loader2,
    ArrowLeft,
    Check,
    Sparkles,
    Plus,
    Trash2,
    Save,
    ChevronDown,
    ChevronRight,
    Target
} from "lucide-react";
import Header from "@/components/HeaderSub";
import styles from "./NewCurriculum.module.css";

export default function NewCurriculumPage() {
    const router = useRouter();
    const fileRef = useRef(null);

    // Form state
    const [step, setStep] = useState(1);
    const [subjectName, setSubjectName] = useState("");
    const [subjectCode, setSubjectCode] = useState("");
    const [textInput, setTextInput] = useState("");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    // Extracted curriculum data for editing
    const [curriculumId, setCurriculumId] = useState(null);
    const [curriculumData, setCurriculumData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [expandedUnits, setExpandedUnits] = useState({});

    // Handle file upload
    const handleFileUpload = async (file) => {
        if (!file || !subjectName.trim()) {
            setError("Please enter a subject name first");
            return;
        }

        setUploading(true);
        setError("");

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
                setCurriculumId(data.curriculumId);
                // Fetch the full curriculum data
                const currRes = await fetch(`/api/curricula/${data.curriculumId}`);
                const currData = await currRes.json();
                if (currData.success) {
                    setCurriculumData(currData.curriculum.structured_topics);
                    setStep(3); // Go to edit step
                }
            } else {
                setError(data.error || "Upload failed");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    // Handle text submission
    const handleTextSubmit = async () => {
        if (!textInput.trim() || !subjectName.trim()) {
            setError("Please enter subject name and syllabus content");
            return;
        }

        setUploading(true);
        setError("");

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
                setCurriculumId(data.curriculumId);
                // Fetch the full curriculum data
                const currRes = await fetch(`/api/curricula/${data.curriculumId}`);
                const currData = await currRes.json();
                if (currData.success) {
                    setCurriculumData(currData.curriculum.structured_topics);
                    setStep(3); // Go to edit step
                }
            } else {
                setError(data.error || "Processing failed");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError("Processing failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    // ===== EDITING FUNCTIONS =====

    // Toggle unit expansion
    const toggleUnit = (unitId) => {
        setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
    };

    // Update unit name
    const updateUnitName = (unitIndex, name) => {
        setCurriculumData(prev => ({
            ...prev,
            units: prev.units.map((u, i) => i === unitIndex ? { ...u, name } : u)
        }));
    };

    // Update unit weight
    const updateUnitWeight = (unitIndex, weight) => {
        setCurriculumData(prev => ({
            ...prev,
            units: prev.units.map((u, i) => i === unitIndex ? { ...u, weight: parseInt(weight) || 0 } : u)
        }));
    };

    // Add unit
    const addUnit = () => {
        const newUnit = {
            id: `unit-${Date.now()}`,
            name: `Unit ${(curriculumData?.units?.length || 0) + 1}`,
            weight: 0,
            topics: [],
            mappedCOs: []
        };
        setCurriculumData(prev => ({
            ...prev,
            units: [...(prev.units || []), newUnit]
        }));
        setExpandedUnits(prev => ({ ...prev, [newUnit.id]: true }));
    };

    // Delete unit
    const deleteUnit = (unitIndex) => {
        setCurriculumData(prev => ({
            ...prev,
            units: prev.units.filter((_, i) => i !== unitIndex)
        }));
    };

    // Update topic name
    const updateTopicName = (unitIndex, topicIndex, name) => {
        setCurriculumData(prev => ({
            ...prev,
            units: prev.units.map((u, ui) =>
                ui === unitIndex
                    ? { ...u, topics: u.topics.map((t, ti) => ti === topicIndex ? { ...t, name } : t) }
                    : u
            )
        }));
    };

    // Add topic
    const addTopic = (unitIndex) => {
        const newTopic = {
            id: `topic-${Date.now()}`,
            name: ""
        };
        setCurriculumData(prev => ({
            ...prev,
            units: prev.units.map((u, i) =>
                i === unitIndex
                    ? { ...u, topics: [...(u.topics || []), newTopic] }
                    : u
            )
        }));
    };

    // Delete topic
    const deleteTopic = (unitIndex, topicIndex) => {
        setCurriculumData(prev => ({
            ...prev,
            units: prev.units.map((u, ui) =>
                ui === unitIndex
                    ? { ...u, topics: u.topics.filter((_, ti) => ti !== topicIndex) }
                    : u
            )
        }));
    };

    // ===== CO FUNCTIONS =====

    // Add CO
    const addCO = () => {
        const newCO = {
            id: `co-${Date.now()}`,
            code: `CO${(curriculumData?.courseOutcomes?.length || 0) + 1}`,
            description: ""
        };
        setCurriculumData(prev => ({
            ...prev,
            courseOutcomes: [...(prev.courseOutcomes || []), newCO]
        }));
    };

    // Update CO
    const updateCO = (coIndex, field, value) => {
        setCurriculumData(prev => ({
            ...prev,
            courseOutcomes: prev.courseOutcomes.map((co, i) =>
                i === coIndex ? { ...co, [field]: value } : co
            )
        }));
    };

    // Delete CO
    const deleteCO = (coIndex) => {
        setCurriculumData(prev => ({
            ...prev,
            courseOutcomes: prev.courseOutcomes.filter((_, i) => i !== coIndex)
        }));
    };

    // Toggle CO mapping for a unit
    const toggleCOMapping = (unitIndex, coId) => {
        setCurriculumData(prev => ({
            ...prev,
            units: prev.units.map((u, ui) => {
                if (ui !== unitIndex) return u;
                const mappedCOs = u.mappedCOs || [];
                const isSelected = mappedCOs.includes(coId);
                return {
                    ...u,
                    mappedCOs: isSelected
                        ? mappedCOs.filter(id => id !== coId)
                        : [...mappedCOs, coId]
                };
            })
        }));
    };

    // Toggle CO mapping enabled
    const toggleCOMappingEnabled = (enabled) => {
        setCurriculumData(prev => ({
            ...prev,
            coMappingEnabled: enabled
        }));
    };

    // Save curriculum
    const saveCurriculum = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/curricula/${curriculumId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ structured_topics: curriculumData })
            });

            const data = await res.json();
            if (data.success) {
                setStep(4); // Success step
            } else {
                setError(data.error || "Failed to save");
            }
        } catch (err) {
            console.error("Save error:", err);
            setError("Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const canProceed = subjectName.trim().length > 0;

    // Step 4: Success view
    if (step === 4) {
        return (
            <>
                <Header />
                <div className={styles.container}>
                    <div className={styles.successCard}>
                        <div className={styles.successIcon}>
                            <Check size={48} />
                        </div>
                        <h2>Curriculum Saved!</h2>
                        <p>Your curriculum for &quot;{subjectName}&quot; has been saved successfully.</p>
                        <div className={styles.successActions}>
                            <button
                                onClick={() => router.push("/teacher/curricula")}
                                className={styles.primaryBtn}
                            >
                                View All Curricula
                            </button>
                            <button
                                onClick={() => router.push("/teacher/dashboard")}
                                className={styles.secondaryBtn}
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className={styles.container}>
                {/* Back Button */}
                <button
                    className={styles.backBtn}
                    onClick={() => router.push("/teacher/dashboard")}
                >
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                {/* Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.headerIcon}>
                        <BookOpen size={32} />
                    </div>
                    <h1>Set Curriculum</h1>
                    <p>Upload your syllabus and we&apos;ll extract units, topics, and course outcomes automatically.</p>
                </div>

                {/* Progress Steps */}
                <div className={styles.progressSteps}>
                    <div className={`${styles.stepItem} ${step >= 1 ? styles.active : ''}`}>
                        <span className={styles.stepNumber}>1</span>
                        <span className={styles.stepLabel}>Details</span>
                    </div>
                    <div className={styles.stepLine}></div>
                    <div className={`${styles.stepItem} ${step >= 2 ? styles.active : ''}`}>
                        <span className={styles.stepNumber}>2</span>
                        <span className={styles.stepLabel}>Upload</span>
                    </div>
                    <div className={styles.stepLine}></div>
                    <div className={`${styles.stepItem} ${step >= 3 ? styles.active : ''}`}>
                        <span className={styles.stepNumber}>3</span>
                        <span className={styles.stepLabel}>Edit & Save</span>
                    </div>
                </div>

                {/* Step 1: Subject Details */}
                {step === 1 && (
                    <div className={styles.card}>
                        <h3>Subject Details</h3>
                        <div className={styles.formGroup}>
                            <label>Subject Name *</label>
                            <input
                                type="text"
                                placeholder="e.g., Data Structures and Algorithms"
                                value={subjectName}
                                onChange={(e) => setSubjectName(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Subject Code (optional)</label>
                            <input
                                type="text"
                                placeholder="e.g., CS201"
                                value={subjectCode}
                                onChange={(e) => setSubjectCode(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                        <button
                            className={styles.nextBtn}
                            onClick={() => setStep(2)}
                            disabled={!canProceed}
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Step 2: Upload Content */}
                {step === 2 && (
                    <div className={styles.card}>
                        <button
                            className={styles.backStepBtn}
                            onClick={() => setStep(1)}
                        >
                            <ArrowLeft size={16} /> Back
                        </button>

                        <h3>Upload Syllabus for &quot;{subjectName}&quot;</h3>

                        {error && <div className={styles.errorMsg}>{error}</div>}

                        <div className={styles.uploadOptions}>
                            {/* File Upload */}
                            <div className={styles.uploadCard}>
                                <div className={styles.uploadIcon}>
                                    <FileText size={32} />
                                </div>
                                <h4>Upload File</h4>
                                <p>PDF, TXT, DOC, or DOCX</p>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".pdf,.txt,.doc,.docx"
                                    onChange={(e) => handleFileUpload(e.target.files[0])}
                                    hidden
                                />
                                <button
                                    className={styles.uploadBtn}
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <><Loader2 size={18} className={styles.spin} /> Processing...</>
                                    ) : (
                                        <><Upload size={18} /> Choose File</>
                                    )}
                                </button>
                            </div>

                            <div className={styles.orDivider}>
                                <span>OR</span>
                            </div>

                            {/* Text Input */}
                            <div className={styles.uploadCard}>
                                <div className={styles.uploadIcon}>
                                    <Sparkles size={32} />
                                </div>
                                <h4>Paste Content</h4>
                                <p>Paste your syllabus text below</p>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Unit 1: Introduction to Data Structures&#10;Topics: Arrays, Linked Lists, Stacks...&#10;&#10;Unit 2: Trees&#10;Topics: Binary Trees, BST..."
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    rows={6}
                                />
                                <button
                                    className={styles.processBtn}
                                    onClick={handleTextSubmit}
                                    disabled={uploading || !textInput.trim()}
                                >
                                    {uploading ? (
                                        <><Loader2 size={18} className={styles.spin} /> Processing...</>
                                    ) : (
                                        <><Sparkles size={18} /> Process with AI</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Edit Curriculum */}
                {step === 3 && curriculumData && (
                    <div className={styles.editContainer}>
                        <div className={styles.editHeader}>
                            <h3>Edit Curriculum: {subjectName}</h3>
                            <p>Review and edit the extracted content. Add or remove units, topics, and course outcomes.</p>
                        </div>

                        {error && <div className={styles.errorMsg}>{error}</div>}

                        {/* Course Outcomes Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h4><Target size={18} /> Course Outcomes</h4>
                                <button onClick={addCO} className={styles.addBtn}>
                                    <Plus size={16} /> Add CO
                                </button>
                            </div>

                            <div className={styles.coList}>
                                {curriculumData.courseOutcomes?.map((co, coIndex) => (
                                    <div key={co.id} className={styles.coItem}>
                                        <input
                                            type="text"
                                            value={co.code}
                                            onChange={(e) => updateCO(coIndex, 'code', e.target.value)}
                                            className={styles.coCode}
                                            placeholder="CO1"
                                        />
                                        <input
                                            type="text"
                                            value={co.description}
                                            onChange={(e) => updateCO(coIndex, 'description', e.target.value)}
                                            className={styles.coDesc}
                                            placeholder="Course outcome description..."
                                        />
                                        <button
                                            onClick={() => deleteCO(coIndex)}
                                            className={styles.deleteSmBtn}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {(!curriculumData.courseOutcomes || curriculumData.courseOutcomes.length === 0) && (
                                    <p className={styles.emptyText}>No course outcomes defined. Click &quot;+ Add CO&quot; to add.</p>
                                )}
                            </div>

                            {/* CO Mapping Toggle */}
                            {curriculumData.courseOutcomes?.length > 0 && (
                                <label className={styles.toggleLabel}>
                                    <input
                                        type="checkbox"
                                        checked={curriculumData.coMappingEnabled || false}
                                        onChange={(e) => toggleCOMappingEnabled(e.target.checked)}
                                    />
                                    Enable CO-Unit Mapping for Coverage Analysis
                                </label>
                            )}
                        </div>

                        {/* Units Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h4><BookOpen size={18} /> Units & Topics</h4>
                                <button onClick={addUnit} className={styles.addBtn}>
                                    <Plus size={16} /> Add Unit
                                </button>
                            </div>

                            <div className={styles.unitsList}>
                                {curriculumData.units?.map((unit, unitIndex) => (
                                    <div key={unit.id} className={styles.unitCard}>
                                        {/* Unit Header */}
                                        <div className={styles.unitHeader} onClick={() => toggleUnit(unit.id)}>
                                            <div className={styles.unitToggle}>
                                                {expandedUnits[unit.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                            </div>
                                            <input
                                                type="text"
                                                value={unit.name}
                                                onChange={(e) => updateUnitName(unitIndex, e.target.value)}
                                                className={styles.unitNameInput}
                                                placeholder="Unit name..."
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className={styles.weightBadge}>
                                                <span>Weight</span>
                                                <input
                                                    type="number"
                                                    value={unit.weight || 0}
                                                    onChange={(e) => updateUnitWeight(unitIndex, e.target.value)}
                                                    min="0"
                                                    max="100"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <span>%</span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteUnit(unitIndex); }}
                                                className={styles.deleteSmBtn}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        {/* Expanded Content */}
                                        {expandedUnits[unit.id] && (
                                            <div className={styles.unitContent}>
                                                {/* Topics */}
                                                <div className={styles.topicsSection}>
                                                    <span className={styles.topicsLabel}>Topics</span>
                                                    {unit.topics?.map((topic, topicIndex) => (
                                                        <div key={topic.id} className={styles.topicItem}>
                                                            <span className={styles.topicBullet}></span>
                                                            <input
                                                                type="text"
                                                                value={topic.name}
                                                                onChange={(e) => updateTopicName(unitIndex, topicIndex, e.target.value)}
                                                                className={styles.topicInput}
                                                                placeholder="Topic name..."
                                                            />
                                                            <button
                                                                onClick={() => deleteTopic(unitIndex, topicIndex)}
                                                                className={styles.deleteTopicBtn}
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => addTopic(unitIndex)}
                                                        className={styles.addTopicBtn}
                                                    >
                                                        + Add Topic
                                                    </button>
                                                </div>

                                                {/* CO Mapping */}
                                                {curriculumData.coMappingEnabled && curriculumData.courseOutcomes?.length > 0 && (
                                                    <div className={styles.coMapping}>
                                                        <span className={styles.coMappingLabel}>Mapped COs</span>
                                                        <div className={styles.coPills}>
                                                            {curriculumData.courseOutcomes.map(co => {
                                                                const isSelected = unit.mappedCOs?.includes(co.id);
                                                                return (
                                                                    <button
                                                                        key={co.id}
                                                                        onClick={() => toggleCOMapping(unitIndex, co.id)}
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
                                        )}
                                    </div>
                                ))}

                                {(!curriculumData.units || curriculumData.units.length === 0) && (
                                    <p className={styles.emptyText}>No units defined. Click &quot;+ Add Unit&quot; to add.</p>
                                )}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className={styles.saveActions}>
                            <button
                                onClick={saveCurriculum}
                                disabled={saving}
                                className={styles.saveBtn}
                            >
                                {saving ? (
                                    <><Loader2 size={18} className={styles.spin} /> Saving...</>
                                ) : (
                                    <><Save size={18} /> Save Curriculum</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
