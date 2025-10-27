"use client";

import React, { useEffect, useState } from "react";
import styles from "../dashboard/dashboard.module.css";

export default function StudentsPage() {
  const [groupedStudents, setGroupedStudents] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({});

  // ✅ Fetch students grouped by institution
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/get-students");
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      // ✅ Group by institution name
      const grouped = {};
      data.forEach((student) => {
        const instName = student.institution?.name || "Unassigned Institution";
        if (!grouped[instName]) grouped[instName] = [];
        grouped[instName].push(student);
      });

      setGroupedStudents(grouped);
    } catch (err) {
      console.error("Error fetching students:", err);
      setMessage("❌ Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ✅ Search logic (filters inside each institution group)
  const filteredGroups = Object.entries(groupedStudents).reduce(
    (acc, [instName, students]) => {
      const q = search.toLowerCase();
      const filtered = students.filter(
        (s) =>
          s.student_profiles?.full_name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.student_profiles?.enrollment_no?.toLowerCase().includes(q) ||
          s.student_profiles?.course?.toLowerCase().includes(q)
      );
      if (filtered.length > 0) acc[instName] = filtered;
      return acc;
    },
    {}
  );

  // ✅ Delete student
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    const res = await fetch("/api/admin/delete-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const result = await res.json();
    if (result.error) alert("❌ " + result.error);
    else {
      alert("✅ Student deleted");
      fetchStudents();
    }
  };

  // ✅ Handle input
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Submit create/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url =
      modalType === "create"
        ? "/api/admin/create-student"
        : "/api/admin/edit-student";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    if (result.error) setMessage("❌ " + result.error);
    else {
      setMessage("✅ Success!");
      fetchStudents();
      setTimeout(() => {
        setModalType(null);
        setMessage("");
        setFormData({});
      }, 800);
    }
  };

  if (loading) return <p className={styles.loading}>Loading students...</p>;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Students by Institution</h1>
      <p className={styles.pageDesc}>
        View and manage all student accounts grouped by their institutions.
      </p>

      <div className={styles.pageHeader}>
        <input
          type="text"
          placeholder="Search by name, email, enrollment, course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <button
          className={styles.addButton}
          onClick={() => setModalType("create")}
        >
          + Add Student
        </button>
      </div>

      {/* ✅ Grouped Display */}
      {Object.entries(filteredGroups).map(([instName, students]) => (
        <div key={instName} className={styles.institutionSection}>
          <h2 className={styles.instHeader}>{instName}</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Enrollment</th>
                <th>Course</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <code className={styles.instId}>{s.id}</code>
                  </td>
                  <td>{s.student_profiles?.full_name}</td>
                  <td>{s.email}</td>
                  <td>{s.student_profiles?.enrollment_no}</td>
                  <td>{s.student_profiles?.course}</td>
                  <td>{s.student_profiles?.year}</td>
                  <td>
                    <button
                      onClick={() => {
                        setFormData({
                          id: s.id,
                          full_name: s.student_profiles?.full_name,
                          enrollment_no: s.student_profiles?.enrollment_no,
                          course: s.student_profiles?.course,
                          year: s.student_profiles?.year,
                          email: s.email,
                          institution_id: s.institution_id,
                        });
                        setModalType("edit");
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Modal */}
      {modalType && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>{modalType === "create" ? "Add Student" : "Edit Student"}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
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
              {modalType === "create" && (
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password || ""}
                  onChange={handleChange}
                  required
                />
              )}
              <input
                type="text"
                name="institution_id"
                placeholder="Institution ID"
                value={formData.institution_id || ""}
                onChange={handleChange}
                required
              />

              {message && <p>{message}</p>}

              <div className={styles.modalActions}>
                <button type="submit">Submit</button>
                <button
                  type="button"
                  onClick={() => {
                    setModalType(null);
                    setMessage("");
                    setFormData({});
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
  );
}
