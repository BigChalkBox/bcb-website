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
  <section id="bookDemo" className={styles.section}>
    <div className={styles.wrapper}>

      {/* Left Side — Form */}
      <div className={styles.left}>
        <h2 className={styles.heading}>Get In Touch</h2>
        <p className={styles.sub}>
          Drop your details & we’ll reach out quickly.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <input type="text"  className={styles.input} name="full_name" placeholder="Full Name" onChange={handleChange} required />
            <input type="text"  className={styles.input} name="designation" placeholder="Designation / Role" onChange={handleChange} required />
          </div>

          <div className={styles.row}>
            <input type="text" className={styles.input}  name="institution_name" placeholder="Institution Name" onChange={handleChange} required />
            <input type="text" className={styles.input}  name="department" placeholder="Department / Course" onChange={handleChange} required />
          </div>

          <div className={styles.row}>
            <input type="email" className={styles.input}  name="email" placeholder="Official Email" onChange={handleChange} required />
            <input type="tel" className={styles.input}  name="phone" placeholder="Phone Number" onChange={handleChange} required />
          </div>

          <div className={styles.row}>
            <select name="demo_mode" className={styles.select} onChange={handleChange} required>
              <option value="">Select Demo Mode</option>
              <option value="Online">Online (Google Meet)</option>
              <option value="Offline">Offline (In-Person)</option>
            </select>

            <input type="date" className={styles.input}  name="preferred_date" onChange={handleChange} required />
            <input type="time" className={styles.input}  name="preferred_time" onChange={handleChange} required />
          </div>

          <textarea name="comments" className={styles.textarea}  placeholder="Message / Notes?" onChange={handleChange}></textarea>

          <button type="submit" className={styles.submitButton}>Submit</button>

          {status && <p className={styles.status}>{status}</p>}
        </form>
      </div>

      {/* Right Side — Newsletter Card */}
      <div className={styles.newsCard}>
        <h3>Our Newsletters</h3>
        <p>Get updates, success stories & more.</p>

        <input type="email" placeholder="Email" className={styles.newsInput} />
        <button className={styles.newsBtn}>Subscribe</button>
      </div>
    </div>

    {/* Contact info boxes */}
    <div className={styles.bottomCards}>
      <div className={styles.infoCard}>
        <div className={styles.iconBox}>📞</div>
        <h4>+91 94118 08080</h4>
        <p>Reach us anytime on call</p>
      </div>

      <div className={styles.infoCard}>
        <div className={styles.iconBox}>📧</div>
        <h4>pkonalupes@gmail.com</h4>
        <p>We reply super fast</p>
      </div>

      <div className={styles.infoCard}>
        <div className={styles.iconBox}>📍</div>
        <h4>UPES Bidholi Campus</h4>
        <p>Dehradun, India</p>
      </div>
    </div>
  </section>
);

}
