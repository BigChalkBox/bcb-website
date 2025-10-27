"use client";
import { useEffect, useState } from "react";
import styles from "./FeatureCircle.module.css"

const sections = [

  {
    id: 1,
    title: "Create Sample Answers",
    text: "Produce benchmark sample answers instantly, giving evaluators a clear standard to follow."
  },
  {
    id: 2,
    title: "Generate Fair Rubrics",
    text: "Let AI design clear, unbiased rubrics tailored to your exam needs — you stay in control of the final call."
  },
  {
    id: 3,
    title: "Print Answer Sheets",
    text: "Get as many printable answer sheets as required, perfectly formatted and ready to distribute."
  },
  {
    id: 4,
    title: "Upload & Scan",
    text: "Easily scan and upload handwritten or typed sheets — the platform processes them with precision."
  },
  {
    id: 5,
    title: "Get Detailed Reports",
    text: "Receive polished, professional reports packed with results, analytics, and insights — instantly shareable."
  }
];


export default function FeatureCircle() {
    const [active, setActive] = useState(1);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActive(Number(entry.target.dataset.id));
                    }
                });
            },
            { threshold: 0.6 }
        );

        document.querySelectorAll("section").forEach((sec) => observer.observe(sec));

        return () => observer.disconnect();
    }, []);

    return (

        <>

            <div className={styles.container}>

                {/* Enhanced sidebar */}
                <div className={styles.sidebar}>
                    <div className={styles.sidebarContent}>
                        {sections.map((s, index) => (
                            <div
                                key={s.id}
                                className={`${styles.numberContainer} ${active === s.id ? styles.active : ""}`}
                            >
                                <div className={styles.number}>
                                    {String(s.id).padStart(2, "0")}
                                </div>
                                <div className={styles.indicator}></div>
                                {index < sections.length - 1 && <div className={styles.connector}></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Enhanced main content */}
                <div className={styles.content}>
                    <div className={styles.contentWrapper}>
                        {sections.map((s) => (
                            <section key={s.id} data-id={s.id} className={styles.section}>
                                <div className={styles.sectionContent}>
                                    <div className={styles.badge}>Feature {s.id}</div>
                                    <h2 className={styles.title}>{s.title}</h2>
                                    <p className={styles.text}>{s.text}</p>
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}