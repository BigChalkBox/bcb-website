"use client";

import { useState } from "react";
import styles from "./BookDemoForm.module.css";
import confetti from "canvas-confetti";

export default function BookDemoForm() {
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fireConfetti = () => {
    const duration = 2 * 1000; // 2 seconds
    const end = Date.now() + duration;

    (function frame() {
      // Burst from random positions
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");

    try {
      const response = await fetch("https://sheetdb.io/api/v1/vksbsahrgkwky", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [
            {
              ...formData,
              created_at: new Date().toLocaleString("en-IN"),
            },
          ],
        }),
      });

      if (response.ok) {
        setStatus("✅ Request submitted successfully. We are excited contact you soon!");
        fireConfetti();
        setFormData({});
        e.target.reset();
      } else {
        setStatus("❌ Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("⚠️ Network error. Please try again later.");
    }
  };

  return (
    <section id="bookDemo" className={styles.formSection}>
      <div className={styles.formContainer}>
        <h2 className={styles.formTitle}>Just a few quick details</h2>
        <p>Experience DASES in action — see how AI transforms evaluation.</p>

        <hr></hr>

        <br></br>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="designation"
              placeholder="Designation / Role"
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.row}>
            <input
              type="text"
              name="institution_name"
              placeholder="Institution Name"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="department"
              placeholder="Department / Course"
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.row}>
            <input
              type="email"
              name="email"
              placeholder="Official Email"
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.row}>
            <select name="demo_mode" onChange={handleChange} required>
              <option value="">Select Demo Mode</option>
              <option value="Online">Online (Google Meet)</option>
              <option value="Offline">Offline (In-Person)</option>
            </select>

            <input
              type="date"
              name="preferred_date"
              onChange={handleChange}
              required
            />
            <input
              type="time"
              name="preferred_time"
              onChange={handleChange}
              required
            />
          </div>

          <textarea
            name="comments"
            placeholder="Any specific requirements or notes?"
            onChange={handleChange}
          ></textarea>

          <button type="submit" className={styles.submitButton}>
            Submit Request
          </button>

          {status && <p className={styles.status}>{status}</p>}
        </form>
      </div>
    </section>
  );
}
