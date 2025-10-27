"use client";

import React, { useEffect, useState } from "react";
import styles from "../dashboard/dashboard.module.css";
import Header from "@/components/HeaderSub";

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [instUsers, setInstUsers] = useState({ teachers: [], students: [] });

  const [modalType, setModalType] = useState(null); // "create" | "edit"
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  // Fetch all institutions
  const fetchInstitutions = async () => {
    const res = await fetch("/api/admin/get-institutions");
    const data = await res.json();
    if (!data.error) {
      setInstitutions(data);
      setFiltered(data);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  // Expand institution to see users
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

  // Delete institution
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this institution?")) return;

    const res = await fetch("/api/admin/delete-institution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (result.error) alert("❌ " + result.error);
    else {
      alert("✅ Institution deleted");
      fetchInstitutions();
    }
  };

  // Handle form input
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle submit for create/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    let url =
      modalType === "create"
        ? "/api/admin/create-institution"
        : "/api/admin/edit-institution";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    if (result.error) setMessage("❌ " + result.error);
    else {
      setMessage("✅ Success!");
      fetchInstitutions();
      setTimeout(() => {
        setModalType(null);
        setMessage("");
        setFormData({});
      }, 800);
    }
  };

  // Handle search
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(institutions);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      institutions.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          (i.address && i.address.toLowerCase().includes(q))
      )
    );
  }, [search, institutions]);

  return (


    <>
    
<Header/>

    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Institutions</h1>
      <p className={styles.pageDesc}>
        Manage all institutions, view their teachers and students.
      </p>

      <div className={styles.pageHeader}>
        <input
          type="text"
          placeholder="Search by name, ID, or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <button
          className={styles.addButton}
          onClick={() => setModalType("create")}
        >
          + Add Institution
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Teachers</th>
            <th>Students</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((inst) => (
            <React.Fragment key={inst.id}>
              <tr>
                <td>
                  <code className={styles.instId}>{inst.id}</code>
                </td>
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
                  <button
                    onClick={() => {
                      setFormData(inst);
                      setModalType("edit");
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(inst.id)}>Delete</button>
                </td>
              </tr>
              {expanded === inst.id && (
                <tr>
                  <td colSpan="6">
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

      {/* Modal */}
      {modalType && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>
              {modalType === "create"
                ? "Create Institution"
                : "Edit Institution"}
            </h2>
            <form onSubmit={handleSubmit} className={styles.form}>
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

</>

  );
}
