// src/app/teacher/dashboard/page.js
"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { CheckCircle2, XCircle, FileText, ClipboardList, Upload, BookOpen, Play, Clock, Trash2 } from "lucide-react";
import styles from "./Dashboard.module.css";
import { downloadPaperAsPDF } from "@/utils/pdfGenerator";
import { downloadCompleteQuestionPaper } from "@/utils/completePdfGenerator";
import Header from "@/components/HeaderSub";

// Helper function to format relative time
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

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

  // Create new paper and redirect to setup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/teacher/create-paper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const result = await res.json();
    if (result.error) {
      setMessage(result.error);
    } else if (result.paper?.id) {
      // Redirect to paper setup page
      window.location.href = `/teacher/papers/${result.paper.id}`;
    } else {
      setMessage("Paper created! Redirecting...");
    }
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

  const handleDeletePaper = async (paperId) => {
    if (!confirm("Are you sure you want to delete this paper? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/papers/${paperId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setPapers(papers.filter(p => p.id !== paperId));
      } else {
        alert("Failed to delete paper: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error deleting paper:", err);
      alert("Error deleting paper");
    }
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
          {/* Quick Actions - New Card Style */}
          <section className={styles.quickActions}>
            <h2>Quick Actions</h2>
            <div className={styles.actionCardsGrid}>
              {/* Set Curriculum Card */}
              <Link href="/teacher/curricula/new" className={styles.actionCard}>
                <div className={`${styles.actionCardIcon} ${styles.actionCardIconGreen}`}>
                  <BookOpen size={28} />
                </div>
                <span className={styles.actionCardTitle}>Set Curriculum</span>
                <span className={styles.actionCardDesc}>Upload syllabus & define topics</span>
              </Link>

              {/* Set Paper Card */}
              <div className={styles.actionCard} onClick={() => setModalOpen(true)}>
                <div className={`${styles.actionCardIcon} ${styles.actionCardIconBlue}`}>
                  <FileText size={28} />
                </div>
                <span className={styles.actionCardTitle}>Set Paper</span>
                <span className={styles.actionCardDesc}>Create & moderate questions</span>
              </div>

              {/* Try Demo Card */}
              <Link href="/teacher/demo" className={styles.actionCard}>
                <div className={`${styles.actionCardIcon} ${styles.actionCardIconPurple}`}>
                  <Play size={28} />
                </div>
                <span className={styles.actionCardTitle}>Try Demo</span>
                <span className={styles.actionCardDesc}>See how it works</span>
              </Link>
            </div>
          </section>

          {/* Active Papers */}
          <section className={styles.papers}>
            <h2>Your Question Papers</h2>
            {papers.length === 0 ? (
              <p>No papers created yet. Click &quot;Set Paper&quot; to get started.</p>
            ) : (
              papers.map((paper) => {
                // Determine stage
                const getStageInfo = () => {
                  if (paper.status === 'final') return { label: 'Final', class: styles.stageFinal };
                  if (paper.status === 'questions_set') return { label: 'Questions Set', class: styles.stageQuestionsSet };
                  if (paper.status === 'moderated') return { label: 'Moderated', class: styles.stageModerated };
                  if (paper.status === 'questions_added') return { label: 'Questions Added', class: styles.stageQuestions };
                  return { label: 'Draft', class: styles.stageDraft };
                };
                const stage = getStageInfo();

                return (
                  <div key={paper.id} className={styles.paperCard}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <h3 style={{ margin: 0 }}>
                        {paper.subject_name} ({paper.subject_code})
                      </h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`${styles.stageBadge} ${stage.class}`}>{stage.label}</span>
                        <button
                          onClick={() => handleDeletePaper(paper.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                          title="Delete Paper"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p>
                      {paper.exam_type} - {paper.exam_month_year}
                    </p>
                    <p>
                      Program: {paper.program} | Sem: {paper.semester}
                    </p>
                    <p>Max Marks: {paper.max_marks}</p>
                    {(paper.updated_at || paper.created_at) && (
                      <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' }}>
                        <Clock size={14} /> Updated {formatRelativeTime(paper.updated_at || paper.created_at)}
                      </p>
                    )}

                    <div className={styles.paperActions}>
                      {paper.status === 'final' ? (
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
                              <ClipboardList size={16} /> Complete Paper
                            </span>
                          </button>
                          <button onClick={() => handleUploadSubmissions(paper.id)}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Upload size={16} /> Upload Submissions
                            </span>
                          </button>
                        </>
                      ) : paper.status === 'questions_set' ? (
                        <Link href={`/teacher/papers/${paper.id}/studio`}>
                          <button className={styles.continueBtn}>
                            Set Sample Answers & Rubrics
                          </button>
                        </Link>
                      ) : (
                        <Link href={`/teacher/papers/${paper.id}`}>
                          <button className={styles.continueBtn}>Continue Setup</button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
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
                  placeholder="Subject Name *"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="subject_code"
                  placeholder="Subject Code *"
                  onChange={handleChange}
                  required
                />
                <div className={styles.formRow}>
                  <select
                    name="exam_type"
                    onChange={handleChange}
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>Exam Type *</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Final">Final</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                  <input
                    type="text"
                    name="exam_month_year"
                    placeholder="Month-Year (e.g. May 2025)"
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formRow}>
                  <input
                    type="text"
                    name="program"
                    placeholder="Program (e.g. B.Tech CSE)"
                    onChange={handleChange}
                  />
                  <input
                    type="number"
                    name="semester"
                    placeholder="Semester"
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formRow}>
                  <input
                    type="number"
                    name="max_marks"
                    placeholder="Max Marks"
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="time_allowed"
                    placeholder="Time (e.g. 3 Hours)"
                    onChange={handleChange}
                  />
                </div>

                {message && <p className={styles.formMessage}>{message}</p>}
                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setModalOpen(false)} className={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.createBtn}>
                    Create & Continue
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

