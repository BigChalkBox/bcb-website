// src/app/teacher/papers/[id]/studio/page.js
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import {
    FileText,
    CheckCircle2,
    Edit,
    ClipboardList,
    Save,
    ArrowLeft,
    Loader2,
    AlertTriangle,
    Plus,
    Trash2,
    Zap,
    Sparkles,
    Wand2,
    ChevronDown,
    ChevronRight,
    Image as ImageIcon,
    X
} from "lucide-react";
import styles from "../review/ReviewPage.module.css";

// ============================================================
// Helpers
// ============================================================
function uuid() {
    return (crypto.randomUUID && crypto.randomUUID()) || Date.now().toString();
}

function blankSample() {
    return {
        id: uuid(),
        instructions: "",
        instructionImages: [],
        answer: "",
        answerImages: [],
        rubric: { criteria: [] },
    };
}

// SmartLatex Component
const SmartLatex = ({ children }) => {
    if (!children) return null;
    let text = String(children);
    text = text
        .replace(/\\\\n/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/\\$/g, '$')
        .replace(/\\t/g, '\t');

    return (
        <div style={{ whiteSpace: 'pre-wrap' }}>
            <Latex>{text}</Latex>
        </div>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function PaperStudioPage() {
    const { id } = useParams();
    const router = useRouter();

    const [paper, setPaper] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [expandedQuestions, setExpandedQuestions] = useState({});
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);

    // Bulk Generation State
    const [bulkGenExpanded, setBulkGenExpanded] = useState(false);
    const [bulkInstruction, setBulkInstruction] = useState("");
    const [bulkGenerating, setBulkGenerating] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

    // Bulk Rubric Generation State
    const [bulkRubricInstruction, setBulkRubricInstruction] = useState("");
    const [bulkRubricGenerating, setBulkRubricGenerating] = useState(false);
    const [bulkRubricProgress, setBulkRubricProgress] = useState({ current: 0, total: 0 });

    // Single question generation states
    const [generatingAnswer, setGeneratingAnswer] = useState({});
    const [generatingRubric, setGeneratingRubric] = useState({});

    // Toast helper
    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    // Fetch paper data
    useEffect(() => {
        async function fetchPaper() {
            try {
                const res = await fetch(`/api/papers/${id}`);
                const { success, data } = await res.json();
                if (success) {
                    setPaper(data);
                    const qs = data.paper_data?.questions || [];
                    setQuestions(qs);
                    // Auto-expand first question
                    if (qs.length > 0) {
                        setExpandedQuestions({ 0: true });
                    }
                } else {
                    setError('Failed to load paper');
                }
            } catch (e) {
                setError('Error loading paper');
            }
            setLoading(false);
        }
        fetchPaper();
    }, [id]);

    const toggleQuestion = (idx) => {
        setExpandedQuestions(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    // ============================================================
    // API CALLS & PERSISTENCE
    // ============================================================
    async function persistQuestions(newQuestions) {
        setSaving(true);
        try {
            const res = await fetch(`/api/papers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paper_data: {
                        ...paper.paper_data,
                        questions: newQuestions,
                    },
                }),
            });

            if (res.ok) {
                const result = await res.json();
                setPaper(result.data);
                showToast('success', '✅ Saved successfully!');
                return true;
            } else {
                showToast('error', 'Failed to save');
                return false;
            }
        } catch (e) {
            showToast('error', 'Error saving');
            return false;
        } finally {
            setSaving(false);
        }
    }

    // Retry helper with exponential backoff
    async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                const isLastAttempt = attempt === maxRetries - 1;
                const isRetryable =
                    error.message?.includes('503') ||
                    error.message?.includes('429') ||
                    error.message?.includes('overload') ||
                    error.message?.includes('timeout');

                if (!isRetryable || isLastAttempt) throw error;

                const delay = initialDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // ============================================================
    // QUESTION UPDATES
    // ============================================================
    const updateQuestion = (idx, field, value) => {
        setQuestions(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: value };
            return updated;
        });
    };

    // Add sample to a question
    const addSample = (qIdx) => {
        setQuestions(prev => {
            const updated = [...prev];
            const samples = [...(updated[qIdx].samples || []), blankSample()];
            updated[qIdx] = { ...updated[qIdx], samples };
            return updated;
        });
    };

    // Update a sample
    const updateSample = (qIdx, sIdx, field, value) => {
        setQuestions(prev => {
            const updated = [...prev];
            const samples = [...(updated[qIdx].samples || [])];
            samples[sIdx] = { ...samples[sIdx], [field]: value };
            updated[qIdx] = { ...updated[qIdx], samples };
            return updated;
        });
    };

    // Delete a sample
    const deleteSample = (qIdx, sIdx) => {
        if (!confirm("Remove this sample variant?")) return;
        setQuestions(prev => {
            const updated = [...prev];
            const samples = updated[qIdx].samples.filter((_, i) => i !== sIdx);
            updated[qIdx] = { ...updated[qIdx], samples };
            return updated;
        });
    };

    // Helper: Handle Image Upload for instructions
    const handleInstructionImageUpload = (e, qIdx, sIdx) => {
        const file = e.target.files?.[0];
        if (file) processImageFile(file, qIdx, sIdx);
        e.target.value = '';
    };

    // Helper: Process file (common for input and drop)
    const processImageFile = (file, qIdx, sIdx) => {
        if (!file.type.startsWith('image/')) {
            alert("Please upload an image file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            setQuestions(prev => {
                const updated = [...prev];
                const samples = [...(updated[qIdx].samples || [])];
                const currentImages = samples[sIdx].instructionImages || [];
                // Add image (limit to 3)
                if (currentImages.length >= 3) {
                    alert("Maximum 3 reference images allowed.");
                    return prev;
                }

                samples[sIdx] = {
                    ...samples[sIdx],
                    instructionImages: [...currentImages, dataUrl]
                };
                updated[qIdx] = { ...updated[qIdx], samples };
                return updated;
            });
        };
        reader.readAsDataURL(file);
    };

    // Helper: Handle Drop
    const handleImageDrop = (e, qIdx, sIdx) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) processImageFile(file, qIdx, sIdx);
    };

    // Helper: Delete Instruction Image
    const deleteInstructionImage = (qIdx, sIdx, imgIdx) => {
        setQuestions(prev => {
            const updated = [...prev];
            const samples = [...(updated[qIdx].samples || [])];
            const currentImages = samples[sIdx].instructionImages || [];

            samples[sIdx] = {
                ...samples[sIdx],
                instructionImages: currentImages.filter((_, i) => i !== imgIdx)
            };
            updated[qIdx] = { ...updated[qIdx], samples };
            return updated;
        });
    };

    // Update rubric criterion
    const updateRubricCriterion = (qIdx, sIdx, cIdx, field, value) => {
        setQuestions(prev => {
            const updated = [...prev];
            const samples = [...(updated[qIdx].samples || [])];
            const rubric = samples[sIdx].rubric || { criteria: [] };
            const criteria = [...(rubric.criteria || [])];
            criteria[cIdx] = { ...criteria[cIdx], [field]: value };
            samples[sIdx] = { ...samples[sIdx], rubric: { ...rubric, criteria } };
            updated[qIdx] = { ...updated[qIdx], samples };
            return updated;
        });
    };

    // Add rubric criterion
    const addRubricCriterion = (qIdx, sIdx) => {
        setQuestions(prev => {
            const updated = [...prev];
            const samples = [...(updated[qIdx].samples || [])];
            const rubric = samples[sIdx].rubric || { criteria: [] };
            const criteria = [...(rubric.criteria || []), { criterion: '', weight: 0 }];
            samples[sIdx] = { ...samples[sIdx], rubric: { ...rubric, criteria } };
            updated[qIdx] = { ...updated[qIdx], samples };
            return updated;
        });
    };

    // Remove rubric criterion
    const removeRubricCriterion = (qIdx, sIdx, cIdx) => {
        setQuestions(prev => {
            const updated = [...prev];
            const samples = [...(updated[qIdx].samples || [])];
            const rubric = samples[sIdx].rubric || { criteria: [] };
            const criteria = rubric.criteria.filter((_, i) => i !== cIdx);
            samples[sIdx] = { ...samples[sIdx], rubric: { ...rubric, criteria } };
            updated[qIdx] = { ...updated[qIdx], samples };
            return updated;
        });
    };

    // ============================================================
    // GENERATE ANSWER (Single Sample)
    // ============================================================
    async function generateAnswer(qIdx, sIdx) {
        const question = questions[qIdx];
        if (!question.text?.trim()) {
            alert("No question text to generate answer for.");
            return;
        }

        const key = `${qIdx}-${sIdx}`;
        setGeneratingAnswer(prev => ({ ...prev, [key]: true }));

        try {
            await retryWithBackoff(async () => {
                const res = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                        prompt: question.text,
                        instructions: questions[qIdx].samples?.[sIdx]?.instructions || "",
                        images: (questions[qIdx].samples?.[sIdx]?.instructionImages || []).map(dataUrl => ({
                            data: dataUrl,
                            mimeType: dataUrl.split(';')[0].split(':')[1]
                        })),
                        marks: question.marks || 0,
                        n: 1,
                    }),
                });

                const j = await res.json();
                if (!j.success) throw new Error(j.error || "Generation failed");

                // Extract answer
                const extractAnswer = (ans) => {
                    if (typeof ans !== 'string') return String(ans);
                    let text = ans;
                    try {
                        if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
                            const parsed = JSON.parse(text);
                            text = parsed.answer1 || parsed.answer2 || parsed.answer ||
                                parsed.content || parsed.text || Object.values(parsed)[0] || text;
                        }
                    } catch (e) { }
                    return text.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
                };

                if (j.samples?.length > 0) {
                    let answer = "";
                    const s = j.samples[0];
                    if (typeof s === "string") {
                        answer = extractAnswer(s);
                    } else if (typeof s === "object") {
                        answer = extractAnswer(Object.values(s)[0]);
                    }
                    updateSample(qIdx, sIdx, 'answer', answer);
                }
            });

            showToast('success', '✅ Answer generated!');
        } catch (err) {
            console.error(err);
            showToast('error', '❌ Failed to generate answer');
        } finally {
            setGeneratingAnswer(prev => ({ ...prev, [key]: false }));
        }
    }

    // ============================================================
    // GENERATE RUBRIC (Single Sample)
    // ============================================================
    async function generateRubric(qIdx, sIdx) {
        const question = questions[qIdx];
        const sample = question.samples?.[sIdx];

        if (!sample?.answer?.trim()) {
            alert("Please provide a sample answer first.");
            return;
        }

        const key = `${qIdx}-${sIdx}`;
        setGeneratingRubric(prev => ({ ...prev, [key]: true }));

        try {
            const res = await fetch(`/api/papers/${id}/questions/${question.qid || question.id}/rubric`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    sampleAnswer: sample.answer,
                    maxMarks: question.marks || 10,
                    questionText: question.text || "",
                    rubricInstructions: sample.rubricInstructions || "",
                }),
            });

            const j = await res.json();

            if (j.success && j.rubric && Array.isArray(j.rubric)) {
                const criteria = j.rubric.map(r => ({
                    criterion: r.criteria || r.criterion,
                    weight: r.max_marks || r.weight || 0
                }));
                updateSample(qIdx, sIdx, 'rubric', { criteria });
                showToast('success', '✅ Rubric generated!');
            } else {
                showToast('error', '❌ Failed to generate rubric');
            }
        } catch (err) {
            console.error(err);
            showToast('error', '❌ Error generating rubric');
        } finally {
            setGeneratingRubric(prev => ({ ...prev, [key]: false }));
        }
    }

    // ============================================================
    // BULK ANSWER GENERATION
    // ============================================================
    async function handleBulkGenerate() {
        if (!bulkInstruction.trim()) {
            alert("Please provide generation instructions.");
            return;
        }

        if (!confirm(`Generate sample answers for all questions with instruction: "${bulkInstruction}"?`)) {
            return;
        }

        setBulkGenerating(true);

        // Calculate total items
        let totalItems = 0;
        questions.forEach(q => {
            if (q.text?.trim()) {
                totalItems += Math.max(1, q.samples?.length || 0);
            }
        });

        setBulkProgress({ current: 0, total: totalItems });
        let currentItem = 0;
        const updatedQuestions = [...questions];

        try {
            for (let qIdx = 0; qIdx < updatedQuestions.length; qIdx++) {
                const question = updatedQuestions[qIdx];

                if (!question.text?.trim()) continue;

                if (!question.samples || question.samples.length === 0) {
                    updatedQuestions[qIdx].samples = [blankSample()];
                }

                for (let sIdx = 0; sIdx < updatedQuestions[qIdx].samples.length; sIdx++) {
                    try {
                        await retryWithBackoff(async () => {
                            const res = await fetch("/api/generate", {
                                method: "POST",
                                headers: { "content-type": "application/json" },
                                body: JSON.stringify({
                                    prompt: question.text,
                                    instructions: bulkInstruction,
                                    images: [],
                                    marks: question.marks || 0,
                                    n: 1,
                                }),
                            });

                            const j = await res.json();
                            if (!j.success) throw new Error(j.error || "Generation failed");

                            const extractAnswer = (ans) => {
                                if (typeof ans !== 'string') return String(ans);
                                let text = ans;
                                try {
                                    if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
                                        const parsed = JSON.parse(text);
                                        text = parsed.answer1 || parsed.answer2 || parsed.answer ||
                                            parsed.content || parsed.text || Object.values(parsed)[0] || text;
                                    }
                                } catch (e) { }
                                return text.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
                            };

                            if (j.samples?.length > 0) {
                                const s = j.samples[0];
                                const answer = typeof s === "string"
                                    ? extractAnswer(s)
                                    : extractAnswer(Object.values(s)[0]);
                                updatedQuestions[qIdx].samples[sIdx].answer = answer;
                            }
                        });

                        currentItem++;
                        setBulkProgress({ current: currentItem, total: totalItems });

                    } catch (err) {
                        console.error(`Error Q${qIdx + 1}, S${sIdx + 1}:`, err);
                    }
                }
            }

            setQuestions(updatedQuestions);
            showToast('success', `✅ Generated ${currentItem} answers!`);

        } catch (e) {
            console.error(e);
            showToast('error', '❌ Bulk generation error');
        } finally {
            setBulkGenerating(false);
            setBulkProgress({ current: 0, total: 0 });
        }
    }

    // ============================================================
    // BULK RUBRIC GENERATION
    // ============================================================
    async function handleBulkRubricGenerate() {
        if (!confirm("Generate rubrics for all samples with answers?")) return;

        setBulkRubricGenerating(true);

        // Count samples with answers
        let totalItems = 0;
        questions.forEach(q => {
            q.samples?.forEach(s => {
                if (s.answer?.trim()) totalItems++;
            });
        });

        setBulkRubricProgress({ current: 0, total: totalItems });
        let currentItem = 0;
        const updatedQuestions = [...questions];

        try {
            for (let qIdx = 0; qIdx < updatedQuestions.length; qIdx++) {
                const question = updatedQuestions[qIdx];

                for (let sIdx = 0; sIdx < (question.samples?.length || 0); sIdx++) {
                    const sample = question.samples[sIdx];

                    if (!sample.answer?.trim()) continue;

                    try {
                        const res = await fetch(`/api/papers/${id}/questions/${question.qid || question.id}/rubric`, {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({
                                sampleAnswer: sample.answer,
                                maxMarks: question.marks || 10,
                                questionText: question.text || "",
                                rubricInstructions: bulkRubricInstruction || "",
                            }),
                        });

                        const j = await res.json();

                        if (j.success && j.rubric && Array.isArray(j.rubric)) {
                            const criteria = j.rubric.map(r => ({
                                criterion: r.criteria || r.criterion,
                                weight: r.max_marks || r.weight || 0
                            }));
                            updatedQuestions[qIdx].samples[sIdx].rubric = { criteria };
                        }

                        currentItem++;
                        setBulkRubricProgress({ current: currentItem, total: totalItems });

                    } catch (err) {
                        console.error(`Error Q${qIdx + 1}, S${sIdx + 1}:`, err);
                    }
                }
            }

            setQuestions(updatedQuestions);
            showToast('success', `✅ Generated ${currentItem} rubrics!`);

        } catch (e) {
            console.error(e);
            showToast('error', '❌ Bulk rubric generation error');
        } finally {
            setBulkRubricGenerating(false);
            setBulkRubricProgress({ current: 0, total: 0 });
        }
    }

    // ============================================================
    // SAVE HANDLERS
    // ============================================================
    const handleSaveDraft = async () => {
        await persistQuestions(questions);
    };

    const handleFinalize = async () => {
        if (!confirm("Finalize this paper? This will mark it as ready for evaluation.")) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/papers/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paper_data: {
                        ...paper.paper_data,
                        questions: questions,
                    },
                    status: "final",
                    finalized_at: new Date().toISOString(),
                }),
            });

            if (res.ok) {
                showToast('success', '✅ Paper finalized!');
                router.push("/teacher/dashboard");
            } else {
                showToast('error', 'Error finalizing paper');
            }
        } catch (e) {
            showToast('error', 'Error finalizing');
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // RENDER
    // ============================================================
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading paper...</p>
            </div>
        );
    }

    if (error && !paper) {
        return (
            <div className={styles.emptyState}>
                <AlertTriangle size={48} />
                <p>{error}</p>
                <button className={styles.btnPrimary} onClick={() => router.push('/teacher/dashboard')}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    // Stats
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    const samplesWithAnswers = questions.reduce((sum, q) =>
        sum + (q.samples?.filter(s => s.answer?.trim())?.length || 0), 0);
    const samplesWithRubrics = questions.reduce((sum, q) =>
        sum + (q.samples?.filter(s => s.rubric?.criteria?.length > 0)?.length || 0), 0);
    const totalSamples = questions.reduce((sum, q) => sum + (q.samples?.length || 0), 0);
    const completionPercent = totalSamples > 0 ? Math.round((samplesWithAnswers / totalSamples) * 100) : 0;

    // Render a single sample card
    const renderSampleCard = (q, qIdx, sample, sIdx) => {
        const key = `${qIdx}-${sIdx}`;
        const hasAnswer = !!sample.answer?.trim();
        const hasRubric = sample.rubric?.criteria?.length > 0;
        const rubricTotal = sample.rubric?.criteria?.reduce((sum, c) => sum + (parseInt(c.weight) || 0), 0) || 0;

        return (
            <div key={sample.id || sIdx} className={styles.variantCard}>
                {/* Sample Header */}
                <div className={styles.variantHeader} style={{ cursor: 'default' }}>
                    <div className={styles.variantLeft}>
                        <span className={styles.variantTitle}>Variant {sIdx + 1}</span>
                        {hasAnswer && <span className={styles.variantCheck}>✓ Answer</span>}
                        {hasRubric && (
                            <span className={styles.variantRubric}><ClipboardList size={12} /> Rubric ({rubricTotal})</span>
                        )}
                    </div>
                    <button
                        onClick={() => deleteSample(qIdx, sIdx)}
                        style={{ padding: '4px 8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>

                {/* Sample Content */}
                <div className={styles.variantContent}>

                    {/* Custom Instructions & Images Section */}
                    <div className={styles.fieldBlock} style={{ marginBottom: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div className={styles.fieldLabel} style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                            <span>✨ AI Generation Instructions (Optional)</span>
                            <span style={{ fontSize: '11px', fontWeight: 400, color: '#94a3b8' }}>Add text or images to guide the answer</span>
                        </div>

                        <textarea
                            placeholder="e.g., 'Include a diagram description', 'Use bullet points', 'Focus on part B'..."
                            value={sample.instructions || ''}
                            onChange={(e) => updateSample(qIdx, sIdx, 'instructions', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                fontSize: '13px',
                                minHeight: '60px',
                                resize: 'vertical',
                                marginBottom: '8px'
                            }}
                        />

                        {/* Image Upload Area */}
                        <div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                                {(sample.instructionImages || []).map((img, imgIdx) => (
                                    <div key={imgIdx} style={{ position: 'relative', width: '60px', height: '60px', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                                        <img src={img} alt="Instruction" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            onClick={() => deleteInstructionImage(qIdx, sIdx, imgIdx)}
                                            style={{
                                                position: 'absolute', top: 0, right: 0,
                                                background: 'rgba(0,0,0,0.5)', color: 'white',
                                                border: 'none', width: '100%', height: '100%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}

                                {(sample.instructionImages || []).length < 3 && (
                                    <label
                                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        onDrop={(e) => handleImageDrop(e, qIdx, sIdx)}
                                        style={{
                                            width: '60px', height: '60px',
                                            border: '1px dashed #cbd5e1', borderRadius: '6px',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', background: 'white', color: '#64748b'
                                        }}
                                    >
                                        <ImageIcon size={16} />
                                        <span style={{ fontSize: '9px', marginTop: '2px' }}>Add Img</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleInstructionImageUpload(e, qIdx, sIdx)}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Answer */}
                    <div className={styles.fieldBlock}>
                        <div className={styles.fieldLabel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Sample Answer</span>
                            <button
                                onClick={() => generateAnswer(qIdx, sIdx)}
                                disabled={generatingAnswer[key]}
                                style={{
                                    padding: '4px 10px',
                                    background: generatingAnswer[key] ? '#e5e7eb' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    cursor: generatingAnswer[key] ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                {generatingAnswer[key] ? (
                                    <><Loader2 size={14} className="animate-spin" /> Generating...</>
                                ) : (
                                    <><Sparkles size={14} /> Generate</>
                                )}
                            </button>
                        </div>
                        <textarea
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                padding: '14px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                lineHeight: '1.7',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                            placeholder="Enter the sample answer..."
                            value={sample.answer || ''}
                            onChange={(e) => updateSample(qIdx, sIdx, 'answer', e.target.value)}
                        />
                    </div>

                    {/* Rubric */}
                    <div className={styles.fieldBlock}>
                        <div className={styles.fieldLabel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Rubric (Marks: {rubricTotal}/{q.marks || '-'})</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                            </div>
                        </div>
                        {/* Rubric Instructions */}
                        <div style={{ marginBottom: '10px', background: '#fffbeb', padding: '10px', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>🎯 Rubric Instructions (Optional)</span>
                                <span style={{ fontSize: '11px', fontWeight: 400, color: '#b45309' }}>Guide how the rubric is generated</span>
                            </div>
                            <textarea
                                placeholder="e.g., 'Be strict on steps', 'Include marks for diagrams', 'Focus on theoretical concepts'..."
                                value={sample.rubricInstructions || ''}
                                onChange={(e) => updateSample(qIdx, sIdx, 'rubricInstructions', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #fcd34d',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    minHeight: '50px',
                                    resize: 'vertical',
                                    background: 'white'
                                }}
                            />
                        </div>
                        <div className={styles.fieldLabel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Criteria</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => generateRubric(qIdx, sIdx)}
                                    disabled={generatingRubric[key] || !sample.answer?.trim()}
                                    style={{
                                        padding: '4px 10px',
                                        background: (generatingRubric[key] || !sample.answer?.trim()) ? '#e5e7eb' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        cursor: (generatingRubric[key] || !sample.answer?.trim()) ? 'not-allowed' : 'pointer',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    {generatingRubric[key] ? (
                                        <><Loader2 size={14} className="animate-spin" /> Generating...</>
                                    ) : (
                                        <><Wand2 size={14} /> Generate Rubric</>
                                    )}
                                </button>
                                <button
                                    onClick={() => addRubricCriterion(qIdx, sIdx)}
                                    style={{
                                        padding: '4px 10px',
                                        background: '#f0fdf4',
                                        color: '#16A34A',
                                        border: '1px solid #bbf7d0',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Plus size={14} /> Add
                                </button>
                            </div>
                        </div>

                        {(!sample.rubric?.criteria || sample.rubric.criteria.length === 0) ? (
                            <div className={styles.noVariants} style={{ padding: '16px' }}>
                                <span style={{ fontSize: '13px' }}>No rubric criteria defined</span>
                            </div>
                        ) : (
                            <div className={styles.rubricList}>
                                {sample.rubric.criteria.map((c, cIdx) => (
                                    <div key={cIdx} className={styles.rubricRow} style={{ gap: '10px' }}>
                                        <input
                                            type="text"
                                            placeholder="Criterion description..."
                                            value={c.criterion || ''}
                                            onChange={(e) => updateRubricCriterion(qIdx, sIdx, cIdx, 'criterion', e.target.value)}
                                            style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Marks"
                                            value={c.weight || ''}
                                            onChange={(e) => updateRubricCriterion(qIdx, sIdx, cIdx, 'weight', e.target.value)}
                                            style={{ width: '70px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', textAlign: 'center', fontWeight: 700 }}
                                        />
                                        <button
                                            onClick={() => removeRubricCriterion(qIdx, sIdx, cIdx)}
                                            style={{ padding: '6px 8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Render question block
    const renderQuestionBlock = (q, idx) => {
        const isExpanded = expandedQuestions[idx] ?? false;
        const samplesCount = q.samples?.length || 0;
        const answersCount = q.samples?.filter(s => s.answer?.trim())?.length || 0;
        const previewText = (q.question || q.text || "No question text").substring(0, 80);
        const questionType = q.type || 'subjective';

        // Get type badge style
        const getTypeBadge = (type) => {
            switch (type) {
                case 'objective':
                    return { bg: '#dcfce7', color: '#16a34a', label: '✓ Objective' };
                case 'case_study':
                    return { bg: '#fef3c7', color: '#d97706', label: '📋 Case Study' };
                default:
                    return { bg: '#dbeafe', color: '#2563eb', label: '📝 Subjective' };
            }
        };

        const typeBadge = getTypeBadge(questionType);

        return (
            <div key={q.qid || q.id || idx} className={`${styles.questionContainer} ${isExpanded ? styles.expanded : ''}`}>
                {/* Header */}
                <div className={styles.questionHeader} onClick={() => toggleQuestion(idx)}>
                    <div className={styles.headerLeft}>
                        <span className={styles.expandArrow}>{isExpanded ? '▼' : '▶'}</span>
                        <div className={styles.questionMeta}>
                            <span className={styles.questionNum}>Q{idx + 1}</span>
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                background: typeBadge.bg,
                                color: typeBadge.color,
                                marginRight: '6px'
                            }}>{typeBadge.label}</span>
                            <span className={styles.marksBadge}>{q.marks || '-'} marks</span>
                            {questionType === 'objective' ? (
                                q.correctAnswer ? (
                                    <span className={styles.statusComplete}><CheckCircle2 size={12} /> Answer set</span>
                                ) : (
                                    <span className={styles.statusPending}><AlertTriangle size={12} /> No answer</span>
                                )
                            ) : (
                                answersCount > 0 ? (
                                    <span className={styles.statusComplete}><CheckCircle2 size={12} /> {answersCount}/{samplesCount} variants</span>
                                ) : (
                                    <span className={styles.statusPending}><AlertTriangle size={12} /> No answers</span>
                                )
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                        {/* OR Checkbox */}
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            color: q.isOr ? '#7c3aed' : '#6b7280',
                            fontWeight: q.isOr ? 600 : 400,
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={q.isOr || false}
                                onChange={(e) => updateQuestion(idx, 'isOr', e.target.checked)}
                                style={{ accentColor: '#7c3aed' }}
                            />
                            OR
                        </label>
                        {/* Marks Input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>Marks:</span>
                            <input
                                type="number"
                                value={q.marks || ''}
                                onChange={(e) => updateQuestion(idx, 'marks', parseInt(e.target.value) || 0)}
                                style={{
                                    width: '50px',
                                    padding: '4px 6px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    fontWeight: 600
                                }}
                            />
                        </div>
                    </div>
                    {!isExpanded && (
                        <div className={styles.questionPreview}>{previewText}...</div>
                    )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className={styles.questionContent}>
                        {/* Question Text */}
                        <div className={styles.questionTextBlock}>
                            <SmartLatex>{q.question || q.text}</SmartLatex>
                        </div>

                        {/* QUESTION TYPE TOGGLE */}
                        <div style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '10px', color: '#475569' }}>
                                Question Type
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); updateQuestion(idx, 'type', 'subjective'); }}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        border: questionType === 'subjective' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                        background: questionType === 'subjective' ? '#dbeafe' : 'white',
                                        color: questionType === 'subjective' ? '#2563eb' : '#64748b'
                                    }}
                                >📝 Subjective</button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); updateQuestion(idx, 'type', 'objective'); }}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        border: questionType === 'objective' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                                        background: questionType === 'objective' ? '#dcfce7' : 'white',
                                        color: questionType === 'objective' ? '#16a34a' : '#64748b'
                                    }}
                                >✓ Objective</button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); updateQuestion(idx, 'type', 'case_study'); }}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        border: questionType === 'case_study' ? '2px solid #d97706' : '1px solid #e2e8f0',
                                        background: questionType === 'case_study' ? '#fef3c7' : 'white',
                                        color: questionType === 'case_study' ? '#d97706' : '#64748b'
                                    }}
                                >📋 Case Study</button>
                            </div>
                            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                                {questionType === 'objective'
                                    ? 'MCQ, True/False, Fill-in-blank, Short answer'
                                    : questionType === 'case_study'
                                        ? 'Main question with objective sub-parts'
                                        : 'Essay, Derivation, Proof, Long-form answers'}
                            </p>
                        </div>

                        {/* OBJECTIVE QUESTION: Correct Answer Input */}
                        {questionType === 'objective' && (
                            <div style={{
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                marginBottom: '16px'
                            }}>
                                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px', color: '#16a34a' }}>
                                    ✓ Correct Answer
                                </div>
                                <input
                                    type="text"
                                    value={q.correctAnswer || ''}
                                    onChange={(e) => updateQuestion(idx, 'correctAnswer', e.target.value)}
                                    placeholder="e.g., A, True, 42, Newton..."
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        border: '1px solid #bbf7d0',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#166534',
                                        background: 'white'
                                    }}
                                />
                                <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                                    Enter the correct answer for automatic grading
                                </p>
                                {q.options && q.options.length > 0 && (
                                    <div style={{ marginTop: '12px' }}>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Options:</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {q.options.map((opt, optIdx) => (
                                                <div key={optIdx} style={{
                                                    padding: '6px 10px',
                                                    background: opt.startsWith(q.correctAnswer) ? '#dcfce7' : 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '4px',
                                                    fontSize: '13px'
                                                }}>{opt}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CASE STUDY QUESTION: Show sub-parts */}
                        {questionType === 'case_study' && q.subParts && q.subParts.length > 0 && (
                            <div style={{
                                background: '#fffbeb',
                                border: '1px solid #fcd34d',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '16px'
                            }}>
                                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px', color: '#92400e' }}>
                                    📋 Sub-Parts ({q.subParts.length})
                                </div>
                                {q.subParts.map((sub, subIdx) => (
                                    <div key={sub.id || subIdx} style={{
                                        background: 'white',
                                        border: '1px solid #fde68a',
                                        borderRadius: '6px',
                                        padding: '12px',
                                        marginBottom: '10px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 700, color: '#92400e' }}>Part {sub.label?.toUpperCase() || String.fromCharCode(97 + subIdx).toUpperCase()}</span>
                                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{sub.marks || 0} marks</span>
                                        </div>
                                        <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                                            <SmartLatex>{sub.text || 'No sub-question text'}</SmartLatex>
                                        </div>
                                        {/* Sub-part answer display */}
                                        {(sub.type === 'objective' || !sub.type) && (
                                            <div style={{
                                                background: '#f0fdf4',
                                                padding: '8px 12px',
                                                borderRadius: '4px',
                                                fontSize: '13px'
                                            }}>
                                                <strong style={{ color: '#16a34a' }}>Correct Answer:</strong>{' '}
                                                {sub.correctAnswer || <span style={{ color: '#9ca3af' }}>Not set</span>}
                                            </div>
                                        )}
                                        {sub.type === 'subjective' && sub.samples && sub.samples.length > 0 && (
                                            <div style={{ marginTop: '8px' }}>
                                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                                    {sub.samples.filter(s => s.answer?.trim()).length}/{sub.samples.length} answer variants
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Samples Section - Only for subjective questions */}
                        {questionType !== 'objective' && questionType !== 'case_study' && (
                            <div className={styles.variantsSection}>
                                <div className={styles.variantsHeader}>
                                    <span className={styles.variantsTitle}>Answer Variants ({samplesCount})</span>
                                    <button
                                        onClick={() => addSample(idx)}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#f0fdf4',
                                            color: '#16A34A',
                                            border: '1px solid #bbf7d0',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <Plus size={14} /> Add Variant
                                    </button>
                                </div>

                                {samplesCount === 0 ? (
                                    <div className={styles.noVariants}>
                                        <span>No answer variants yet</span>
                                        <button className={styles.editBtn} onClick={() => addSample(idx)}>
                                            Add First Variant
                                        </button>
                                    </div>
                                ) : (
                                    q.samples.map((sample, sIdx) => renderSampleCard(q, idx, sample, sIdx))
                                )}
                            </div>
                        )}

                        {/* For case study: still show main-level samples if any (legacy support) */}
                        {questionType === 'case_study' && samplesCount > 0 && (
                            <div className={styles.variantsSection}>
                                <div className={styles.variantsHeader}>
                                    <span className={styles.variantsTitle}>Main Answer Variants ({samplesCount})</span>
                                    <button
                                        onClick={() => addSample(idx)}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#f0fdf4',
                                            color: '#16A34A',
                                            border: '1px solid #bbf7d0',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <Plus size={14} /> Add Variant
                                    </button>
                                </div>
                                {q.samples.map((sample, sIdx) => renderSampleCard(q, idx, sample, sIdx))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '12px 20px',
                    background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#f59e0b',
                    color: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    fontWeight: 600
                }}>
                    {toast.message}
                </div>
            )}

            {/* SIDEBAR */}
            <aside className={styles.sidebar}>
                <div className={styles.logoContainer}>
                    <div className={styles.brandName}>
                        {"DASES".split("").map((c, i) => <span key={i}>{c}</span>)}
                    </div>
                    <div className={styles.subBrand}>PAPER STUDIO</div>
                </div>
                <ul className={styles.steps}>
                    <li className={styles.completed}>0. Course Curriculum</li>
                    <li className={styles.completed}>1. Upload & Extract</li>
                    <li className={styles.active}>2. Set Answers & Rubrics</li>
                    <li>3. Review & Finalize</li>
                </ul>

                {/* Progress */}
                <div className={styles.sidebarProgress}>
                    <div className={styles.progressLabel}>Completion</div>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${completionPercent}%` }}></div>
                    </div>
                    <div className={styles.progressText}>{samplesWithAnswers}/{totalSamples} samples with answers</div>
                </div>
            </aside>

            {/* MAIN */}
            <main className={styles.main}>
                {/* Header */}
                <div className={styles.reviewHeader}>
                    <div className={styles.headerInfo}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Edit size={24} /> Paper Studio
                        </h3>
                        <div className={styles.paperTitle}>{paper?.subject_name} ({paper?.subject_code})</div>
                    </div>
                    <div className={styles.headerButtons}>
                        <button onClick={() => router.push('/teacher/dashboard')} className={styles.btnIcon}>
                            <ArrowLeft size={16} /> Back
                        </button>
                        <button onClick={handleSaveDraft} className={styles.btnIcon} disabled={saving}>
                            <Save size={16} /> Save Draft
                        </button>
                        <button onClick={() => router.push(`/teacher/papers/${id}/review`)} className={styles.btnIcon}>
                            <FileText size={16} /> Review
                        </button>
                        <button onClick={handleFinalize} className={styles.btnPrimary} disabled={saving}>
                            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={16} /> Finalize</>}
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className={styles.statsBar}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{questions.length}</span>
                        <span className={styles.statLabel}>Questions</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{totalMarks}</span>
                        <span className={styles.statLabel}>Total Marks</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{samplesWithAnswers}/{totalSamples}</span>
                        <span className={styles.statLabel}>Answers</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{samplesWithRubrics}/{totalSamples}</span>
                        <span className={styles.statLabel}>Rubrics</span>
                    </div>
                </div>

                {/* Bulk Generation Panel */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                    <div
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => setBulkGenExpanded(!bulkGenExpanded)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#7c3aed' }}>
                            <Sparkles size={18} /> AI Bulk Generation Tools
                        </div>
                        {bulkGenExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>

                    {bulkGenExpanded && (
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* Bulk Answer Generation */}
                            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}>⚡ Bulk Answer Generation</div>
                                <textarea
                                    placeholder="Instructions for AI (e.g., 'Answer in detail with examples', 'Keep answers concise')"
                                    value={bulkInstruction}
                                    onChange={(e) => setBulkInstruction(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '8px', minHeight: '60px', resize: 'vertical' }}
                                />
                                <button
                                    onClick={handleBulkGenerate}
                                    disabled={bulkGenerating}
                                    style={{
                                        padding: '8px 16px',
                                        background: bulkGenerating ? '#e5e7eb' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: bulkGenerating ? 'not-allowed' : 'pointer',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {bulkGenerating ? (
                                        <><Loader2 size={16} className="animate-spin" /> Generating {bulkProgress.current}/{bulkProgress.total}...</>
                                    ) : (
                                        <><Sparkles size={16} /> Generate All Answers</>
                                    )}
                                </button>
                            </div>

                            {/* Bulk Rubric Generation */}
                            <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                                <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}>📋 Bulk Rubric Generation</div>
                                <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '8px' }}>
                                    Generate rubrics for all samples that have answers.
                                </p>
                                <textarea
                                    placeholder="Instructions for rubric generation (e.g., 'Be strict on procedural steps', 'Focus on conceptual understanding', 'Include marks for diagrams')"
                                    value={bulkRubricInstruction}
                                    onChange={(e) => setBulkRubricInstruction(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #fcd34d', marginBottom: '8px', minHeight: '60px', resize: 'vertical', background: 'white', fontSize: '13px' }}
                                />
                                <button
                                    onClick={handleBulkRubricGenerate}
                                    disabled={bulkRubricGenerating}
                                    style={{
                                        padding: '8px 16px',
                                        background: bulkRubricGenerating ? '#e5e7eb' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: bulkRubricGenerating ? 'not-allowed' : 'pointer',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {bulkRubricGenerating ? (
                                        <><Loader2 size={16} className="animate-spin" /> Generating {bulkRubricProgress.current}/{bulkRubricProgress.total}...</>
                                    ) : (
                                        <><Wand2 size={16} /> Generate All Rubrics</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Questions */}
                {questions.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}><ClipboardList size={48} /></span>
                        <p>No questions found. Please add questions from the paper setup page first.</p>
                        <button className={styles.btnPrimary} onClick={() => router.push(`/teacher/papers/${id}`)}>
                            Go to Paper Setup
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={styles.questionsHeader}>
                            <span>All Questions ({questions.length})</span>
                            <button className={styles.expandAllBtn} onClick={() => {
                                const allExpanded = questions.every((_, i) => expandedQuestions[i]);
                                const newState = {};
                                questions.forEach((_, i) => { newState[i] = !allExpanded; });
                                setExpandedQuestions(newState);
                            }}>
                                {questions.every((_, i) => expandedQuestions[i]) ? 'Collapse All' : 'Expand All'}
                            </button>
                        </div>
                        {(() => {
                            const elements = [];
                            let i = 0;
                            while (i < questions.length) {
                                const q = questions[i];
                                // Check if this starts an OR pair
                                if (q.isOr && i + 1 < questions.length) {
                                    const q2 = questions[i + 1];
                                    // Wrap both questions in an OR container
                                    elements.push(
                                        <div key={`or-pair-${q.qid || q.id || i}`} style={{
                                            border: '2px solid #a78bfa',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            marginBottom: '16px',
                                            background: 'linear-gradient(135deg, #faf5ff, #f5f3ff)'
                                        }}>
                                            <div style={{
                                                background: '#7c3aed',
                                                color: 'white',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                display: 'inline-block',
                                                marginBottom: '12px'
                                            }}>⚡ OR Pair</div>
                                            {renderQuestionBlock(q, i)}
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '8px 0',
                                                color: '#7c3aed',
                                                fontWeight: 700,
                                                fontSize: '14px'
                                            }}>— OR —</div>
                                            {renderQuestionBlock(q2, i + 1)}
                                        </div>
                                    );
                                    i += 2; // Skip both questions
                                } else {
                                    // Regular question
                                    elements.push(renderQuestionBlock(q, i));
                                    i += 1;
                                }
                            }
                            return elements;
                        })()}
                    </>
                )}
            </main>
        </div>
    );
}
