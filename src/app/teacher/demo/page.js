"use client";
import React, { useState } from "react";
import Header from "@/components/HeaderSub";
import { FileText, CheckCircle2, Zap, Loader2, ChevronDown, ChevronRight, Upload, AlertTriangle, Download, Sparkles, ClipboardList, Edit3, BookOpen, AlertCircle, RefreshCw, HelpCircle } from "lucide-react";
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./Demo.module.css";

// --- Tooltip Component ---
const Tooltip = ({ text, children }) => (
    <span className={styles.tooltipWrapper}>
        {children}
        <span className={styles.tooltipText}>{text}</span>
    </span>
);

// --- Help Icon with Tooltip ---
const HelpTip = ({ tip }) => (
    <Tooltip text={tip}>
        <HelpCircle size={14} className={styles.helpIcon} />
    </Tooltip>
);

// --- Retry Helper Function ---
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay

async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, options);
            const json = await res.json();

            if (json.success) {
                return json;
            }

            // If not successful but not a network error, throw to trigger retry
            if (attempt < retries) {
                console.log(`Attempt ${attempt} failed: ${json.error}. Retrying in ${RETRY_DELAY * attempt}ms...`);
                await new Promise(r => setTimeout(r, RETRY_DELAY * attempt));
                continue;
            }

            // Last attempt failed
            throw new Error(json.error || "Request failed after retries");
        } catch (err) {
            if (attempt < retries) {
                console.log(`Attempt ${attempt} error: ${err.message}. Retrying in ${RETRY_DELAY * attempt}ms...`);
                await new Promise(r => setTimeout(r, RETRY_DELAY * attempt));
                continue;
            }
            throw err;
        }
    }
}

// Special version for FormData (file uploads) - returns raw response
async function fetchFormDataWithRetry(url, formData, retries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, { method: "POST", body: formData });
            const json = await res.json();

            if (json.success) {
                return json;
            }

            if (attempt < retries) {
                console.log(`Attempt ${attempt} failed: ${json.error}. Retrying in ${RETRY_DELAY * attempt}ms...`);
                await new Promise(r => setTimeout(r, RETRY_DELAY * attempt));
                continue;
            }

            throw new Error(json.error || "Request failed after retries");
        } catch (err) {
            if (attempt < retries) {
                console.log(`Attempt ${attempt} error: ${err.message}. Retrying in ${RETRY_DELAY * attempt}ms...`);
                await new Promise(r => setTimeout(r, RETRY_DELAY * attempt));
                continue;
            }
            throw err;
        }
    }
}

export default function DemoPage() {
    // --- Global State ---
    const [paperId, setPaperId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [intelligence, setIntelligence] = useState(null);
    const [sampleAnswers, setSampleAnswers] = useState({});
    const [sampleImages, setSampleImages] = useState({}); // { qid: [url1, url2, ...] }
    const [rubrics, setRubrics] = useState({});
    const [submissionId, setSubmissionId] = useState(null);
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [editingAnswer, setEditingAnswer] = useState({});

    // --- Step Visibility & Loading ---
    const [currentStep, setCurrentStep] = useState(1);
    const [stepCompleted, setStepCompleted] = useState({ 1: false, 2: false, 3: false, 4: false });
    const [loading, setLoading] = useState({ extract: false, analyze: false, generate: {}, rubric: {}, submit: false, evaluate: false });

    // --- Toast ---
    const [toast, setToast] = useState(null);
    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    // --- Step 1: Upload & Extract ---
    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading((l) => ({ ...l, extract: true }));
        try {
            const fd = new FormData();
            fd.append("file", file);
            const extractJson = await fetchFormDataWithRetry("/api/extract", fd);

            const extractedQuestions = extractJson.questions.map((q, i) => ({
                qid: q.qid || `demo-${Date.now()}-${i}`,
                text: q.text ?? "",
                marks: q.marks ?? 0,
                isOr: false,
            }));
            setQuestions(extractedQuestions);

            const paperJson = await fetchWithRetry("/api/teacher/papers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject_name: "Demo Paper",
                    subject_code: "DEMO-" + Date.now(),
                    semester: 1,
                    program: "Demo",
                    paper_data: { questions: extractedQuestions },
                }),
            });
            setPaperId(paperJson.data.id);

            setStepCompleted((s) => ({ ...s, 1: true }));
            setCurrentStep(2);
            showToast("success", `Extracted ${extractedQuestions.length} questions!`);
        } catch (err) {
            console.error(err);
            showToast("error", err.message || "Upload error");
        } finally {
            setLoading((l) => ({ ...l, extract: false }));
        }
    };

    // --- Toggle OR Question ---
    const toggleOrFlag = (qid) => {
        setQuestions((prev) =>
            prev.map((q) => (q.qid === qid ? { ...q, isOr: !q.isOr } : q))
        );
    };

    // --- Edit Question Marks ---
    const handleMarksChange = (qid, newMarks) => {
        const marks = parseInt(newMarks) || 0;
        setQuestions((prev) =>
            prev.map((q) => (q.qid === qid ? { ...q, marks } : q))
        );
    };

    // --- Helper: Get total rubric marks for a question ---
    const getRubricTotal = (qid) => {
        const criteria = rubrics[qid] || [];
        return criteria.reduce((sum, c) => sum + (parseFloat(c.max_marks) || 0), 0);
    };

    // --- Edit Rubric Criteria with validation ---
    const handleRubricChange = (qid, index, field, value) => {
        setRubrics((prev) => {
            const updated = [...(prev[qid] || [])];
            if (!updated[index]) return prev;

            if (field === "max_marks") {
                const newMarks = parseFloat(value) || 0;
                // Get question max marks
                const question = questions.find(q => q.qid === qid);
                const maxAllowed = question?.marks || 0;

                // Calculate current total excluding this row
                const otherTotal = updated.reduce((sum, c, i) =>
                    i === index ? sum : sum + (parseFloat(c.max_marks) || 0), 0
                );

                // Clamp to not exceed total
                const clampedMarks = Math.min(newMarks, maxAllowed - otherTotal);
                updated[index] = { ...updated[index], max_marks: Math.max(0, clampedMarks) };
            } else {
                updated[index] = { ...updated[index], [field]: value };
            }

            return { ...prev, [qid]: updated };
        });
    };

    // --- Add Rubric Criteria ---
    const addRubricCriteria = (qid) => {
        const question = questions.find(q => q.qid === qid);
        const remaining = (question?.marks || 0) - getRubricTotal(qid);
        if (remaining <= 0) {
            showToast("error", "No marks remaining. Adjust existing criteria first.");
            return;
        }
        setRubrics((prev) => ({
            ...prev,
            [qid]: [...(prev[qid] || []), { criteria: "", max_marks: Math.min(1, remaining) }]
        }));
    };

    // --- Remove Rubric Criteria ---
    const removeRubricCriteria = (qid, index) => {
        setRubrics((prev) => ({
            ...prev,
            [qid]: (prev[qid] || []).filter((_, i) => i !== index)
        }));
    };

    // --- Validate before continuing ---
    const validateBeforeContinue = () => {
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const qNum = i + 1;

            // Check marks
            if (q.marks <= 0) {
                showToast("error", `Q${qNum}: Marks must be greater than 0`);
                return false;
            }

            // Require rubric for every question
            if (!rubrics[q.qid] || rubrics[q.qid].length === 0) {
                showToast("error", `Q${qNum}: Rubric is required. Please generate or add a rubric.`);
                return false;
            }

            // Validate rubric if exists
            const total = getRubricTotal(q.qid);
            if (total !== q.marks) {
                showToast("error", `Q${qNum}: Rubric total (${total}) doesn't match question marks (${q.marks})`);
                return false;
            }

            const hasEmptyCriteria = rubrics[q.qid].some(c => !c.criteria.trim());
            if (hasEmptyCriteria) {
                showToast("error", `Q${qNum}: Some rubric criteria are empty`);
                return false;
            }
        }
        return true;
    };

    // --- Step 2: Analyze Quality ---
    const handleAnalyze = async () => {
        if (!paperId || questions.length === 0) return;
        setLoading((l) => ({ ...l, analyze: true }));
        try {
            const json = await fetchWithRetry(`/api/papers/${paperId}/quickpass/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questions }),
            });
            setIntelligence(json.intelligence);
            showToast("success", `Analysis complete! Warnings: ${json.total_warnings}`);
        } catch (err) {
            showToast("error", err.message);
        } finally {
            setLoading((l) => ({ ...l, analyze: false }));
        }
    };

    // --- Step 2: Generate Sample Answer ---
    const handleGenerateAnswer = async (q) => {
        setLoading((l) => ({ ...l, generate: { ...l.generate, [q.qid]: true } }));
        try {
            const json = await fetchWithRetry("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: q.text, marks: q.marks, n: 1 }),
            });
            if (json.samples?.[0]?.answer1) {
                setSampleAnswers((a) => ({ ...a, [q.qid]: json.samples[0].answer1 }));
                showToast("success", "Answer generated!");
            } else {
                throw new Error("No answer generated");
            }
        } catch (err) {
            showToast("error", err.message);
        } finally {
            setLoading((l) => ({ ...l, generate: { ...l.generate, [q.qid]: false } }));
        }
    };

    // --- Step 2: Generate Rubric ---
    const handleGenerateRubric = async (q) => {
        if (!sampleAnswers[q.qid]) {
            showToast("error", "Generate or write an answer first before generating rubric");
            return;
        }
        setLoading((l) => ({ ...l, rubric: { ...l.rubric, [q.qid]: true } }));
        try {
            const json = await fetchWithRetry(`/api/papers/${paperId}/questions/${q.qid}/rubric`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sampleAnswer: sampleAnswers[q.qid],
                    maxMarks: q.marks,
                    questionText: q.text,
                }),
            });
            setRubrics((r) => ({ ...r, [q.qid]: json.rubric }));
            showToast("success", "Rubric generated!");
        } catch (err) {
            showToast("error", err.message);
        } finally {
            setLoading((l) => ({ ...l, rubric: { ...l.rubric, [q.qid]: false } }));
        }
    };

    // --- Bulk Generate All Answers ---
    const handleBulkGenerateAnswers = async () => {
        setLoading((l) => ({ ...l, bulkAnswers: true }));
        let successCount = 0;
        for (const q of questions) {
            if (sampleAnswers[q.qid]) continue; // Skip if already has answer
            try {
                const json = await fetchWithRetry("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: q.text, marks: q.marks, n: 1 }),
                });
                if (json.samples?.[0]?.answer1) {
                    setSampleAnswers((a) => ({ ...a, [q.qid]: json.samples[0].answer1 }));
                    successCount++;
                }
            } catch (err) {
                console.error(`Failed to generate answer for ${q.qid}:`, err);
            }
        }
        setLoading((l) => ({ ...l, bulkAnswers: false }));
        showToast("success", `Generated ${successCount} answers!`);
    };

    // --- Bulk Generate All Rubrics ---
    const handleBulkGenerateRubrics = async () => {
        setLoading((l) => ({ ...l, bulkRubrics: true }));
        let successCount = 0;
        for (const q of questions) {
            if (!sampleAnswers[q.qid]) continue; // Skip if no answer
            if (rubrics[q.qid]?.length > 0) continue; // Skip if already has rubric
            try {
                const json = await fetchWithRetry(`/api/papers/${paperId}/questions/${q.qid}/rubric`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sampleAnswer: sampleAnswers[q.qid],
                        maxMarks: q.marks,
                        questionText: q.text,
                    }),
                });
                setRubrics((r) => ({ ...r, [q.qid]: json.rubric }));
                successCount++;
            } catch (err) {
                console.error(`Failed to generate rubric for ${q.qid}:`, err);
            }
        }
        setLoading((l) => ({ ...l, bulkRubrics: false }));
        showToast("success", `Generated ${successCount} rubrics!`);
    };

    // --- Manual Answer Edit ---
    const handleAnswerChange = (qid, value) => {
        setSampleAnswers((a) => ({ ...a, [qid]: value }));
    };

    // --- Sample Image Upload ---
    const handleSampleImageUpload = async (qid, e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setLoading((l) => ({ ...l, generate: { ...l.generate, [qid]: true } }));
        try {
            const uploadedUrls = [];
            for (const file of files) {
                const fd = new FormData();
                fd.append("file", file);
                fd.append("bucket", "sample-answers");
                fd.append("path", `demo/${paperId}/${qid}/${Date.now()}-${file.name}`);

                const res = await fetch("/api/upload", { method: "POST", body: fd });
                const json = await res.json();
                if (json.success && json.url) {
                    uploadedUrls.push(json.url);
                } else {
                    showToast("error", `Failed to upload ${file.name}`);
                }
            }

            setSampleImages((prev) => ({
                ...prev,
                [qid]: [...(prev[qid] || []), ...uploadedUrls]
            }));
            showToast("success", `${uploadedUrls.length} image(s) uploaded!`);
        } catch (err) {
            showToast("error", "Upload failed: " + err.message);
        } finally {
            setLoading((l) => ({ ...l, generate: { ...l.generate, [qid]: false } }));
        }
    };

    // --- Remove Sample Image ---
    const removeSampleImage = (qid, index) => {
        setSampleImages((prev) => ({
            ...prev,
            [qid]: (prev[qid] || []).filter((_, i) => i !== index)
        }));
    };

    // --- Save Step 2 and Continue ---
    const handleStep2Complete = async () => {
        if (!paperId) return;

        // Validate before proceeding
        if (!validateBeforeContinue()) return;

        setLoading((l) => ({ ...l, analyze: true }));
        try {
            // Build questions with samples, rubrics, and images
            const questionsWithSamples = questions.map((q) => ({
                ...q,
                samples: (sampleAnswers[q.qid] || sampleImages[q.qid]?.length) ? [{
                    answer: sampleAnswers[q.qid] || "",
                    answerImages: sampleImages[q.qid] || [],
                    rubric: rubrics[q.qid] ? { criteria: rubrics[q.qid] } : null
                }] : []
            }));

            // Save to database
            await fetchWithRetry(`/api/papers/${paperId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paper_data: { questions: questionsWithSamples }
                }),
            });

            showToast("success", "Questions and answers saved!");
            setStepCompleted((s) => ({ ...s, 2: true }));
            setCurrentStep(3);
        } catch (err) {
            showToast("error", "Failed to save: " + err.message);
        } finally {
            setLoading((l) => ({ ...l, analyze: false }));
        }
    };

    // --- Step 3: Submit Answer Sheet ---
    const handleSubmitAnswerSheet = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !paperId) return;

        setLoading((l) => ({ ...l, submit: true }));
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("student_name", "Demo Student");
            fd.append("enrollment_no", `DEMO-${Date.now()}`);
            fd.append("email", "demo@example.com");

            const json = await fetchFormDataWithRetry(`/api/papers/${paperId}/submissions`, fd);
            setSubmissionId(json.submission.id);
            setStepCompleted((s) => ({ ...s, 3: true }));
            setCurrentStep(4);
            showToast("success", "Answer sheet submitted!");
        } catch (err) {
            showToast("error", err.message);
        } finally {
            setLoading((l) => ({ ...l, submit: false }));
        }
    };

    // --- Step 4: Evaluate ---
    // --- Step 4: Evaluate (now includes detection step) ---
    const handleEvaluate = async () => {
        if (!submissionId || !paperId) return;
        setLoading((l) => ({ ...l, evaluate: true }));
        try {
            // Step 1: Run detection first (converts PDF pages, detects questions, creates evaluation record)
            showToast("success", "Processing PDF pages...");
            await fetchWithRetry(`/api/evaluations/${submissionId}`, {
                method: "POST",
            });

            showToast("success", "Pages detected! Starting evaluation...");

            // Step 2: Run actual evaluation
            const json = await fetchWithRetry(`/api/evaluations/${submissionId}/evaluate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paperId }),
            });
            setEvaluationResult(json);
            setStepCompleted((s) => ({ ...s, 4: true }));
            showToast("success", "Evaluation complete!");
        } catch (err) {
            showToast("error", err.message);
        } finally {
            setLoading((l) => ({ ...l, evaluate: false }));
        }
    };

    // --- Collapsible Step Component ---
    const StepHeader = ({ step, title, icon: Icon, isComplete, isActive }) => (
        <div
            className={`${styles.stepHeader} ${isActive ? styles.active : ""} ${isComplete ? styles.complete : ""}`}
            onClick={() => isComplete && setCurrentStep(step)}
        >
            <div className={styles.stepIcon}>
                {isComplete ? <CheckCircle2 size={24} className={styles.checkIcon} /> : <Icon size={24} />}
            </div>
            <h3 className={styles.stepTitle}>Step {step}: {title}</h3>
            <div className={styles.stepChevron}>
                {isActive ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
        </div>
    );

    // --- Get warnings for a specific question ---
    const getQuestionWarnings = (qid, index) => {
        if (!intelligence?.quickpass) return [];
        const warnings = [];
        const qp = intelligence.quickpass;

        // Ambiguity warnings
        qp.ambiguity?.flags?.forEach((f) => {
            if (f.qid === `Q${index + 1}`) {
                warnings.push({ type: 'ambiguity', severity: f.severity, issue: f.issue, suggestion: f.suggestion });
            }
        });

        // Marks-effort warnings
        qp.marks_effort?.warnings?.forEach((w) => {
            if (w.qid === `Q${index + 1}`) {
                warnings.push({ type: 'marks', issue: w.reason, suggestion: `Recommended: ${w.recommended_marks} marks` });
            }
        });

        // Evaluation smoothness
        qp.evaluation_smoothness?.issues?.forEach((i) => {
            if (i.qid === `Q${index + 1}`) {
                warnings.push({ type: 'smoothness', issue: i.issue, suggestion: i.risk });
            }
        });

        return warnings;
    };

    return (
        <>
            <Header />
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>
                    <Zap size={28} /> DASES Demo Workflow
                </h1>
                <p className={styles.subtitle}>Experience the complete exam evaluation pipeline in 4 simple steps</p>

                {/* Toast */}
                {toast && (
                    <div className={`${styles.toast} ${styles[toast.type]}`}>
                        <span>{toast.message}</span>
                        <button onClick={() => setToast(null)}>×</button>
                    </div>
                )}

                {/* --- STEP 1 --- */}
                <div className={styles.stepCard}>
                    <StepHeader step={1} title="Upload Question Paper" icon={Upload} isComplete={stepCompleted[1]} isActive={currentStep === 1} />
                    {currentStep === 1 && (
                        <div className={styles.stepContent}>
                            <div className={styles.uploadZone}>
                                <input type="file" accept=".pdf" onChange={handleUpload} className={styles.fileInput} disabled={loading.extract} />
                                <p>Drop your question paper PDF here or click to browse</p>
                            </div>
                            {loading.extract && (
                                <div className={styles.loadingBox}>
                                    <Loader2 className={styles.spinner} size={20} /> Extracting questions...
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- STEP 2 --- */}
                <div className={styles.stepCard}>
                    <StepHeader step={2} title="Quality Analysis & Sample Answers" icon={Sparkles} isComplete={stepCompleted[2]} isActive={currentStep === 2} />
                    {currentStep === 2 && (
                        <div className={styles.stepContent}>
                            <h4>{questions.length} Questions Extracted</h4>

                            {/* Action Buttons Row */}
                            <div className={styles.bulkActionsRow}>
                                <Tooltip text="Run AI quality analysis on the question paper">
                                    <button onClick={handleAnalyze} disabled={loading.analyze} className={styles.analyzeBtn}>
                                        {loading.analyze ? <><Loader2 className={styles.spinner} size={16} /> Analyzing...</> : <><Zap size={16} /> Analyze Quality</>}
                                    </button>
                                </Tooltip>
                                <div className={styles.bulkActionsRight}>
                                    <Tooltip text="Generate AI sample answers for all questions without answers">
                                        <button onClick={handleBulkGenerateAnswers} disabled={loading.bulkAnswers} className={styles.bulkBtn}>
                                            {loading.bulkAnswers ? <><Loader2 className={styles.spinner} size={16} /> Generating...</> : <><Sparkles size={16} /> Generate All Answers</>}
                                        </button>
                                    </Tooltip>
                                    <Tooltip text="Generate rubrics for all questions that have sample answers">
                                        <button onClick={handleBulkGenerateRubrics} disabled={loading.bulkRubrics} className={styles.bulkBtn}>
                                            {loading.bulkRubrics ? <><Loader2 className={styles.spinner} size={16} /> Generating...</> : <><BookOpen size={16} /> Generate All Rubrics</>}
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Detailed Analysis Results */}
                            {intelligence?.quickpass && (
                                <div className={styles.analysisResults}>
                                    <div className={styles.analysisHeader}>
                                        <strong>Overall Safe:</strong>
                                        <span className={intelligence.quickpass.overall_safe ? styles.safeBadge : styles.unsafeBadge}>
                                            {intelligence.quickpass.overall_safe ? "Yes" : "No"}
                                        </span>
                                    </div>

                                    {/* Ambiguity Warnings Detail */}
                                    {intelligence.quickpass.ambiguity?.flags?.length > 0 && (
                                        <div className={styles.warningSection}>
                                            <h5><AlertTriangle size={16} /> Ambiguity Warnings ({intelligence.quickpass.ambiguity.flags.length})</h5>
                                            {intelligence.quickpass.ambiguity.flags.map((flag, i) => (
                                                <div key={i} className={`${styles.warningItem} ${styles[flag.severity]}`}>
                                                    <div className={styles.warningHeader}>
                                                        <span className={styles.warningQid}>{flag.qid}</span>
                                                        <span className={`${styles.severityBadge} ${styles[flag.severity]}`}>{flag.severity}</span>
                                                    </div>
                                                    <p className={styles.warningIssue}><strong>Issue:</strong> {flag.issue}</p>
                                                    <p className={styles.warningSuggestion}><strong>Suggestion:</strong> {flag.suggestion}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* OR Conflicts */}
                                    {intelligence.quickpass.or_conflicts?.issues?.length > 0 && (
                                        <div className={styles.warningSection}>
                                            <h5><AlertCircle size={16} /> OR Question Conflicts ({intelligence.quickpass.or_conflicts.issues.length})</h5>
                                            {intelligence.quickpass.or_conflicts.issues.map((issue, i) => (
                                                <div key={i} className={styles.warningItem}>
                                                    <p><strong>Pair:</strong> {issue.pair?.join(" vs ")}</p>
                                                    <p className={styles.warningIssue}>{issue.issue}</p>
                                                    <p className={styles.warningSuggestion}><strong>Fix:</strong> {issue.recommendation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Marks-Effort Warnings */}
                                    {intelligence.quickpass.marks_effort?.warnings?.length > 0 && (
                                        <div className={styles.warningSection}>
                                            <h5><AlertTriangle size={16} /> Marks Allocation Warnings</h5>
                                            {intelligence.quickpass.marks_effort.warnings.map((w, i) => (
                                                <div key={i} className={styles.warningItem}>
                                                    <span className={styles.warningQid}>{w.qid}</span>
                                                    <p>{w.reason}</p>
                                                    <p className={styles.warningSuggestion}>Allocated: {w.allocated_marks} → Recommended: {w.recommended_marks}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Duplicates */}
                                    {intelligence.quickpass.duplicates?.pairs?.length > 0 && (
                                        <div className={styles.warningSection}>
                                            <h5><AlertCircle size={16} /> Duplicate Questions</h5>
                                            {intelligence.quickpass.duplicates.pairs.map((d, i) => (
                                                <div key={i} className={styles.warningItem}>
                                                    <p><strong>Pair:</strong> {d.pair?.join(" & ")}</p>
                                                    <p>{d.explanation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={styles.questionsList}>
                                {questions.map((q, i) => {
                                    const warnings = getQuestionWarnings(q.qid, i);
                                    const isOrPairStart = q.isOr;
                                    const isOrPairSecond = i > 0 && questions[i - 1]?.isOr;

                                    return (
                                        <div key={q.qid} className={`${styles.questionItem} ${(isOrPairStart || isOrPairSecond) ? styles.orQuestion : ''}`}>
                                            {/* OR Indicator */}
                                            {isOrPairStart && <div className={styles.orBadge}>OR Pair Start</div>}
                                            {isOrPairSecond && <div className={styles.orBadgeSecond}>OR Option</div>}

                                            <div className={styles.questionHeader}>
                                                <span className={styles.qNum}>Q{i + 1}</span>
                                                <div className={styles.marksEditor}>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={q.marks}
                                                        onChange={(e) => handleMarksChange(q.qid, e.target.value)}
                                                        className={styles.marksInput}
                                                    />
                                                    <span>marks</span>
                                                    <HelpTip tip="Set the maximum marks for this question. This is used to calculate rubric allocations." />
                                                </div>
                                            </div>

                                            {/* OR Toggle */}
                                            <label className={styles.orToggle}>
                                                <input type="checkbox" checked={q.isOr} onChange={() => toggleOrFlag(q.qid)} />
                                                Mark as &quot;OR&quot; question (pairs with next)
                                                <HelpTip tip="Enable this if students can choose between this question and the next one. Only the higher score will count toward the total." />
                                            </label>

                                            <div className={styles.qText}><Latex>{q.text}</Latex></div>

                                            {/* Action Buttons */}
                                            <div className={styles.actionButtons}>
                                                <Tooltip text="AI generates a model answer based on question and marks">
                                                    <button onClick={() => handleGenerateAnswer(q)} disabled={loading.generate[q.qid]} className={styles.generateBtn}>
                                                        {loading.generate[q.qid] ? <><Loader2 className={styles.spinner} size={14} /> Generating...</> : <><Sparkles size={14} /> Generate Answer</>}
                                                    </button>
                                                </Tooltip>
                                                <Tooltip text="Write your own sample answer or upload images">
                                                    <button onClick={() => setEditingAnswer((e) => ({ ...e, [q.qid]: !e[q.qid] }))} className={styles.editBtn}>
                                                        <Edit3 size={14} /> {editingAnswer[q.qid] ? "Hide Editor" : "Write Answer"}
                                                    </button>
                                                </Tooltip>
                                                <Tooltip text="AI creates marking criteria based on sample answer">
                                                    <button onClick={() => handleGenerateRubric(q)} disabled={loading.rubric[q.qid] || (!sampleAnswers[q.qid] && !sampleImages[q.qid]?.length)} className={styles.rubricBtn}>
                                                        {loading.rubric[q.qid] ? <><Loader2 className={styles.spinner} size={14} /> Generating...</> : <><BookOpen size={14} /> Generate Rubric</>}
                                                    </button>
                                                </Tooltip>
                                            </div>

                                            {/* Manual Answer Editor */}
                                            {editingAnswer[q.qid] && (
                                                <div className={styles.answerEditor}>
                                                    <textarea
                                                        value={sampleAnswers[q.qid] || ""}
                                                        onChange={(e) => handleAnswerChange(q.qid, e.target.value)}
                                                        placeholder="Write your sample answer here..."
                                                        className={styles.answerTextarea}
                                                        rows={6}
                                                    />

                                                    {/* Image Upload for Sample Answer */}
                                                    <div className={styles.imageUploadSection}>
                                                        <label className={styles.imageUploadLabel}>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                multiple
                                                                onChange={(e) => handleSampleImageUpload(q.qid, e)}
                                                                className={styles.hiddenInput}
                                                            />
                                                            <Upload size={14} /> Upload Answer Images
                                                        </label>
                                                        <span className={styles.imageHint}>Or upload images of handwritten answers</span>
                                                    </div>

                                                    {/* Uploaded Images Preview */}
                                                    {sampleImages[q.qid]?.length > 0 && (
                                                        <div className={styles.uploadedImages}>
                                                            {sampleImages[q.qid].map((url, idx) => (
                                                                <div key={idx} className={styles.imageThumb}>
                                                                    <img src={url} alt={`Sample ${idx + 1}`} />
                                                                    <button onClick={() => removeSampleImage(q.qid, idx)} className={styles.removeImageBtn}>×</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Sample Answer Preview */}
                                            {sampleAnswers[q.qid] && !editingAnswer[q.qid] && (
                                                <div className={styles.answerPreview}>
                                                    <strong>Sample Answer:</strong>
                                                    <div className={styles.answerText}>
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {sampleAnswers[q.qid]}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Rubric Editor */}
                                            {rubrics[q.qid] && (
                                                <div className={styles.rubricPreview}>
                                                    <strong><BookOpen size={14} /> Rubric (Editable):</strong>
                                                    <table className={styles.rubricTable}>
                                                        <thead>
                                                            <tr><th>Criteria</th><th>Marks</th><th></th></tr>
                                                        </thead>
                                                        <tbody>
                                                            {rubrics[q.qid].map((r, ri) => (
                                                                <tr key={ri}>
                                                                    <td>
                                                                        <textarea
                                                                            value={r.criteria}
                                                                            onChange={(e) => handleRubricChange(q.qid, ri, "criteria", e.target.value)}
                                                                            className={styles.rubricCriteriaInput}
                                                                            placeholder="Enter criteria..."
                                                                            rows={2}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            step="0.5"
                                                                            value={r.max_marks}
                                                                            onChange={(e) => handleRubricChange(q.qid, ri, "max_marks", e.target.value)}
                                                                            className={styles.rubricMarksInput}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <button onClick={() => removeRubricCriteria(q.qid, ri)} className={styles.removeBtn}>×</button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>

                                                    {/* Rubric Total Indicator */}
                                                    <div className={`${styles.rubricTotal} ${getRubricTotal(q.qid) === q.marks ? styles.rubricMatch : styles.rubricMismatch}`}>
                                                        Total: {getRubricTotal(q.qid)} / {q.marks} marks
                                                        {getRubricTotal(q.qid) !== q.marks && (
                                                            <span className={styles.rubricWarning}>
                                                                ({getRubricTotal(q.qid) < q.marks ? `${q.marks - getRubricTotal(q.qid)} remaining` : "Exceeds!"})
                                                            </span>
                                                        )}
                                                    </div>

                                                    <button onClick={() => addRubricCriteria(q.qid)} className={styles.addCriteriaBtn} disabled={getRubricTotal(q.qid) >= q.marks}>
                                                        + Add Criteria
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <button onClick={handleStep2Complete} disabled={loading.analyze} className={styles.continueBtn}>
                                {loading.analyze ? <><Loader2 className={styles.spinner} size={16} /> Saving...</> : "Continue to Submission →"}
                            </button>
                        </div>
                    )}
                </div>

                {/* --- STEP 3 --- */}
                <div className={styles.stepCard}>
                    <StepHeader step={3} title="Submit Answer Sheet" icon={ClipboardList} isComplete={stepCompleted[3]} isActive={currentStep === 3} />
                    {currentStep === 3 && (
                        <div className={styles.stepContent}>
                            <div className={styles.guidelines}>
                                <h4>Submission Guidelines:</h4>
                                <ul>
                                    <li>Write each answer on a new page</li>
                                    <li>Write the question number clearly at the top of each page</li>
                                    <li>Scan and upload as a single PDF file</li>
                                </ul>
                                <a href="/booklet_0001.pdf" download className={styles.downloadLink}>
                                    <Download size={16} /> Download Sample Answer Sheet Template
                                </a>
                            </div>
                            <div className={styles.uploadZone}>
                                <input type="file" accept=".pdf" onChange={handleSubmitAnswerSheet} className={styles.fileInput} disabled={loading.submit} />
                                <p>Upload your answer sheet PDF</p>
                            </div>
                            {loading.submit && (
                                <div className={styles.loadingBox}>
                                    <Loader2 className={styles.spinner} size={20} /> Submitting...
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- STEP 4 --- */}
                <div className={styles.stepCard}>
                    <StepHeader step={4} title="Evaluation & Results" icon={CheckCircle2} isComplete={stepCompleted[4]} isActive={currentStep === 4} />
                    {currentStep === 4 && (
                        <div className={styles.stepContent}>
                            {!evaluationResult ? (
                                <>
                                    <p>Your answer sheet has been submitted. Click below to start evaluation.</p>
                                    <button onClick={handleEvaluate} disabled={loading.evaluate} className={styles.evaluateBtn}>
                                        {loading.evaluate ? <><Loader2 className={styles.spinner} size={16} /> Evaluating...</> : <><Zap size={16} /> Start Evaluation</>}
                                    </button>
                                </>
                            ) : (
                                <div className={styles.resultsCard}>
                                    <CheckCircle2 size={48} className={styles.successIcon} />
                                    <h3>Evaluation Complete!</h3>

                                    {/* Calculate total score with OR handling */}
                                    {evaluationResult.savedResult?.results && (() => {
                                        const results = evaluationResult.savedResult.results;
                                        let totalObtained = 0;
                                        let totalMax = 0;
                                        const processed = new Set();

                                        for (let i = 0; i < results.length; i++) {
                                            if (processed.has(i)) continue;
                                            const r = results[i];
                                            const q = questions[i];
                                            const score = Number(r.evaluation?.suggestedScore) || 0;
                                            const marks = Number(r.marks) || 0;

                                            // Check if this is part of OR pair
                                            if (q?.isOr && i + 1 < results.length) {
                                                const nextR = results[i + 1];
                                                const nextScore = Number(nextR.evaluation?.suggestedScore) || 0;
                                                // Take max of the pair
                                                totalObtained += Math.max(score, nextScore);
                                                totalMax += marks; // Only count marks once
                                                processed.add(i);
                                                processed.add(i + 1);
                                            } else {
                                                totalObtained += score;
                                                totalMax += marks;
                                                processed.add(i);
                                            }
                                        }

                                        return (
                                            <p className={styles.scoreText}>
                                                Score: {totalObtained.toFixed(1)} / {totalMax}
                                            </p>
                                        );
                                    })()}

                                    {/* Question-by-question summary with OR grouping */}
                                    <div className={styles.questionSummary}>
                                        {evaluationResult.savedResult?.results && (() => {
                                            const results = evaluationResult.savedResult.results;
                                            const elements = [];
                                            const processed = new Set();

                                            for (let i = 0; i < results.length; i++) {
                                                if (processed.has(i)) continue;
                                                const r = results[i];
                                                const q = questions[i];
                                                const score = Number(r.evaluation?.suggestedScore) || 0;
                                                const marks = Number(r.marks) || 0;

                                                if (q?.isOr && i + 1 < results.length) {
                                                    const nextR = results[i + 1];
                                                    const nextScore = Number(nextR.evaluation?.suggestedScore) || 0;
                                                    processed.add(i);
                                                    processed.add(i + 1);

                                                    elements.push(
                                                        <div key={i} className={styles.orResultGroup}>
                                                            <div className={styles.orResultLabel}>OR</div>
                                                            <div className={styles.qResult}>
                                                                <span className={styles.qResultNum}>Q{r.qNumber}</span>
                                                                <span className={styles.qResultScore}>{score} / {marks}</span>
                                                            </div>
                                                            <div className={styles.qResult}>
                                                                <span className={styles.qResultNum}>Q{nextR.qNumber}</span>
                                                                <span className={styles.qResultScore}>{nextScore} / {marks}</span>
                                                            </div>
                                                            <div className={styles.orResultMax}>
                                                                Best: {Math.max(score, nextScore)} / {marks}
                                                            </div>
                                                        </div>
                                                    );
                                                } else {
                                                    processed.add(i);
                                                    elements.push(
                                                        <div key={i} className={styles.qResult}>
                                                            <span className={styles.qResultNum}>Q{r.qNumber}</span>
                                                            <span className={styles.qResultScore}>{score} / {marks}</span>
                                                        </div>
                                                    );
                                                }
                                            }
                                            return elements;
                                        })()}
                                    </div>

                                    {/* Link to full report */}
                                    <a
                                        href={`/reports/${submissionId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.reportLink}
                                    >
                                        <Download size={16} /> View Detailed Report
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
