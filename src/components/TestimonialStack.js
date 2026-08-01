"use client";

import styles from "./TestimonialStack.module.css";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

const testimonials = [
  {
    quote:
      "This system dramatically improved our evaluation turnaround time while maintaining academic rigor. Our faculty can now focus more on teaching and mentorship.",
    name: "Dr. Sanjeev Kumar",
    title: "Professor",
    img: "/images/image.png"
  },
  {
    quote:
      "We saw immediate impact. Faster grading, consistent rubrics, and detailed student feedback: the evaluation engine has set a new benchmark.",
    name: "Prof. Lalit Sachan",
    title: "Director AI/ML",
    img: "/images/image.png"
  },

];

export default function TestimonialStack() {
  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState(false);
  const slideTime = 5000;
  const timerRef = useRef(null);

  const next = () => {
    setFlip(true);
    setTimeout(() => {
      setIndex((i) => (i + 1) % testimonials.length);
      setFlip(false);
    }, 500);
  };

  const prev = () => {
    setFlip(true);
    setTimeout(() => {
      setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
      setFlip(false);
    }, 500);
  };

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(timerRef.current);
  }, []);

  function startAutoSlide() {
    timerRef.current = setInterval(next, slideTime);
  }

  const t = testimonials[index];

  return (
    <section className={styles.section}>

      <div className={styles.left}>
        <div className={`${styles.cardBack} ${flip && styles.stackMove}`}></div>
        <div className={`${styles.cardMid} ${flip && styles.stackMoveMid}`}></div>

        <div className={`${styles.cardMain} ${flip && styles.flip}`}>
          <p className={styles.quote}>{t.quote}</p>

          <div className={styles.userRow}>
            <Image src={t.img} width={45} height={45} className={styles.avatar} alt="" />
            <div>
              <strong>{t.name}</strong>
              <div className={styles.userTitle}>{t.title}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Updated CTA Section */}
      <div className={styles.right}>
        <p className={styles.tag}>Ready for the Future of Grading?</p>
        <h2 className={styles.heading}>Transform Assessment with AI-Powered Evaluation</h2>
        <p className={styles.sub}>
          Join the institutions redefining descriptive evaluation. Increase fairness, speed, and transparency without compromising academic integrity.
        </p>

        <div className={styles.navBtns}>
          <button className={styles.navBtn} onClick={prev}>←</button>
          <button className={styles.navBtn} onClick={next}>→</button>
        </div>


      </div>
    </section>
  );
}
