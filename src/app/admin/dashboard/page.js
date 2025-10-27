// src/app/admin/dashboard/page.js

"use client";
import React from "react";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "./dashboard.module.css";
import Link from "next/link";
import Header from "@/components/HeaderSub";

export default function AdminDashboard() {
  const supabase = createClientComponentClient();

  const [stats, setStats] = useState({
    institutions: 0,
    teachers: 0,
    students: 0,
  });

  const [institutions, setInstitutions] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [instUsers, setInstUsers] = useState({ teachers: [], students: [] });

  const [modalType, setModalType] = useState(null); // "institution" | "teacher" | "student"
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");

  // Fetch stats + institutions
  useEffect(() => {
    const fetchData = async () => {
      const { count: instCount } = await supabase
        .from("institutions")
        .select("*", { count: "exact", head: true });

      const { count: teacherCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "teacher");

      const { count: studentCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "student");

      setStats({
        institutions: instCount || 0,
        teachers: teacherCount || 0,
        students: studentCount || 0,
      });

      const res = await fetch("/api/admin/get-institutions");
      const data = await res.json();
      if (!data.error) setInstitutions(data);
    };

    fetchData();
  }, []);

  // Expand/collapse institution → load teachers/students
  const handleExpand = async (id) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    const res = await fetch("/api/admin/get-institution-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ institution_id: id }),
    });
    const data = await res.json();
    if (!data.error) {
      setInstUsers(data);
      setExpanded(id);
    }
  };

  // Handle form input
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle modal submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    let url = "";
    if (modalType === "institution") url = "/api/admin/create-institution";
    if (modalType === "teacher") url = "/api/admin/create-teacher";
    if (modalType === "student") url = "/api/admin/create-student";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    if (result.error) setMessage("❌ " + result.error);
    else setMessage("✅ Success!");
    setFormData({});
  };

  return (

    <>
<Header/>
    <div className={styles.container}>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>DASES Admin</h2>
        <nav className={styles.nav}>
          <Link href="/admin/dashboard">Overview</Link>
          <Link href="/admin/institutions">Institutions</Link>
          <Link href="/admin/teachers">Teachers</Link>
          <Link href="/admin/students">Students</Link>
          <Link href="/admin/analytics">Usage Analytics</Link>
          <Link href="/admin/settings">Settings</Link>
        </nav>
      </aside>


      {/* Main */}
      <main className={styles.main}>
        {/* Overview Cards */}
        <section className={styles.cards}>
          <div className={styles.card}>
            <h3>Institutions</h3>
            <p>{stats.institutions}</p>
          </div>
          <div className={styles.card}>
            <h3>Teachers</h3>
            <p>{stats.teachers}</p>
          </div>
          <div className={styles.card}>
            <h3>Students</h3>
            <p>{stats.students}</p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className={styles.quickActions}>
          <h2>Quick Actions</h2>
          <div className={styles.actions}>
            <button onClick={() => setModalType("institution")}>
              + Create Institution
            </button>
            <button onClick={() => setModalType("teacher")}>
              + Add Teacher
            </button>
            <button onClick={() => setModalType("student")}>
              + Add Student
            </button>
          </div>
        </section>

        {/* Institutions Table */}
        <section className={styles.tableSection}>
          <h2>Institutions</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Teachers</th>
                <th>Students</th>
                <th>Created</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map((inst) => (
                <React.Fragment key={inst.id}>
                  <tr>
                    <td>
                      <button
                        className={styles.linkButton}
                        onClick={() => handleExpand(inst.id)}
                      >
                        {inst.name}
                      </button>
                    </td>
                    <td>{inst.teachers}</td>
                    <td>{inst.students}</td>
                    <td>{new Date(inst.created_at).toLocaleDateString()}</td>
                    <td>
                      <code className={styles.instId}>{inst.id}</code>
                    </td>
                  </tr>
                  {expanded === inst.id && (
                    <tr>
                      <td colSpan="5">
                        <div className={styles.subTable}>
                          <h3>Teachers</h3>
                          <table>
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                              </tr>
                            </thead>
                            <tbody>
                              {instUsers.teachers.map((t) => (
                                <tr key={t.id}>
                                  <td>{t.teacher_profiles?.full_name}</td>
                                  <td>{t.email}</td>
                                  <td>{t.teacher_profiles?.department}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <h3>Students</h3>
                          <table>
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Enrollment</th>
                                <th>Course</th>
                                <th>Year</th>
                              </tr>
                            </thead>
                            <tbody>
                              {instUsers.students.map((s) => (
                                <tr key={s.id}>
                                  <td>{s.student_profiles?.full_name}</td>
                                  <td>{s.email}</td>
                                  <td>{s.student_profiles?.enrollment_no}</td>
                                  <td>{s.student_profiles?.course}</td>
                                  <td>{s.student_profiles?.year}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </section>


        {/* Analytics */}
        <section className={styles.analytics}>
          <h2>Usage Analytics</h2>
          <div className={styles.analyticsPlaceholder}>
            📊 Graphs and reports will go here
          </div>
        </section>
      </main>

      {/* Modal */}
      {modalType && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>
              {modalType === "institution" && "Create Institution"}
              {modalType === "teacher" && "Add Teacher"}
              {modalType === "student" && "Add Student"}
            </h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              {modalType === "institution" && (
                <>
                  <input
                    type="text"
                    name="name"
                    placeholder="Institution Name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address || ""}
                    onChange={handleChange}
                  />
                </>
              )}

              {modalType === "teacher" && (
                <>
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    value={formData.full_name || ""}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="department"
                    placeholder="Department"
                    value={formData.department || ""}
                    onChange={handleChange}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    required
                  />
                  <select
                    name="institution_id"
                    value={formData.institution_id || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Institution</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {modalType === "student" && (
                <>
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    value={formData.full_name || ""}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="enrollment_no"
                    placeholder="Enrollment No"
                    value={formData.enrollment_no || ""}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="course"
                    placeholder="Course"
                    value={formData.course || ""}
                    onChange={handleChange}
                  />
                  <input
                    type="number"
                    name="year"
                    placeholder="Year"
                    value={formData.year || ""}
                    onChange={handleChange}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    required
                  />
                  <select
                    name="institution_id"
                    value={formData.institution_id || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Institution</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {message && <p>{message}</p>}

              <div className={styles.modalActions}>
                <button type="submit">Submit</button>
                <button
                  type="button"
                  onClick={() => {
                    setModalType(null);
                    setMessage("");
                  }}
                >
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
