// src/app/teacher/evaluations/page.js
"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import styles from "./EvaluationsPage.module.css";
import Header from "@/components/HeaderSub";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Copy, PenTool, FileText, X } from "lucide-react";

// Initialize Authenticated Supabase client (for signed URLs)
const supabase = createClientComponentClient();

export default function EvaluationsPage() {
  const [papers, setPapers] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [evaluating, setEvaluating] = useState(null);
  const [detecting, setDetecting] = useState(null);
  const [detectProgress, setDetectProgress] = useState("");
  const [loading, setLoading] = useState(true);

  // Detection Modal State
  const [showDetectModal, setShowDetectModal] = useState(false);
  const [detectConfig, setDetectConfig] = useState({ id: null, path: null, mode: 'none' });

  // Bulk Detection State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkConfig, setBulkConfig] = useState({
    paperId: null,
    paperName: '',
    submissions: [],
    batchSize: 3,
    mode: 'none'
  });
  const [bulkProgress, setBulkProgress] = useState({ running: false, current: 0, total: 0, results: [] });

  // Bulk Evaluation State
  const [showBulkEvalModal, setShowBulkEvalModal] = useState(false);
  const [bulkEvalConfig, setBulkEvalConfig] = useState({
    paperId: null,
    paperName: '',
    submissions: [],
    batchSize: 2
  });
  const [bulkEvalProgress, setBulkEvalProgress] = useState({ running: false, current: 0, total: 0, results: [] });


  // 🔹 Fetch grouped submissions (paper-wise)
  const fetchGroupedSubmissions = useCallback(async () => {
    try {
      const res = await fetch("/api/evaluations", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch");
      setPapers(json.data || []);
    } catch (err) {
      console.error("❌ Failed to load evaluations:", err);
      alert("Failed to load evaluations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroupedSubmissions();
    const interval = setInterval(() => {
      fetchGroupedSubmissions();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchGroupedSubmissions]);

  // 🔹 Toggle Paper expand/collapse
  const toggleExpand = (paperId) => {
    setExpanded((prev) => ({ ...prev, [paperId]: !prev[paperId] }));
  };

  // 🔹 Evaluate entire paper (all questions)
  const handleEvaluate = async (submissionId, paperId) => {
    setEvaluating(submissionId);
    try {
      alert("⏳ Evaluation started! This may take a few minutes depending on question count.");

      const res = await fetch(`/api/evaluations/${submissionId}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId }),
      });

      const json = await res.json();
      if (json.success) {
        alert(`✅ Evaluated successfully!\nSaved report: ${json.savedPath}`);
        await fetchGroupedSubmissions();
      } else {
        alert(`❌ Evaluation failed:\n${json.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Evaluation request failed:", err);
      alert("⚠️ Error while evaluating submission.");
    } finally {
      setEvaluating(null);
    }
  };

  // 🔍 PYTHON BACKEND PDF PROCESSING
  const runDetection = async () => {
    const { id: submissionId, path: filePath, mode: extractionMode } = detectConfig;
    if (!submissionId) return;

    setShowDetectModal(false); // Close modal

    setDetecting(submissionId);
    setDetectProgress("Queuing Python Job...");

    try {
      // Trigger Python processing via Next.js Proxy
      const res = await fetch("/api/process-pdf-python", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          extractionMode
        }),
      });

      const json = await res.json();

      if (json.success) {
        alert(`✅ Processing complete! Processed ${json.data?.length || 0} pages.`);
        await fetchGroupedSubmissions();
      } else {
        console.error("Python processing failed:", json);
        alert("❌ Processing failed: " + (json.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Detection error:", err);
      alert("Error during processing: " + err.message);
    } finally {
      setDetecting(null);
      setDetectProgress("");
    }
  };

  const handleOpenDetectModal = (id, path) => {
    setDetectConfig({ id, path, mode: 'none' });
    setShowDetectModal(true);
  };

  // 📦 BULK DETECTION - Open modal for entire paper
  const handleOpenBulkModal = (paperId, paperName, submissions) => {
    // Filter submissions that haven't been detected yet (Pending status)
    const pendingSubmissions = submissions.filter(s =>
      !s.evaluation_status || s.evaluation_status === 'Pending'
    );
    setBulkConfig({
      paperId,
      paperName,
      submissions: pendingSubmissions,
      batchSize: 3,
      mode: 'none'
    });
    setShowBulkModal(true);
  };

  // 📦 BULK DETECTION - Process submissions in batches
  const runBulkDetection = async () => {
    const { submissions, batchSize, mode } = bulkConfig;
    if (!submissions.length) {
      alert("No pending submissions to process.");
      setShowBulkModal(false);
      return;
    }

    setShowBulkModal(false);
    setBulkProgress({ running: true, current: 0, total: submissions.length, results: [] });

    let successCount = 0;
    let failCount = 0;
    const results = [];

    for (let i = 0; i < submissions.length; i += batchSize) {
      const batch = submissions.slice(i, i + batchSize);

      // Process batch concurrently
      const batchPromises = batch.map(async (s, idx) => {
        try {
          console.log(`[Bulk] Processing ${i + idx + 1}/${submissions.length}: ${s.id}`);
          const res = await fetch("/api/process-pdf-python", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ submissionId: s.id, extractionMode: mode }),
          });
          const json = await res.json();
          if (json.success) {
            successCount++;
            return { id: s.id, success: true };
          } else {
            failCount++;
            return { id: s.id, success: false, error: json.error };
          }
        } catch (err) {
          failCount++;
          return { id: s.id, success: false, error: err.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      setBulkProgress(prev => ({
        ...prev,
        current: Math.min(i + batchSize, submissions.length),
        results
      }));

      // Add a small delay between batches to avoid overwhelming the API
      if (i + batchSize < submissions.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setBulkProgress({ running: false, current: submissions.length, total: submissions.length, results });
    alert(`✅ Bulk detection complete!\n\nSuccess: ${successCount}\nFailed: ${failCount}`);
    await fetchGroupedSubmissions();
  };

  // 📊 BULK EVALUATION - Open modal for entire paper
  const handleOpenBulkEvalModal = (paperId, paperName, submissions) => {
    // Filter submissions that have been detected (or already evaluated for re-evaluation)
    const eligibleSubmissions = submissions.filter(s =>
      s.evaluation_status === 'Pages Detected' || s.evaluation_status === 'Evaluated'
    );
    setBulkEvalConfig({
      paperId,
      paperName,
      submissions: eligibleSubmissions,
      batchSize: 2
    });
    setShowBulkEvalModal(true);
  };

  // 📊 BULK EVALUATION - Process submissions in batches
  const runBulkEvaluation = async () => {
    const { submissions, batchSize, paperId } = bulkEvalConfig;
    if (!submissions.length) {
      alert("No detected submissions to evaluate.");
      setShowBulkEvalModal(false);
      return;
    }

    setShowBulkEvalModal(false);
    setBulkEvalProgress({ running: true, current: 0, total: submissions.length, results: [] });

    let successCount = 0;
    let failCount = 0;
    const results = [];

    for (let i = 0; i < submissions.length; i += batchSize) {
      const batch = submissions.slice(i, i + batchSize);

      // Process batch concurrently
      const batchPromises = batch.map(async (s, idx) => {
        try {
          console.log(`[Bulk Eval] Processing ${i + idx + 1}/${submissions.length}: ${s.id}`);
          const res = await fetch(`/api/evaluations/${s.id}/evaluate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paperId }),
          });
          const json = await res.json();
          if (json.success) {
            successCount++;
            return { id: s.id, success: true };
          } else {
            failCount++;
            return { id: s.id, success: false, error: json.error };
          }
        } catch (err) {
          failCount++;
          return { id: s.id, success: false, error: err.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      setBulkEvalProgress(prev => ({
        ...prev,
        current: Math.min(i + batchSize, submissions.length),
        results
      }));

      // Add delay between batches to avoid overwhelming the API (evaluation is heavy)
      if (i + batchSize < submissions.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setBulkEvalProgress({ running: false, current: submissions.length, total: submissions.length, results });
    alert(`✅ Bulk evaluation complete!\n\nSuccess: ${successCount}\nFailed: ${failCount}`);
    await fetchGroupedSubmissions();
  };

  if (loading) return <p>Loading evaluations...</p>;

  return (
    <>
      <Header />

      <div className={styles.container}>
        <h1>DASES Evaluation Dashboard</h1>

        {papers.length === 0 ? (
          <p>No submissions found.</p>
        ) : (
          <div className={styles.paperList}>
            {papers.map((paper, index) => (
              <div key={`${paper.paper_id}-${index}`} className={styles.paperCard}>
                <div
                  className={styles.paperHeader}
                  onClick={() => toggleExpand(paper.paper_id)}
                >
                  <div>
                    <h3>{paper.paper_name}</h3>
                    <p>
                      {paper.program || "Program"} | Sem {paper.semester || "-"} | {paper.submissions?.length || 0} submission(s)
                    </p>
                  </div>
                  <div className={styles.paperActions}>
                    <button
                      className={styles.bulkDetectBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenBulkModal(paper.paper_id, paper.paper_name, paper.submissions);
                      }}
                      disabled={bulkProgress.running || bulkEvalProgress.running}
                    >
                      {bulkProgress.running && bulkConfig.paperId === paper.paper_id
                        ? `Processing ${bulkProgress.current}/${bulkProgress.total}...`
                        : "📦 Bulk Detect"}
                    </button>
                    <button
                      className={styles.bulkEvalBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenBulkEvalModal(paper.paper_id, paper.paper_name, paper.submissions);
                      }}
                      disabled={bulkProgress.running || bulkEvalProgress.running}
                    >
                      {bulkEvalProgress.running && bulkEvalConfig.paperId === paper.paper_id
                        ? `Evaluating ${bulkEvalProgress.current}/${bulkEvalProgress.total}...`
                        : "📊 Bulk Evaluate"}
                    </button>
                    <button className={styles.toggleBtn}>
                      {expanded[paper.paper_id] ? "▲ Hide" : "▼ View Submissions"}
                    </button>
                  </div>
                </div>

                {expanded[paper.paper_id] && (
                  <table className={styles.submissionsTable}>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Enrollment</th>
                        <th>Email</th>
                        <th>File</th>
                        <th>Status</th>
                        <th>Score</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paper.submissions.map((s) => (
                        <tr key={s.id}>
                          <td>{s.student_name}</td>
                          <td>{s.enrollment_no}</td>
                          <td>{s.email}</td>
                          <td>
                            <Link
                              href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/submissions/${s.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View PDF
                            </Link>
                          </td>
                          <td
                            className={
                              s.evaluation_status === "Evaluated"
                                ? styles.statusDone
                                : s.evaluation_status === "Pages Detected"
                                  ? styles.statusDetected
                                  : styles.statusPending
                            }
                          >
                            {s.evaluation_status || "Pending"}
                          </td>
                          <td>{s.score ?? "-"}</td>
                          <td className={styles.actions}>
                            <button
                              disabled={evaluating === s.id}
                              onClick={() => handleEvaluate(s.id, paper.paper_id)}
                              className={styles.evaluateBtn}
                            >
                              {evaluating === s.id ? "Evaluating..." : "Evaluate"}
                            </button>

                            <button
                              disabled={detecting === s.id}
                              onClick={() => handleOpenDetectModal(s.id, s.file_path)}
                              className={styles.detectBtn}
                            >
                              {detecting === s.id
                                ? detectProgress || "Detecting..."
                                : "Detect Qs"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        )}
      </div>


      {/* DETECTION SETTINGS MODAL */}
      {
        showDetectModal && (
          <div className={styles.modalOverlay} onClick={() => setShowDetectModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalTitle}>
                <PenTool size={20} /> Detect Pages & Extract Text
              </div>
              <p className={styles.modalSubtitle}>Configure optional text extraction for this submission.</p>

              <div className={styles.radioGroup}>
                {/* Option 1: None */}
                <label className={`${styles.radioOption} ${detectConfig.mode === 'none' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="extraction"
                    checked={detectConfig.mode === 'none'}
                    onChange={() => setDetectConfig({ ...detectConfig, mode: 'none' })}
                    className={styles.radioInput}
                  />
                  <div>
                    <span className={styles.optionLabel}>Detection Only</span>
                    <span className={styles.optionDesc}>Only detect question numbers. Use images for evaluation. (Default)</span>
                  </div>
                </label>

                {/* Option 2: Handwritten (Gemini) */}
                <label className={`${styles.radioOption} ${detectConfig.mode === 'handwritten' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="extraction"
                    checked={detectConfig.mode === 'handwritten'}
                    onChange={() => setDetectConfig({ ...detectConfig, mode: 'handwritten' })}
                    className={styles.radioInput}
                  />
                  <div>
                    <span className={styles.optionLabel}>Handwritten Text (Gemini AI)</span>
                    <span className={styles.optionDesc}>Extract handwritten answers using Gemini OCR. Best for scanned sheets.</span>
                  </div>
                </label>

                {/* Option 3: Digital (PDF) */}
                <label className={`${styles.radioOption} ${detectConfig.mode === 'digital' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="extraction"
                    checked={detectConfig.mode === 'digital'}
                    onChange={() => setDetectConfig({ ...detectConfig, mode: 'digital' })}
                    className={styles.radioInput}
                  />
                  <div>
                    <span className={styles.optionLabel}>Digital / Typed Text</span>
                    <span className={styles.optionDesc}>Extract embedded text from digital PDFs. Best for typed submissions.</span>
                  </div>
                </label>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setShowDetectModal(false)}>Cancel</button>
                <button className={styles.startBtn} onClick={runDetection}>Start Detection</button>
              </div>
            </div>
          </div>
        )
      }

      {/* BULK DETECTION MODAL */}
      {showBulkModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBulkModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTitle}>
              📦 Bulk Detection for "{bulkConfig.paperName}"
            </div>
            <p className={styles.modalSubtitle}>
              Process {bulkConfig.submissions.length} pending submission(s) in batches.
            </p>

            {/* Batch Size Selector */}
            <div className={styles.batchSizeContainer}>
              <label htmlFor="batchSize">Batch Size: {bulkConfig.batchSize}</label>
              <input
                type="range"
                id="batchSize"
                min="1"
                max="10"
                value={bulkConfig.batchSize}
                onChange={(e) => setBulkConfig({ ...bulkConfig, batchSize: parseInt(e.target.value) })}
                className={styles.batchSlider}
              />
              <span className={styles.batchHint}>
                {Math.ceil(bulkConfig.submissions.length / bulkConfig.batchSize)} batch(es) of ~{bulkConfig.batchSize}
              </span>
            </div>

            {/* Extraction Mode - Same options as single detection */}
            <div className={styles.radioGroup}>
              <label className={`${styles.radioOption} ${bulkConfig.mode === 'none' ? styles.selected : ''}`}>
                <input
                  type="radio"
                  name="bulkExtraction"
                  checked={bulkConfig.mode === 'none'}
                  onChange={() => setBulkConfig({ ...bulkConfig, mode: 'none' })}
                  className={styles.radioInput}
                />
                <div>
                  <span className={styles.optionLabel}>Detection Only</span>
                  <span className={styles.optionDesc}>Only detect question numbers. (Default)</span>
                </div>
              </label>

              <label className={`${styles.radioOption} ${bulkConfig.mode === 'handwritten' ? styles.selected : ''}`}>
                <input
                  type="radio"
                  name="bulkExtraction"
                  checked={bulkConfig.mode === 'handwritten'}
                  onChange={() => setBulkConfig({ ...bulkConfig, mode: 'handwritten' })}
                  className={styles.radioInput}
                />
                <div>
                  <span className={styles.optionLabel}>Handwritten Text (Gemini AI)</span>
                  <span className={styles.optionDesc}>Extract handwritten answers using Gemini OCR.</span>
                </div>
              </label>

              <label className={`${styles.radioOption} ${bulkConfig.mode === 'digital' ? styles.selected : ''}`}>
                <input
                  type="radio"
                  name="bulkExtraction"
                  checked={bulkConfig.mode === 'digital'}
                  onChange={() => setBulkConfig({ ...bulkConfig, mode: 'digital' })}
                  className={styles.radioInput}
                />
                <div>
                  <span className={styles.optionLabel}>Digital / Typed Text</span>
                  <span className={styles.optionDesc}>Extract embedded text from digital PDFs.</span>
                </div>
              </label>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowBulkModal(false)}>Cancel</button>
              <button
                className={styles.startBtn}
                onClick={runBulkDetection}
                disabled={bulkConfig.submissions.length === 0}
              >
                Start Bulk Detection ({bulkConfig.submissions.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK EVALUATION MODAL */}
      {showBulkEvalModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBulkEvalModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTitle}>
              📊 Bulk Evaluation for "{bulkEvalConfig.paperName}"
            </div>
            <p className={styles.modalSubtitle}>
              Evaluate {bulkEvalConfig.submissions.length} detected submission(s) in batches.
            </p>

            {bulkEvalConfig.submissions.length === 0 ? (
              <div className={styles.warningBox}>
                ⚠️ No eligible submissions. Run detection first on pending submissions.
              </div>
            ) : (
              <>
                {/* Batch Size Selector */}
                <div className={styles.batchSizeContainer}>
                  <label htmlFor="evalBatchSize">Batch Size: {bulkEvalConfig.batchSize}</label>
                  <input
                    type="range"
                    id="evalBatchSize"
                    min="1"
                    max="5"
                    value={bulkEvalConfig.batchSize}
                    onChange={(e) => setBulkEvalConfig({ ...bulkEvalConfig, batchSize: parseInt(e.target.value) })}
                    className={styles.batchSlider}
                  />
                  <span className={styles.batchHint}>
                    {Math.ceil(bulkEvalConfig.submissions.length / bulkEvalConfig.batchSize)} batch(es) of ~{bulkEvalConfig.batchSize}
                  </span>
                  <span className={styles.batchWarning}>
                    ⚡ Evaluation is resource-intensive. Lower batch sizes recommended.
                  </span>
                </div>
              </>
            )}

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowBulkEvalModal(false)}>Cancel</button>
              <button
                className={styles.startBtn}
                onClick={runBulkEvaluation}
                disabled={bulkEvalConfig.submissions.length === 0}
              >
                Start Bulk Evaluation ({bulkEvalConfig.submissions.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
