"use client";

import { useState } from "react";
import styles from "./SampleReportPage.module.css";

import BookDemoForm from "@/components/BookDemoForm";
import Header from "@/components/Header";
import ReportView from "./ReportView";
import reportData from "./report-data.json";

const TABS = {
  question: { title: "Question Paper", kind: "pdf", url: "/samples/question_paper.pdf" },
  answer: { title: "Answer Sheet", kind: "pdf", url: "/samples/answer_sheet.pdf" },
  report: { title: "Evaluation Report", kind: "report" },
};

export default function SampleReportPage() {
  const [activeTab, setActiveTab] = useState("report");
  const active = TABS[activeTab];

  return (
    <>
      <Header />

      <section className={styles.pageSection}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>Sample Evaluation Report</h1>
            <p className={styles.subtitle}>
              Explore a live example of an AI-generated evaluation report below.
            </p>
          </header>

          <div className={styles.tabs}>
            {Object.entries(TABS).map(([key, data]) => (
              <button
                key={key}
                className={`${styles.tabButton} ${activeTab === key ? styles.active : ""}`}
                onClick={() => setActiveTab(key)}
              >
                {data.title}
              </button>
            ))}
          </div>

          {active.kind === "pdf" ? (
            <div className={styles.viewer}>
              <iframe src={active.url} className={styles.pdfFrame} title={active.title}></iframe>
            </div>
          ) : (
            <div className={styles.reportWrapper}>
              <ReportView data={reportData} downloadHref="/samples/evaluation_report.pdf" />
            </div>
          )}
        </div>
      </section>
      <BookDemoForm />

      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Simplify Evaluation & Save Hours?</h2>
          <p className={styles.ctaDescription}>
            Join leading institutions that trust DASES for faster, fairer, and smarter assessments.
          </p>
          <button
            className={styles.primaryButton}
            onClick={() => {
              const el = document.getElementById("bookDemo");
              el?.scrollIntoView({ behavior: "smooth" });
              setTimeout(() => {
                el?.classList.add("highlight");
                setTimeout(() => el?.classList.remove("highlight"), 2000);
              }, 700);
            }}
          >
            Book Your Free Demo
          </button>
        </div>
      </section>
    </>
  );
}

