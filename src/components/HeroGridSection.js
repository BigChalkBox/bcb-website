import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./HeroGridSection.module.css";
import Link from "next/link";

export default function HeroGridSection() {

    // ✅ GIFs + duration (in ms)
    const gifs = [
        { src: "/images/gif1.gif", duration: 5500 }, 
        { src: "/images/gif2.gif", duration: 5500 }, 
    ];

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrent((prev) => (prev + 1) % gifs.length);
        }, gifs[current].duration);

        return () => clearTimeout(timer);
    }, [current]);

    return (
        <section className={styles.hero}>
            {/* Left Section */}
            <div className={styles.left}>

                {/* ✅ Looping GIF container */}
                <div className={styles.heroImageWrapper}>
                    <Image
                        src={gifs[current].src}
                        alt="Water Animation"
                        fill
                        unoptimized
                        className={styles.heroImage}
                    />
                </div>

                {/* Small info cards */}
                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <h4>AI-Driven Accuracy</h4>
                        <p>Consistent, unbiased results every time.</p>
                    </div>

                    <div className={styles.infoCard}>
                        <h4>Faster Evaluation</h4>
                        <p>Grade descriptive answers in minutes.</p>
                    </div>

                    <div className={styles.infoCard}>
                        <h4>Smart Feedback</h4>
                        <p>Get rubric-based insights instantly.</p>
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className={styles.right}>
                <h1 className={styles.heading}>
                    Tired of the <br />  <span style={{color:'red'}} >Red</span> Pen Grind?
                </h1>
                <p className={styles.subtext}>
                    Traditional evaluation is broken. It's slow, subjective, and drains valuable time from teaching.
                    <br /><br />
                    <strong>DASES</strong> fixes it by combining OCR, LLMs, and structured rubrics to deliver fast, accurate & unbiased grading.
                </p>

                <div className={styles.buttons}>

                                       <Link href="#bookDemo">
                    <button className={styles.primaryBtn}>Try DASES</button>
                                       </Link>
                   <Link href="https://test-dases.vercel.app/">
                   <button className={styles.secondaryBtn}>See How It Works</button>
                   </Link> 
                </div>
            </div>
        </section>
    );
}
