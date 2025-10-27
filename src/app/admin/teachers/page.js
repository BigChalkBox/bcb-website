"use client";

import React, { useEffect, useState } from "react";
import styles from "../dashboard/dashboard.module.css";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [modalType, setModalType] = useState(null); // "create" | "edit"
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");

  // Fetch teachers
  const fetchTeachers = async () => {
    const res = await fetch("/api/admin/get-teachers");
    const data = await res.json();
    if (!data.error) {
      setTeachers(data);
      setFiltered(data);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Delete teacher
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;

    const res = await fetch("/api/admin/delete-teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (result.error) alert("❌ " + result.error);
    else {
      alert("✅ Teacher deleted");
      fetchTeachers();
    }
  };

  // Handle input
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Submit create/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    let url =
      modalType === "create"
        ? "/api/admin/create-teacher"
        : "/api/admin/edit-teacher";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    if (result.error) setMessage("❌ " + result.error);
    else {
      setMessage("✅ Success!");
      fetchTeachers();
      setTimeout(() => {
        setModalType(null);
        setMessage("");
        setFormData({});
      }, 800);
    }
  };

  // Search filter
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(teachers);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      teachers.filter(
        (t) =>
          t.teacher_profiles?.full_name?.toLowerCase().includes(q) ||
          t.email?.toLowerCase().includes(q) ||
          t.teacher_profiles?.department?.toLowerCase().includes(q) ||
          t.institution?.name?.toLowerCase().includes(q)
      )
    );
  }, [search, teachers]);

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Teachers</h1>
      <p className={styles.pageDesc}>
        Manage teacher accounts and assign them to institutions.
      </p>

      <div className={styles.pageHeader}>
        <input
          type="text"
          placeholder="Search by name, email, department, institution..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <button
          className={styles.addButton}
          onClick={() => setModalType("create")}
        >
          + Add Teacher
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Institution</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((t) => (
            <tr key={t.id}>
              <td>
                <code className={styles.instId}>{t.id}</code>
              </td>
              <td>{t.teacher_profiles?.full_name}</td>
              <td>{t.email}</td>
              <td>{t.teacher_profiles?.department}</td>
              <td>{t.institution?.name || "-"}</td>
              <td>
                <button
                  onClick={() => {
                    setFormData({
                      id: t.id,
                      full_name: t.teacher_profiles?.full_name,
                      department: t.teacher_profiles?.department,
                      email: t.email,
                      institution_id: t.institution_id,
                    });
                    setModalType("edit");
                  }}
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {modalType && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>{modalType === "create" ? "Add Teacher" : "Edit Teacher"}</h2>
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
