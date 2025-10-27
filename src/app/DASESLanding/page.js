// src/app/DASESLanding/page.js
"use client";

import Header from '@/components/Header';
import styles from './page.module.css';
import Image from "next/image";

import logo from '../../../public/logo/logo.png'
import FeatureCircle from '@/components/FeatureCircle';
import WhyDases from '@/components/WhyDASES';
import Reviews from '@/components/Reviews';
import Link from "next/link";
import BookDemoForm from '@/components/BookDemoForm';





export default function Home() {




  return (



    <>
      <Header />
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              From Handwritten Answers to <br />
              <span className={styles.heroTitleAccent}>Verified Insights</span>
            </h1>





            <h1 className={styles.heroSubTitle}>
              Real-time evaluation without accuracy loss.
            </h1>
            <h2 className={styles.heroSubTitle1}>Faster evaluation. Up to

              <span className={styles.heroTitleAccent}> 95% </span>
              time saved.
            </h2>
            <h2 className={styles.heroSubTitle1}>
              Low-effort grading to preserve teaching quality.
            </h2>







            <Link href="/SignIn">
              <button className={styles.primaryButton}>Sign In</button>
            </Link>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.flowContainer}>
              <div className={styles.flowItem}>
                <div className={styles.flowBox}>
                  <svg className={styles.flowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className={styles.flowLabel}>Upload Paper</span>
              </div>

              <div className={styles.flowArrow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              <div className={styles.flowItem}>
                <div className={styles.flowBox}>
                  <svg className={styles.flowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className={styles.flowLabel}>Smart AI Evaluation</span>
              </div>

              <div className={styles.flowArrow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              <div className={styles.flowItem}>
                <div className={styles.flowBox}>
                  <svg className={styles.flowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className={styles.flowLabel}>Instant Report</span>
              </div>
            </div>
          </div>

        </section>




        <section className={styles.logoSection}>
          <div className={styles.logoWrapper}>
            <Image
              src={logo}// put your logo in public/mylogo.png
              alt="My Logo"
              width={200}
              height={200}
              className={styles.logo}
              priority
            />
          </div>
          <h2 className={styles.caption}>Empowering educators with intelligent, automated, and fair evaluations!</h2>


          <div className={styles.buttonWrapper} >


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



            <button className={styles.primaryButton}

              //on click navigate to sample-report
              onClick={() => { window.location.href = '/sample-report'; }}



            >

              View Sample Report</button>
          </div>
        </section>

        {/* How It Works */}
        <section className={styles.section}>
          <div className={styles.sectionContent}>

            <div className={styles.sectionTitleHeading}>

              <h2 className={styles.sectionTitle}>Smarter Workflows. Stronger Outcomes.</h2>
              <p>Seamlessly move from input to insight with an AI-powered process that scales with your organization.</p>

            </div>
            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>01</div>
                <h3 className={styles.stepTitle}>Upload</h3>
                <p className={styles.stepDesc}>Seamlessly submit your papers in seconds — no hassle, no waiting.</p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>02</div>
                <h3 className={styles.stepTitle}>Extract</h3>
                <p className={styles.stepDesc}>Our AI instantly understands and organizes responses with pinpoint accuracy.</p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>03</div>
                <h3 className={styles.stepTitle}>Score</h3>
                <p className={styles.stepDesc}>Get fair, fast, and detailed scoring designed to save hours of manual effort.</p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>04</div>
                <h3 className={styles.stepTitle}>Generate</h3>
                <p className={styles.stepDesc}>Receive polished reports packed with insights you can trust — instantly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}


        <div className={styles.sectionTitleHeading1}>

          <h2 className={styles.sectionTitle}>Everything You Need, Done For You</h2>
          <p>Let DASES handle the workload while you stay in control.</p>

        </div>


        <FeatureCircle />





        {/* Why DASES */}
        {/* Why DASES */}
        {/* <section className={styles.section}>
  <div className={styles.sectionContent}>
    <h2 className={styles.sectionTitle}>Why DASES?</h2>

    <div className={styles.benefitsGrid}>
      {[
        {
          title: "For Institutions",
          items: [
            "Saves evaluation time by up to 70%",
            "Ensures fairness across all departments",
            "Reduces operational costs significantly"
          ]
        },
        {
          title: "For Teachers",
          items: [
            "Provides structured, actionable feedback",
            "Reduces manual grading workload",
            "More time for meaningful student interaction"
          ]
        },
        {
          title: "For Students",
          items: [
            "Clear insights into performance metrics",
            "Detailed feedback for continuous improvement",
            "Transparent and fair evaluation process"
          ]
        }
      ].map((group, idx) => (
        <div key={idx} className={styles.benefitCard}>
          <h3 className={styles.benefitTitle}>{group.title}</h3>
          <div className={styles.benefitContent}>
            {group.items.map((text, i) => (
              <div key={i} className={styles.benefitItem}>
                <div className={styles.benefitIcon}></div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
</section> */}


        <WhyDases />

        {/* Social Proof */}

        <section className={styles.sectionAlt1}>
          <div className={styles.sectionAlt1}>
            <div className={styles.sectionTitleHeading1}>
              <h2 className={styles.sectionTitle}>Trusted by Institutions That Shape the Future</h2>
              <p>From classrooms to universities, DASES empowers educators and delivers results institutions can rely on.</p>
            </div>


            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>10,000+</div>
                <div className={styles.statLabel}>Sheets Processed</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statNumber}>95%</div>
                <div className={styles.statLabel}>Rubric Accuracy</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statNumber}>500+</div>
                <div className={styles.statLabel}>Happy Educators</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statNumber}>24/7</div>
                <div className={styles.statLabel}>Support Available</div>
              </div>
            </div>
            <Reviews />
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

      </div>
    </>
  );
}

