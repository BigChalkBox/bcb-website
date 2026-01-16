// src/app/teacher/dashboard/page.js
"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { CheckCircle2, XCircle, FileText, ClipboardList, Upload, BookOpen, Play } from "lucide-react";
import styles from "./Dashboard.module.css";
import { downloadPaperAsPDF } from "@/utils/pdfGenerator";
import { downloadCompleteQuestionPaper } from "@/utils/completePdfGenerator";
import Header from "@/components/HeaderSub";

export default function TeacherDashboard() {
  const supabase = createClientComponentClient();
  const [papers, setPapers] = useState([]);
  const [students, setStudents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Create new paper
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/teacher/create-paper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const result = await res.json();
    if (result.error) setMessage(result.error);
    else setMessage("Paper created!");
    setFormData({});
  };

  // Fetch papers + students
  useEffect(() => {
    const fetchData = async () => {
      // ✅ Get the current logged-in teacher
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not found or unauthorized:", userError);
        return;
      }

      // ✅ Fetch only that teacher’s papers
      const { data: papersData, error: papersError } = await supabase
        .from("papers")
        .select("*")
        .eq("teacher_id", user.id) // filter by teacher_id
        .order("created_at", { ascending: false });

      if (papersError) {
        console.error("Error fetching papers:", papersError.message);
      }



      if (papersData) setPapers(papersData);

    };

    fetchData();
  }, [supabase]);

  // Placeholder actions
  const handleDownloadPaper = (paperId) => {
    console.log("Downloading paper for:", paperId);
    // your paper generation code here
  };

  const handleDownloadAnswerKey = (paperId) => {
    console.log("Downloading answer key for:", paperId);
    // your answer key generation code here
  };

  const handleUploadSubmissions = (paperId) => {
    window.location.href = `/teacher/papers/${paperId}/submissions`;
  };

  return (

    <>
      <Header />

      <div className={styles.container}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h2 className={styles.logo}>DASES Teacher</h2>
          <nav className={styles.nav}>
            <Link href="/teacher/dashboard">Dashboard</Link>
            <Link href="/teacher/demo" className={styles.navItemDemo}>
              <Play size={16} /> Try Demo
            </Link>
            <Link href="/teacher/evaluations">Evaluations</Link>
            <Link href="/teacher/reports">Reports</Link>
            <Link href="/teacher/curricula" className={styles.navItemWithIcon}>
              <BookOpen size={16} /> Manage Curricula
            </Link>
            <Link href="/teacher/answer-sheets">Answer Sheet Generator</Link>
            <Link href="/teacher/settings">Settings</Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
          {/* Quick Actions */}
          <section className={styles.quickActions}>
            <h2>Quick Actions</h2>
            <div className={styles.actions}>
              <button onClick={() => setModalOpen(true)}>+ Upload New Paper</button>
              <Link href="/teacher/demo">
                <button className={styles.demoButton}>
                  <Play size={16} /> Try Demo
                </button>
              </Link>
            </div>
          </section>

          {/* Active Papers */}
          <section className={styles.papers}>
            <h2>Your Question Papers</h2>
            {papers.length === 0 ? (
              <p>No papers created yet.</p>
            ) : (
              papers.map((paper) => (
                <div key={paper.id} className={styles.paperCard}>
                  <h3>
                    {paper.subject_name} ({paper.subject_code})
                  </h3>
                  <p>
                    {paper.exam_type} - {paper.exam_month_year}
                  </p>
                  <p>
                    Program: {paper.program} | Sem: {paper.semester}
                  </p>
                  <p>Max Marks: {paper.max_marks}</p>
                  <p>Status: {paper.status}</p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Active: {paper.is_active ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={16} style={{ color: '#10b981' }} /> Yes
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <XCircle size={16} style={{ color: '#ef4444' }} /> No
                      </span>
                    )}
                  </p>
                  <div className={styles.paperActions}>
                    {paper.status !== "final" ? (
                      <Link href={`/teacher/papers/${paper.id}`}>
                        <button>Continue</button>
                      </Link>
                    ) : (
                      <>
                        <button
                          className={`${styles.buttonBase} ${styles.primaryButton}`}
                          onClick={() => downloadPaperAsPDF(paper)}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FileText size={16} /> Download PDF
                          </span>
                        </button>

                        <button
                          className={`${styles.buttonBase} ${styles.primaryButton}`}
                          onClick={() => downloadCompleteQuestionPaper(paper, { includeAll: true })}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ClipboardList size={16} /> Download Complete Paper
                          </span>
                        </button>


                        <button onClick={() => handleUploadSubmissions(paper.id)}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Upload size={16} /> Upload Submissions
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Class Analytics */}
          {/* <section className={styles.analytics}>
          <h2>Class Analytics</h2>
          <div className={styles.analyticsPlaceholder}>
            📊 Charts (Average Score, Weak Areas, Leaderboard) will go here
          </div>
        </section> */}

          {/* Students Table */}
          {/* <section className={styles.students}>
          <h2>Students</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Papers Attempted</th>
                <th>Avg Score</th>
                <th>Reports</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.full_name}</td>
                  <td>{s.papers_attempted}</td>
                  <td>{s.avg_score}</td>
                  <td>
                    <button>View Report</button>
                  </td>
                  <td>
                    <button>View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section> */}
        </main>

        {/* Modal: Create Paper */}
        {modalOpen && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
              <h2>Create New Paper</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <input
                  type="text"
                  name="subject_name"
                  placeholder="Subject Name"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="subject_code"
                  placeholder="Subject Code"
                  onChange={handleChange}
                  required
                />
                <input
                  type="number"
                  name="year"
                  placeholder="Year"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="faculty_name"
                  placeholder="Faculty Name"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="exam_type"
                  placeholder="Exam Type (Midterm/Final)"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="exam_month_year"
                  placeholder="Exam Month-Year (e.g. May 2025)"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="program"
                  placeholder="Program (e.g. B.Tech CSE)"
                  onChange={handleChange}
                  required
                />
                <input
                  type="number"
                  name="semester"
                  placeholder="Semester"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="course"
                  placeholder="Course"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="time_allowed"
                  placeholder="Time Allowed (e.g. 3 Hours)"
                  onChange={handleChange}
                />
                <input
                  type="number"
                  name="max_marks"
                  placeholder="Max Marks"
                  onChange={handleChange}
                />
                <textarea
                  name="instructions"
                  placeholder="Instructions"
                  onChange={handleChange}
                ></textarea>

                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    onChange={(e) =>
                      handleChange({
                        target: { name: "is_active", value: e.target.checked },
                      })
                    }
                  />
                  Complete
                </label>

                {message && <p>{message}</p>}
                <div className={styles.modalActions}>
                  <button type="submit">Create</button>
                  <button type="button" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
