// src/components/Reviews.js
"use client";
import React, { useRef } from "react";
import Slider from "react-slick";
import Image from "next/image";
import styles from "./Reviews.module.css";



const testimonials = [
  {
    text: "DASES has transformed our evaluation process. What used to take weeks now takes days, and the consistency across evaluators has improved dramatically.",
    name: "Dr. Sahara Mittal",
    title: "Academic Dean",
  },
  {
    text: "The automation and consistency of DASES have saved us countless hours while improving evaluation fairness.",
    name: "Prof. R. Sharma",
    title: "Head of Department",
  },
  {
    text: "DASES ensures every student gets unbiased feedback while making the evaluation process smooth for faculty.",
    name: "Dr. Meera Kapoor",
    title: "Associate Professor",
  },
];

export default function Reviews() {
  const sliderRef = useRef(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 4000,
    dotsClass: `slick-dots ${styles.slickdots}`,
  };

  return (
    <div className={styles.container}>
      {/* Left Logo */}
      <div className={styles.logo}>
        <Image
          src="/logo/logo-t.png"
          alt="D Logo"
          width={120}
          height={120}
        />
      </div>

      {/* Yellow box with slider */}
      <div className={styles.contentBox}>
        <div className={styles.sliderArea}>
          <Slider ref={sliderRef} {...settings}>
            {testimonials.map((t, i) => (
              <div key={i} className={styles.textBox}>
                <p className={styles.text}>&quot;{t.text}&quot;</p>
                <p className={styles.name}>{t.name}</p>
                <p className={styles.title}>{t.title}</p>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Custom Next Button */}
      <button
        className={styles.nextBtn}
        onClick={() => sliderRef.current?.slickNext()}
      >
        &gt;
      </button>
    </div>
  );
}
