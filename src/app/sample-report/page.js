"use client";

import { useState, useEffect } from "react";
import styles from "./SampleReportPage.module.css";

import BookDemoForm from "@/components/BookDemoForm";
import Header from "@/components/Header";


export default function SampleReportPage() {
    const [baseUrl, setBaseUrl] = useState("");

    useEffect(() => {
        // Automatically set base URL (localhost, vercel, or any domain)
        if (typeof window !== "undefined") {
            setBaseUrl(window.location.origin);
        }
    }, []);

    const pdfs = {
        question: { title: "Question Paper", url: "/samples/question_paper.pdf" },
        answer: { title: "Answer Sheet", url: "/samples/answer_sheet.pdf" },
        report: {
            title: "Evaluation Report",
            url: `${baseUrl}/reports/dd73eef3-3697-4823-b8b0-e35f1d3645d8`,
        },
    };

    const [activeTab, setActiveTab] = useState("report");

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
                        {Object.entries(pdfs).map(([key, data]) => (
                            <button
                                key={key}
                                className={`${styles.tabButton} ${activeTab === key ? styles.active : ""
                                    }`}
                                onClick={() => setActiveTab(key)}
                            >
                                {data.title}
                            </button>
                        ))}
                    </div>

                    {baseUrl ? (
                        <div className={styles.viewer}>
                            <iframe
                                src={pdfs[activeTab].url}
                                className={styles.pdfFrame}
                                title={pdfs[activeTab].title}
                            ></iframe>
                        </div>
                    ) : (
                        <p className={styles.loading}>Loading viewer...</p>
                    )}
                </div>
            </section>
            <BookDemoForm />


            {/* Footer CTA */}
            <section className={styles.ctaSection}>
                <div className={styles.ctaContent}>
                    <h2 className={styles.ctaTitle}>Ready to Simplify Evaluation & Save Hours?</h2>
                    <p className={styles.ctaDescription}>
                        Join leading institutions that trust DASES for faster, fairer, and smarter assessments.
                    </p>
                    <button className={styles.primaryButton}
                        onClick={() => {
                            const el = document.getElementById("bookDemo");
                            el?.scrollIntoView({ behavior: "smooth" });
                            setTimeout(() => {
                                el?.classList.add("highlight");
                                setTimeout(() => el?.classList.remove("highlight"), 2000);
                            }, 700);
                        }}

                    >Book Your Free Demo</button>
                </div>
            </section>



        </>
    );
}
