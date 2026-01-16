// src/app/teacher/papers/[id]/submissions/page.js
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "./SubmissionsPage.module.css";

export default function SubmissionsPage() {
  const { id: paperId } = useParams();
  const [student, setStudent] = useState({
    student_name: "",
    enrollment_no: "",
    email: "",
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`/api/papers/${paperId}/submissions`);
      const json = await res.json();
      if (json.success) {
        setSubmissions(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load submissions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [paperId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload a PDF file.");

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("student_name", student.student_name);
      fd.append("enrollment_no", student.enrollment_no);
      fd.append("email", student.email);

      const res = await fetch(`/api/papers/${paperId}/submissions`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (json.success) {
        alert(`✅ Submission uploaded for ${student.student_name}`);
        setStudent({ student_name: "", enrollment_no: "", email: "" });
        setFile(null);
        fetchSubmissions(); // refresh list
      } else {
        alert("❌ Upload failed: " + json.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading submission");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>📥 Upload Student Submissions</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Student Name</label>
          <input
            type="text"
            name="student_name"
            value={student.student_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Enrollment Number</label>
          <input
            type="text"
            name="enrollment_no"
            value={student.enrollment_no}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Official Email</label>
          <input
            type="email"
            name="email"
            value={student.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Upload Answer PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFile}
            required
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Uploading…" : "Upload Submission"}
        </button>
      </form>

      {/* Submissions list */}
      <h2 className={styles.subListHeader}>📑 Uploaded Submissions</h2>
      {loading ? (
        <p>Loading submissions…</p>
      ) : submissions.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Enrollment No.</th>
              <th>Email</th>
              <th>File</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.student_name}</td>
                <td>{sub.enrollment_no}</td>
                <td>{sub.email}</td>
                <td>
                  <button
                    className={styles.viewButton}
                    onClick={() => {
                      const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/submissions/${sub.file_path}`;
                      const fileName = sub.file_path.split('/').pop();
                      window.open(
                        `/view-pdf?url=${encodeURIComponent(pdfUrl)}&name=${encodeURIComponent(fileName)}`,
                        '_blank'
                      );
                    }}
                  >
                    📎 View
                  </button>
                </td>
                <td>
                  {sub.submitted_at
                    ? new Date(sub.submitted_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
