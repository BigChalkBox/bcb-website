// src/app/teacher/papers/[id]/submissions/page.js
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import styles from "./SubmissionsPage.module.css";

function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, type === "error" ? 8000 : 5000);
    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  if (!message) return null;

  const iconMap = {
    success: "✓",
    error: "✕",
    warning: "!",
    info: "i",
  };

  return (
    <div className={`${styles.toast} ${styles[`toast_${type}`]}`}>
      <span className={styles.toastIcon}>{iconMap[type] || "i"}</span>
      <span className={styles.toastMessage}>{message}</span>
      <button className={styles.toastClose} onClick={onClose}>×</button>
    </div>
  );
}

function Banner({ message, type, action, onClose }) {
  if (!message) return null;
  return (
    <div className={`${styles.banner} ${styles[`banner_${type}`]}`}>
      <div className={styles.bannerContent}>
        <span className={styles.bannerMessage}>{message}</span>
        {action && (
          <button className={styles.bannerAction} onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
      {onClose && (
        <button className={styles.bannerClose} onClick={onClose}>×</button>
      )}
    </div>
  );
}

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

  // Bulk upload state
  const [excelFile, setExcelFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const [rowStatuses, setRowStatuses] = useState({});
  const [bulkMode, setBulkMode] = useState(false);
  const cancelImportRef = useRef(false);

  // Notification state
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [banner, setBanner] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast({ message: "", type: "info" });
  }, []);

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
    if (!file) return showToast("Please upload a PDF file.", "warning");

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
        showToast(`Submission uploaded for ${student.student_name}`, "success");
        setStudent({ student_name: "", enrollment_no: "", email: "" });
        setFile(null);
        fetchSubmissions();
      } else {
        showToast("Upload failed: " + json.error, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error uploading submission", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // === Bulk Upload Functions ===

  const handleParseExcel = async () => {
    if (!excelFile) return showToast("Please select an Excel file first.", "warning");
    setParsing(true);
    setParsedRows([]);
    setRowStatuses({});
    setBanner(null);

    try {
      const fd = new FormData();
      fd.append("file", excelFile);

      const res = await fetch(`/api/papers/${paperId}/submissions/parse-excel`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (json.success) {
        setParsedRows(json.rows);
        const statuses = {};
        json.rows.forEach((_, i) => {
          statuses[i] = { status: "pending", message: "" };
        });
        setRowStatuses(statuses);
        showToast(`Parsed ${json.rows.length} rows from "${json.sheetName}"`, "success");
      } else {
        showToast("Failed to parse Excel: " + json.error, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error parsing Excel file", "error");
    } finally {
      setParsing(false);
    }
  };

  const fetchCookiesAutomatically = async () => {
    try {
      const res = await fetch("/api/sharepoint-cookies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: "sharepoint.com" }),
      });
      const json = await res.json();
      if (json.success && json.cookies) {
        return json.cookies;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleStartImport = async () => {
    const validRows = parsedRows.filter(
      (r) => r.submissionLink && r.submissionLink.startsWith("http")
    );

    if (validRows.length === 0) {
      return showToast("No valid submission links found in the parsed data.", "warning");
    }

    // Auto-fetch cookies
    showToast("Fetching SharePoint cookies from your browser...", "info");
    let cookies = await fetchCookiesAutomatically();

    if (!cookies) {
      // Show a persistent banner prompting user to sign in
      const sharePointUrl = validRows[0]?.submissionLink || "";
      const domain = sharePointUrl ? new URL(sharePointUrl).origin : "https://your-org.sharepoint.com";

      // Open the SharePoint URL so the user can sign in
      window.open(domain, "_blank");

      setBanner({
        message: `Please sign in to SharePoint in the tab that just opened, then click "Retry Import" below.`,
        type: "warning",
        action: {
          label: "Retry Import",
          onClick: () => {
            setBanner(null);
            handleStartImport();
          },
        },
      });
      return;
    }

    setBanner(null);
    cancelImportRef.current = false;
    setImporting(true);
    setImportProgress({ done: 0, total: validRows.length });

    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (let i = 0; i < parsedRows.length; i++) {
      if (cancelImportRef.current) {
        // Mark remaining rows as stopped
        for (let j = i; j < parsedRows.length; j++) {
          if (!rowStatuses[j] || rowStatuses[j].status === "pending") {
            setRowStatuses((prev) => ({ ...prev, [j]: { status: "skipped", message: "Stopped" } }));
          }
        }
        break;
      }
      const row = parsedRows[i];

      if (!row.submissionLink || !row.submissionLink.startsWith("http")) {
        setRowStatuses((prev) => ({
          ...prev,
          [i]: { status: "skipped", message: "No valid link" },
        }));
        skipCount++;
        continue;
      }

      setRowStatuses((prev) => ({
        ...prev,
        [i]: { status: "downloading", message: "Downloading..." },
      }));

      try {
        const res = await fetch(`/api/papers/${paperId}/submissions/from-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: row.submissionLink,
            student_name: row.name || "Unknown",
            enrollment_no: row.sapId || row.email?.split("@")[0] || String(row.id),
            email: row.email || "",
            cookies,
          }),
        });

        const json = await res.json();
        if (json.success) {
          setRowStatuses((prev) => ({
            ...prev,
            [i]: { status: "success", message: `Uploaded (${(json.fileSize / 1024).toFixed(0)} KB)` },
          }));
          successCount++;
        } else {
          setRowStatuses((prev) => ({
            ...prev,
            [i]: {
              status: json.duplicate ? "duplicate" : "failed",
              message: json.error || "Unknown error",
            },
          }));
          failCount++;
        }
      } catch (err) {
        setRowStatuses((prev) => ({
          ...prev,
          [i]: { status: "failed", message: err.message },
        }));
        failCount++;
      }

      setImportProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }

    const wasCancelled = cancelImportRef.current;
    setImporting(false);
    cancelImportRef.current = false;
    fetchSubmissions();
    showToast(
      wasCancelled
        ? `Import stopped: ${successCount} uploaded, ${failCount} failed, ${skipCount} skipped`
        : `Import complete: ${successCount} uploaded, ${failCount} failed, ${skipCount} skipped`,
      successCount > 0 ? "success" : "warning"
    );
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: "Pending", cls: styles.badgePending },
      downloading: { label: "Downloading...", cls: styles.badgeDownloading },
      success: { label: "Success", cls: styles.badgeSuccess },
      failed: { label: "Failed", cls: styles.badgeFailed },
      skipped: { label: "Skipped", cls: styles.badgeSkipped },
      duplicate: { label: "Duplicate", cls: styles.badgeDuplicate },
    };
    const info = map[status] || map.pending;
    return <span className={`${styles.badge} ${info.cls}`}>{info.label}</span>;
  };

  return (
    <div className={styles.container}>
      {/* Toast notification */}
      <Toast message={toast.message} type={toast.type} onClose={clearToast} />

      {/* Banner notification */}
      {banner && (
        <Banner
          message={banner.message}
          type={banner.type}
          action={banner.action}
          onClose={() => setBanner(null)}
        />
      )}

      <h1>Upload Student Submissions</h1>

      {/* Mode toggle */}
      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeButton} ${!bulkMode ? styles.modeActive : ""}`}
          onClick={() => setBulkMode(false)}
        >
          Single Upload
        </button>
        <button
          className={`${styles.modeButton} ${bulkMode ? styles.modeActive : ""}`}
          onClick={() => setBulkMode(true)}
        >
          Bulk Upload from Excel
        </button>
      </div>

      {/* Single upload form */}
      {!bulkMode && (
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
      )}

      {/* Bulk upload section */}
      {bulkMode && (
        <div className={styles.bulkSection}>
          <div className={styles.bulkStep}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>1</span>
              <span>Upload the Excel file from SharePoint Forms</span>
            </div>
            <div className={styles.formGroup}>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setExcelFile(e.target.files[0])}
              />
            </div>
            <button
              className={styles.actionButton}
              onClick={handleParseExcel}
              disabled={parsing || !excelFile}
            >
              {parsing ? "Parsing..." : "Parse Excel"}
            </button>
          </div>

          {parsedRows.length > 0 && (
            <div className={styles.bulkStep}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNumber}>2</span>
                <span>Review and import ({parsedRows.length} rows found)</span>
              </div>

              <p className={styles.helpText}>
                Cookies will be fetched automatically from your browser. Make sure you are signed in to SharePoint in Chrome, Firefox, or Safari.
              </p>

              {importing && (
                <div className={styles.progressSection}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${(importProgress.done / importProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                  <p className={styles.progressText}>
                    Processing {importProgress.done} / {importProgress.total}
                  </p>
                </div>
              )}

              <div className={styles.previewTableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>SAP ID</th>
                      <th>Batch</th>
                      <th>Link</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, i) => (
                      <tr key={i}>
                        <td>{row.id}</td>
                        <td>{row.name}</td>
                        <td>{row.email}</td>
                        <td>{row.sapId}</td>
                        <td>{row.batch}</td>
                        <td>
                          {row.submissionLink && row.submissionLink.startsWith("http") ? (
                            <a
                              href={row.submissionLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.linkIcon}
                              title={row.submissionLink}
                            >
                              Link
                            </a>
                          ) : (
                            <span className={styles.noLink}>No link</span>
                          )}
                        </td>
                        <td>
                          {getStatusBadge(rowStatuses[i]?.status || "pending")}
                          {rowStatuses[i]?.message && rowStatuses[i]?.status !== "pending" && (
                            <span className={styles.statusMessage}>
                              {rowStatuses[i].message}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.importActions}>
                <button
                  className={styles.importButton}
                  onClick={handleStartImport}
                  disabled={importing}
                >
                  {importing ? "Importing..." : "Start Import"}
                </button>
                {importing && (
                  <button
                    className={styles.stopButton}
                    onClick={() => {
                      cancelImportRef.current = true;
                      showToast("Stopping import after current row...", "warning");
                    }}
                  >
                    Stop Import
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submissions list */}
      <h2 className={styles.subListHeader}>Uploaded Submissions</h2>
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
                      const fileName = sub.file_path.split("/").pop();
                      window.open(
                        `/view-pdf?url=${encodeURIComponent(pdfUrl)}&name=${encodeURIComponent(fileName)}`,
                        "_blank"
                      );
                    }}
                  >
                    View
                  </button>
                </td>
                <td>
                  {sub.submitted_at
                    ? new Date(sub.submitted_at).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
