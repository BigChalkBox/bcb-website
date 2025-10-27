"use client";
import { useState } from "react";
import styles from "./AnswerSheets.module.css";
import Header from "@/components/HeaderSub";

export default function AnswerSheetGenerator() {
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/teacher/generate-answer-sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await res.blob();

    if (res.ok) {
      const url = window.URL.createObjectURL(result);
      const a = document.createElement("a");
      a.href = url;
      a.download = `answer_sheets_${formData.exam_id || "output"}.zip`;
      a.click();
      setMessage("✅ Download started!");
    } else {
      const text = await result.text();
      setMessage("❌ " + text);
    }

    setLoading(false);
  };

  return (
<>
<Header/>
    
    <div className={styles.container}>
      <h1>📘 Answer Sheet Generator</h1>
      <p>Generate printable answer booklets with unique QR codes.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input name="university_name" placeholder="University Name" required onChange={handleChange} />
        <input name="exam_id" placeholder="Exam ID (e.g. MATH101-2025)" required onChange={handleChange} />
        <input name="subject" placeholder="Subject" required onChange={handleChange} />
        <input name="date" placeholder="Date (e.g. May 10, 2025)" required onChange={handleChange} />
        <input name="num_students" type="number" placeholder="Number of Students" required onChange={handleChange} />
        <input name="main_pages" type="number" placeholder="Main Pages (default 6)" onChange={handleChange} />
        <input name="extra_pages" type="number" placeholder="Extra Pages (default 2)" onChange={handleChange} />

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Answer Sheets"}
        </button>
      </form>

      {message && <p className={styles.message}>{message}</p>}
    </div>

</>

  );
}
