'use client';

import React, { useState } from 'react';
import styles from './HeroSection.module.css';
import Image from 'next/image';
import logo from "../../public/logo/dases-final.png";
import navlogo from "../../public/logo/NavLogo.png";
import Link from 'next/link';
import metricsimg from "../../public/images/metricsIllustration.png";

const HeroSection = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>


              {/* NAVBAR */}
          <nav className={styles.navbar}>

            {/* Logo */}
            <Link href="/" className={styles.logo}>
              <Image
                src={navlogo}
                alt="Answer Sheet Evaluation Logo"
                width={120}
                height={50}
                priority
                />
            </Link>

            {/* ✅ HAMBURGER BUTTON */}
            <div
              className={`${styles.hamburger} ${menuOpen ? styles.active : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              >
              <span></span>
              <span></span>
              <span></span>
            </div>

            {/* ✅ Middle Nav Menu */}
            <div className={`${styles.menuBox} ${menuOpen ? styles.open : ''}`}>
              <Link href="/" className={styles.navLink}>Home</Link>
              <Link href="#about" className={styles.navLink}>About</Link>
              <Link href="#services" className={styles.navLink}>Services</Link>
              <Link href="#faqs" className={styles.navLink}>FAQ&apos;s</Link>
              <Link href="#bookDemo" className={styles.navLink}>Contact</Link>
            </div>

            {/* Sign in */}
            <Link href="/SignIn" className={styles.signIn}>SIGN IN</Link>
          </nav>



      <div className={styles.papahero}>
        <div className={styles.heroContainer}>



          {/* HERO CONTENT */}
          <div className={styles.innercontainer}>
            <div className={styles.logoBox}>
              <Image
                src={logo}
                alt="Answer Sheet Evaluation Logo"
                width={0}
                height={0}
                priority
                style={{ width: "100%", height: "auto" }}
              />
            </div>

            <div className={styles.innercontainercontent}>
              <h2>Intelligent System.</h2>
            </div>

            {/* BUTTON GROUP (left untouched) */}
            <div className={styles.buttonGroup}>
              {/* Sign In BTN */}
              <Link href="/SignIn" aria-label="Sign In"  className={styles.linkButton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="242" height="110" viewBox="0 0 242 110" fill="none">
                  <rect x="26" y="28" width="190" height="54" fill="#388D33" stroke="#555555" strokeWidth="2" />
                  <rect x="25" width="1" height="27" fill="url(#paint0_linear_1_33)" />
                  <rect x="242" y="27" width="1" height="25" transform="rotate(90 242 27)" fill="url(#paint1_linear_1_33)" />
                  <rect x="217" y="110" width="1" height="27" transform="rotate(-180 217 110)" fill="url(#paint2_linear_1_33)" />
                  <rect y="83" width="0.999999" height="25" transform="rotate(-90 0 83)" fill="url(#paint3_linear_1_33)" />

                  {/* ✅ Centered Button Text */}
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="22"
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                  >
                    Sign In
                  </text>

                  <defs>
                    <linearGradient id="paint0_linear_1_33" x1="25.5" y1="0" x2="25.5" y2="27" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#555555" stopOpacity="0" />
                      <stop offset="1" stopColor="#555555" />
                    </linearGradient>
                    <linearGradient id="paint1_linear_1_33" x1="242.5" y1="27" x2="242.5" y2="52" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#555555" stopOpacity="0" />
                      <stop offset="1" stopColor="#555555" />
                    </linearGradient>
                    <linearGradient id="paint2_linear_1_33" x1="217.5" y1="110" x2="217.5" y2="137" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#555555" stopOpacity="0" />
                      <stop offset="1" stopColor="#555555" />
                    </linearGradient>
                    <linearGradient id="paint3_linear_1_33" x1="0.499999" y1="83" x2="0.499999" y2="108" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#555555" stopOpacity="0" />
                      <stop offset="1" stopColor="#555555" />
                    </linearGradient>
                  </defs>
                </svg>
              </Link>




              <Link href="https://test-dases.vercel.app/" aria-label="Sign In"  className={styles.linkButton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="242" height="110" viewBox="0 0 242 110" fill="none">
                  <rect x="26" y="28" width="190" height="54" fill="#388D33" stroke="#555555" strokeWidth="2" />
                  <rect x="25" width="1" height="27" fill="url(#paint0_linear_1_33)" />
                  <rect x="242" y="27" width="1" height="25" transform="rotate(90 242 27)" fill="url(#paint1_linear_1_33)" />
                  <rect x="217" y="110" width="1" height="27" transform="rotate(-180 217 110)" fill="url(#paint2_linear_1_33)" />
                  <rect y="83" width="0.999999" height="25" transform="rotate(-90 0 83)" fill="url(#paint3_linear_1_33)" />

                  {/* ✅ Centered Button Text */}
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="22"
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                  >
                    View Sample
                  </text>

                  <defs>
                    <linearGradient id="paint0_linear_1_33" x1="25.5" y1="0" x2="25.5" y2="27" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#555555" stopOpacity="0" />
                      <stop offset="1" stopColor="#555555" />
                    </linearGradient>
                    <linearGradient id="paint1_linear_1_33" x1="242.5" y1="27" x2="242.5" y2="52" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#555555" stopOpacity="0" />
                      <stop offset="1" stopColor="#555555" />
                    </linearGradient>
                    <linearGradient id="paint2_linear_1_33" x1="217.5" y1="110" x2="217.5" y2="137" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#555555" stopOpacity="0" />
                      <stop offset="1" stopColor="#555555" />
                    </linearGradient>
                    <linearGradient id="paint3_linear_1_33" x1="0.499999" y1="83" x2="0.499999" y2="108" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#555555" stopOpacity="0" />
                      <stop offset="1" stopColor="#555555" />
                    </linearGradient>
                  </defs>
                </svg>
              </Link>


            </div>


          </div>

          <div className={styles.metrics}>
            <Image 
            src={metricsimg} 
            alt="Metrics" 
            width={0}
              height={0}
              priority
              className={styles.metricsimgs}
              />


          </div>

        </div>
      </div>

    </>
  );
};

export default HeroSection;
