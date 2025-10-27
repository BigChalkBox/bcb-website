// src/app/student/upload/[submission_id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "./UploadPage.module.css";

export default function UploadPage() {
  const supabase = createClientComponentClient();
  const { submission_id } = useParams();

  const [submission, setSubmission] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch submission details
  useEffect(() => {
    const fetchSubmission = async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select(
          "id, student_name, paper_name, submitted_at, papers(subject_name, exam_type, exam_month_year, is_active)"
        )
        .eq("id", submission_id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching submission:", error);
        setMessage("❌ Failed to load submission details.");
      } else {
        setSubmission(data);
      }
    };

    fetchSubmission();
  }, [submission_id, supabase]);

  // ✅ Handle file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("⚠️ Please choose a file before uploading.");
    if (!submission?.papers?.is_active)
      return setMessage("🚫 Submissions are closed for this paper.");

    setUploading(true);
    setMessage("");

    try {
      const fileExt = file.name.split(".").pop();
      if (fileExt !== "pdf")
        return setMessage("⚠️ Only PDF files are allowed.");

      const fileName = `${submission_id}.${fileExt}`;
      const filePath = `submissions/${submission_id}/${fileName}`;

      // ✅ Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("submissions") // your Supabase storage bucket name
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // ✅ Update DB record
      const { error: dbError } = await supabase
        .from("submissions")
        .update({
          file_path: filePath,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", submission_id);

      if (dbError) throw dbError;

      setMessage("✅ Answer sheet uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      setMessage(`❌ Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (!submission)
    return (
      <div className={styles.loadingContainer}>
        <p>Loading submission details...</p>
      </div>
    );

  const { papers } = submission;
  const isActive = papers?.is_active;
  const isSubmitted = !!submission.submitted_at;

  return (
    <div className={styles.container}>
      <h1>📤 Upload Answer Sheet</h1>
      <h2>{papers?.subject_name}</h2>
      <p>
        {papers?.exam_type} – {papers?.exam_month_year}
      </p>

      <div className={styles.detailsBox}>
        <p><strong>Student:</strong> {submission.student_name}</p>
        <p><strong>Paper:</strong> {submission.paper_name}</p>
        <p><strong>Status:</strong> {isSubmitted ? "✅ Submitted" : "🕒 Not Submitted"}</p>
        <p>
          <strong>Submission Window:</strong>{" "}
          {isActive ? "🟢 Active" : "🔴 Closed"}
        </p>
      </div>

      {!isActive ? (
        <p className={styles.errorText}>🚫 Submissions are closed for this paper.</p>
      ) : isSubmitted ? (
        <p className={styles.successText}>
          ✅ You’ve already submitted your answer sheet.
        </p>
      ) : (
        <form onSubmit={handleFileUpload} className={styles.uploadForm}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload PDF"}
          </button>
        </form>
      )}

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
