// src/app/DASESLanding/page.js
"use client";

import styles from './page.module.css';




import WhyDases from '../../components/WhyDASES';
import Link from "next/link";
import BookDemoForm from '../../components/BookDemoForm';
import HeroSection from '../../components/HeroSection';
import HeroGridSection from '../../components/HeroGridSection';
import FeaturesFinal from '../../components/FeaturesFinal';
import TestimonialStack from '../../components/TestimonialStack';
import FAQSection from '../../components/FAQSection';






export default function Home() {




  return (



    <>


      <div className={styles.container}>





        <HeroSection />


        <HeroGridSection />


        <FeaturesFinal />





        <br />



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
                <div className={styles.statNumber}>400+</div>
                <div className={styles.statLabel}>Sheets Processed</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statNumber}>95%</div>
                <div className={styles.statLabel}>Rubric Accuracy</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statNumber}>20+</div>
                <div className={styles.statLabel}>Happy Educators</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statNumber}>24/7</div>
                <div className={styles.statLabel}>Support Available</div>
              </div>
            </div>


            <TestimonialStack />

          </div>
          <FAQSection />


        </section>




        <BookDemoForm />


        {/* Footer CTA */}

        <section className={styles.ctaSection}>
          <div className={styles.content}>
            <h2 className={styles.heading}>
              Ready for the Future of Grading?
            </h2>

            <p className={styles.sub}>
              Join the institutions transforming their assessment process.
              Improve consistency, save time, and deliver deeper learning outcomes.
            </p>

            <div className={styles.actions}>
              <Link href="#bookDemo" className={styles.primaryBtn}>
                Book a Live Demonstration
              </Link>

              <Link href="/technical-abstract" className={styles.secondaryBtn}>
                Read the Full Technical Abstract →
              </Link>
            </div>

            <p className={styles.trust}>
              Trusted by educators. Designed with academic integrity at the core.
            </p>
          </div>
        </section>



      </div>
    </>
  );
}

