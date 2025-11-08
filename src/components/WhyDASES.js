import Link from "next/link";
import styles from "./WhyDases.module.css";
import { FaChalkboardTeacher, FaUserGraduate, FaUniversity, FaUsers } from "react-icons/fa";

export default function WhyDASES() {
  return (
    <div className={styles.outerdiv} id="about" >
      <section className={styles.section}>
        <div className={styles.left}>
          <p className={styles.subtitle}> Why <span></span><span className={styles.subtitle1}>DASES?</span></p>
          
          <span className={styles.title}>Built for Educators. Designed for Results.</span>
          
          <p className={styles.description}>
            Traditional evaluation is broken. It's slow, subjective, and drains valuable time from teaching.
            <br /><br />
            <strong>DASES fixes it.</strong> We combine advanced OCR, Large Language Models (LLMs), 
            and structured rubrics to deliver accurate, unbiased grading in a fraction of the time.
          </p>

          <div className={styles.actions}>
            <Link
              href="#bookDemo"
              className={styles.link}
              onClick={() => {
                const el = document.getElementById("bookDemo");
                el?.scrollIntoView({ behavior: "smooth" });
                setTimeout(() => {
                  el?.classList.add("highlight");
                  setTimeout(() => el?.classList.remove("highlight"), 2000);
                }, 700);
              }}
            >
              Get a Demo
            </Link>

            <Link href="https://test-dases.vercel.app/" className={styles.link}>
              Try Sample Evaluation
            </Link>


          </div>

        
        </div>

        <div className={styles.right}>
          
          {/* Educators */}
          <div className={styles.card}>
            <FaChalkboardTeacher className={styles.icon} />
            <div>
              <h3>For Educators</h3>
              <p>
                Reduce grading time dramatically while preserving academic judgment.  
                Identify learning gaps with item-level analytics.  
                Deliver timely, actionable feedback students can use.
              </p>
            </div>
          </div>

          {/* Institutions */}
          <div className={styles.card1}>
            <FaUniversity className={styles.icon} />
            <div>
              <h3>For Institutions</h3>
              <p>
                Consistent evaluation across courses & cohorts.  
                Scalable even during peak exam seasons.  
                Data-driven insights via performance dashboards.
              </p>
            </div>
          </div>

          {/* Students */}
          <div className={styles.card}>
            <FaUserGraduate className={styles.icon} />
            <div>
              <h3>For Students</h3>
              <p>
                Clear, rubric-aligned feedback explaining scores & next steps.  
                Faster results for smoother learning cycles.  
                Greater fairness through standardized criteria.
              </p>
            </div>
          </div>

          {/* Trust & Responsibility */}
          <div className={styles.card2}>
            <FaUsers className={styles.icon} />
            <div>
              <h3>Trust & Responsibility</h3>
              <p>
                Human oversight with review controls.  
                Bias-aware rubric design & transparent scoring.  
                Privacy-respectful workflows that align with institutional standards.
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
