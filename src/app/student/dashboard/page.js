"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "./Dashboard.module.css";
import Header from "@/components/HeaderSub";
import Link from "next/link";

export default function StudentDashboard() {
  const supabase = createClientComponentClient();

  const [student, setStudent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [assignedPapers, setAssignedPapers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState("");
  const [feedbackModal, setFeedbackModal] = useState(null);


  useEffect(() => {
    const fetchStudentData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error("Unauthorized or no user found:", error);
        setLoading(false);
        return;
      }

      setStudent(user);

      // ✅ Fetch student profile
      const { data: profileData, error: profileError } = await supabase
        .from("student_profiles")
        .select("full_name, enrollment_no, course, year, phone, email")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) console.error("Error fetching student profile:", profileError);
      else setProfile(profileData);

      // ✅ Fetch assigned papers
      const { data: papersData, error: papersError } = await supabase
        .from("submissions")
        .select(`
          id, paper_id, paper_name, submitted_at,
          papers(subject_name, exam_type, exam_month_year, program, semester, max_marks, status, is_active)
        `)
        .eq("email", user.email);

      if (papersError) console.error("Error fetching assigned papers:", papersError);

      // ✅ Fetch evaluation results
      let evalsData = [];
      if (papersData?.length) {
        const submissionIds = papersData.map((p) => p.id);
        const { data: evalData, error: evalError } = await supabase
          .from("evaluations")
          .select("submission_id, status, evaluation_results, submissions(paper_name, submitted_at)")
          .in("submission_id", submissionIds);

        if (evalError) console.error("Error fetching reports:", evalError);
        else evalsData = evalData || [];
      }

      // ✅ Format reports
      const formattedReports = evalsData.map((e) => {
        let totalMarks = 0;
        let totalScore = 0;

        if (e.evaluation_results?.results) {
          totalMarks = e.evaluation_results.results.reduce(
            (sum, q) => sum + (q.marks || 0),
            0
          );
          totalScore = e.evaluation_results.results.reduce(
            (sum, q) => sum + (q.evaluation?.suggestedScore || 0),
            0
          );
        }

        return {
          submission_id: e.submission_id,
          paper_name: e.submissions?.paper_name || "Untitled Paper",
          submitted_at: e.submissions?.submitted_at,
          score: totalScore,
          total: totalMarks,
          feedback:
            e.evaluation_results?.overall_feedback ||
            "No feedback available yet.",
          status: e.status || "Pending",
        };
      });

      setAssignedPapers(papersData || []);
      setReports(formattedReports || []);
      setLoading(false);
    };

    fetchStudentData();
  }, [supabase]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage("Saving...");
    const { error } = await supabase
      .from("student_profiles")
      .update({
        full_name: editData.full_name,
        course: editData.course,
        year: editData.year ? parseInt(editData.year) : null,
        phone: editData.phone,
      })
      .eq("id", student.id);

    if (error) {
      console.error("Error updating profile:", error);
      setMessage("❌ Failed to update profile.");
    } else {
      setProfile((prev) => ({ ...prev, ...editData }));
      setMessage("✅ Profile updated successfully!");
      setEditOpen(false);
    }
  };

  if (loading) return <p className={styles.loading}>Loading your dashboard...</p>;

  return (

    <>
    <Header/>

    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>DASES Student</h2>
        <div className={styles.profileBox}>
          <p className={styles.profileName}>{profile?.full_name || "Student"}</p>
          <p className={styles.profileEmail}>{profile?.email}</p>
          <p className={styles.profileInfo}>
            {profile?.course ? `${profile.course}` : ""}
            {profile?.year ? ` | Year ${profile.year}` : ""}
          </p>
          <p className={styles.profileEnroll}>
            🎓 Enrollment: {profile?.enrollment_no || "N/A"}
          </p>
          <p className={styles.profilePhone}>
            📞 {profile?.phone || "—"}
          </p>
          <button
            className={styles.editButton}
            onClick={() => {
              setEditData(profile);
              setEditOpen(true);
            }}
          >
            ✏️ Edit Profile
          </button>
        </div>
<nav className={styles.nav}>
  <Link href="/student/dashboard">Dashboard</Link>
  <Link href="/student/reports">My Reports</Link>
</nav>

      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <section className={styles.welcome}>
          <h2>Hi {profile?.full_name || "Student"} 👋</h2>
          <p>
            You have <strong>{assignedPapers.length}</strong> assigned paper
            {assignedPapers.length !== 1 ? "s" : ""}.
          </p>
        </section>

        {/* Assigned Papers */}
        <section className={styles.assigned}>
          <h2>Assigned Papers</h2>
          {assignedPapers.length === 0 ? (
            <p>No assigned papers yet.</p>
          ) : (
            assignedPapers.map((p) => {
              const paper = p.papers || {};
              const isActive = paper.is_active;
              const hasSubmitted = !!p.submitted_at;

              return (
                <div key={p.id} className={styles.paperCard}>
                  <h3>{paper.subject_name}</h3>
                  <p>{paper.exam_type} - {paper.exam_month_year}</p>
                  <p>Program: {paper.program} | Sem {paper.semester}</p>
                  <p>Max Marks: {paper.max_marks}</p>
                  <p>Status: {paper.status}</p>
                  <p>Active: {isActive ? "✅ Yes" : "❌ No"}</p>

                  <div className={styles.paperActions}>
                    {!isActive ? (
                      <button disabled className={styles.disabledButton}>🚫 Submissions Closed</button>
                    ) : hasSubmitted ? (
                      <button disabled className={styles.disabledButton}>✅ Already Submitted</button>
                    ) : (
                      <button
                        className={styles.primaryButton}
                        onClick={() => (window.location.href = `/student/upload/${p.id}`)}
                      >
                        ⬆️ Upload Answer Sheet
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>

{/* Reports Section */}
<section className={styles.reports}>
  <h2>My Reports</h2>

  {reports.length === 0 ? (
    <p>No reports available yet.</p>
  ) : (
    reports.map((r) => (
      <div key={r.submission_id} className={styles.reportCard}>
        <h3>{r.paper_name}</h3>
        <p>Score: {r.score}/{r.total}</p>
        <p>Status: {r.status}</p>
        <p>Feedback: {r.feedback}</p>

        <div className={styles.reportActions}>
          {r.status === "Completed" || r.status === "Evaluated" ? (
            <Link href={`/reports/${r.submission_id}`} target="_blank">
              <button className={styles.primaryButton}>📄 View Report</button>
            </Link>
          ) : (
            <button disabled className={styles.disabledButton}>⏳ Not Evaluated</button>
          )}

          <button
            className={styles.secondaryButton}
            onClick={() => {
              setFeedbackModal({
                open: true,
                submission_id: r.submission_id,
                paper_name: r.paper_name,
              });
            }}
          >
            💬 Give Feedback
          </button>
        </div>
      </div>
    ))
  )}
</section>

{/* Feedback Modal */}
{feedbackModal?.open && (
  <div className={styles.modalBackdrop}>
    <div className={styles.modal}>
      <h2>Feedback for {feedbackModal.paper_name}</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const feedbackText = e.target.feedback.value;
          const rating = parseInt(e.target.rating.value);
          if (!feedbackText.trim()) return alert("Please write feedback");

          const { data: userData } = await supabase.auth.getUser();
          if (!userData?.user) return alert("Please log in again");

          const res = await fetch("/api/student/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              submission_id: feedbackModal.submission_id,
              student_id: userData.user.id,
              feedback_text: feedbackText,
              rating,
            }),
          });

          const result = await res.json();
          if (result.success) {
            alert(result.message);
            setFeedbackModal(null);
          } else {
            alert(result.message || "Error submitting feedback");
          }
        }}
      >
        <textarea
          name="feedback"
          placeholder="Write your feedback..."
          className={styles.feedbackTextarea}
          required
        ></textarea>

        <label>Rate your evaluation:</label>
        <select name="rating" className={styles.ratingSelect}>
          <option value="">Select</option>
          <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
          <option value="4">⭐⭐⭐⭐ Good</option>
          <option value="3">⭐⭐⭐ Average</option>
          <option value="2">⭐⭐ Poor</option>
          <option value="1">⭐ Very Poor</option>
        </select>

        <div className={styles.modalActions}>
          <button type="submit">Submit</button>
          <button type="button" onClick={() => setFeedbackModal(null)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      </main>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>Edit Profile</h2>
            <form onSubmit={handleSaveProfile} className={styles.form}>
              <input
                type="text"
                name="full_name"
                placeholder="Full Name"
                value={editData.full_name || ""}
                onChange={handleEditChange}
                required
              />
              <input
                type="text"
                name="course"
                placeholder="Course"
                value={editData.course || ""}
                onChange={handleEditChange}
              />
              <input
                type="number"
                name="year"
                placeholder="Year"
                value={editData.year || ""}
                onChange={handleEditChange}
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={editData.phone || ""}
                onChange={handleEditChange}
              />

              {message && <p>{message}</p>}

              <div className={styles.modalActions}>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditOpen(false)}>
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
