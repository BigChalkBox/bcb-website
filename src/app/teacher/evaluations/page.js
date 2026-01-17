// src/app/teacher/evaluations/page.js
"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import styles from "./EvaluationsPage.module.css";
import Header from "@/components/HeaderSub";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for uploads
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function EvaluationsPage() {
  const [papers, setPapers] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [evaluating, setEvaluating] = useState(null);
  const [detecting, setDetecting] = useState(null);
  const [detectProgress, setDetectProgress] = useState("");
  const [loading, setLoading] = useState(true);
  const pdfJsLoaded = useRef(false);

  // Load pdf.js from CDN
  useEffect(() => {
    if (pdfJsLoaded.current) return;

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      // Set worker source
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      pdfJsLoaded.current = true;
      console.log("✅ pdf.js loaded");
    };
    document.head.appendChild(script);
  }, []);

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

  // 🔍 CLIENT-SIDE PDF to Image + Question Detection
  const handleDetect = async (submissionId, filePath) => {
    if (!confirm("Start question number detection for this submission?")) return;
    if (!pdfJsLoaded.current) {
      alert("PDF.js is still loading. Please wait a moment and try again.");
      return;
    }

    setDetecting(submissionId);
    setDetectProgress("Loading PDF...");

    try {
      // 1. Get the PDF URL
      const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/submissions/${filePath}`;
      console.log("📄 Loading PDF:", pdfUrl);

      // 2. Load PDF with pdf.js
      const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;
      console.log(`📚 PDF loaded: ${numPages} pages`);

      const results = [];

      // 3. Process each page
      for (let i = 1; i <= numPages; i++) {
        setDetectProgress(`Processing page ${i}/${numPages}...`);
        console.log(`🖼️ Processing page ${i}...`);

        // Get page
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        // Render page to canvas
        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;

        // Convert full page to blob
        const fullBlob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );

        // Crop top 25% for question detection
        const cropHeight = Math.floor(viewport.height * 0.25);
        const croppedCanvas = document.createElement("canvas");
        croppedCanvas.width = viewport.width;
        croppedCanvas.height = cropHeight;
        const croppedCtx = croppedCanvas.getContext("2d");
        croppedCtx.drawImage(
          canvas,
          0, 0, viewport.width, cropHeight,
          0, 0, viewport.width, cropHeight
        );

        // Convert cropped to base64
        const croppedBase64 = croppedCanvas.toDataURL("image/png");

        // 4. Send to API for question detection
        setDetectProgress(`Detecting Q number for page ${i}...`);
        const detectRes = await fetch("/api/detect-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: croppedBase64 }),
        });
        const detectJson = await detectRes.json();
        const questionNo = detectJson.question_no;
        console.log(`📝 Page ${i}: Q${questionNo || "?"}`);

        // 5. Upload full image to Supabase
        const qFolder = questionNo ? `q${questionNo}` : "unassigned";
        const uploadPath = `${submissionId}/${qFolder}/page_${i}.png`;

        setDetectProgress(`Uploading page ${i} to ${qFolder}...`);
        const { error: uploadErr } = await supabase.storage
          .from("submissions")
          .upload(uploadPath, fullBlob, {
            upsert: true,
            contentType: "image/png",
          });

        if (uploadErr) {
          console.error(`⚠️ Upload error (page ${i}):`, uploadErr.message);
        } else {
          console.log(`✅ Uploaded page ${i} to ${uploadPath}`);
        }

        results.push({
          page: i,
          question_no: questionNo,
          uploaded_to: uploadPath,
        });
      }

      // 6. Update evaluation status in database
      setDetectProgress("Updating database...");
      const updateRes = await fetch(`/api/evaluations/${submissionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Pages Detected",
          result: { total_pages: results.length, pages: results },
        }),
      });

      const updateJson = await updateRes.json();
      if (updateJson.success) {
        alert(`✅ Detection complete! Processed ${results.length} pages.`);
        await fetchGroupedSubmissions();
      } else {
        alert("❌ Failed to update status: " + updateJson.error);
      }
    } catch (err) {
      console.error("Detection error:", err);
      alert("Error during question detection: " + err.message);
    } finally {
      setDetecting(null);
      setDetectProgress("");
    }
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
                      {paper.program || "Program"} | Sem {paper.semester || "-"}
                    </p>
                  </div>
                  <button className={styles.toggleBtn}>
                    {expanded[paper.paper_id] ? "▲ Hide" : "▼ View Submissions"}
                  </button>
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
                              onClick={() => handleDetect(s.id, s.file_path)}
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
    </>
  );
}
