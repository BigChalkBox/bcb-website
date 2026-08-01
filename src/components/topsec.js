"use client";

import styles from "./topsec.module.css";

export default function Topsec() {
  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <h1 className={styles.logo}>Answer Sheet Evaluation</h1>
        <p className={styles.tagline}>
          THE AI-POWERED EVALUATION SYSTEM FOR MODERN EDUCATION.
        </p>
      </div>

      <div className={styles.divider}></div>

      <nav className={styles.nav}>
        <a href="#about">ABOUT</a>
        <a href="#features">FEATURES</a>
        <a href="#contact">CONTACT</a>
      </nav>

      <div className={styles.checkerBar}></div>
    </header>
  );
}
