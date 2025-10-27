import Link from "next/link";
import styles from "./WhyDases.module.css";
import { FaChalkboardTeacher, FaUserGraduate, FaUniversity, FaUsers } from "react-icons/fa";

export default function WhyDASES() {
  return (
    <section className={styles.section}>
      <div className={styles.left}>
        <p className={styles.subtitle}>/ Why

          <span> </span>

          <span className={styles.subtitle1}>
            DASES?
          </span>

        </p>
        <span className={styles.title}>The Smarter Choice For Everyone</span>
        <p className={styles.description}>
          DASES makes evaluation effortless — built for teachers, empowering students,
          and scalable for institutions. One platform that works for everyone.
        </p>
        <div className={styles.actions}>
          <Link href="#demo" className={styles.link}


            onClick={() => {
              const el = document.getElementById("bookDemo");
              el?.scrollIntoView({ behavior: "smooth" });
              setTimeout(() => {
                el?.classList.add("highlight");
                setTimeout(() => el?.classList.remove("highlight"), 2000);
              }, 700);
            }}

          >  Book Demo Now
          </Link>
          <Link href="#contact" className={styles.link}>
            Sample Report
          </Link>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <FaChalkboardTeacher className={styles.icon} />
          <div>
            <h3>For Teachers</h3>
            <p>
              Save hours with automated evaluation, instant reports, and AI-driven rubrics —
              focus more on teaching, less on paperwork.
            </p>
          </div>
        </div>

        <div className={styles.card1}>
          <FaUserGraduate className={styles.icon} />
          <div>
            <h3>For Students</h3>
            <p>
              Get fair, unbiased scoring and constructive feedback that helps improve
              learning outcomes and confidence.
            </p>
          </div>
        </div>

        <div className={styles.card}>
          <FaUniversity className={styles.icon} />
          <div>
            <h3>For Institutions</h3>
            <p>
              Scale evaluations effortlessly, ensure consistency across classes,
              and access analytics for smarter decisions.
            </p>
          </div>
        </div>

        <div className={styles.card2}>
          <FaUsers className={styles.icon} />
          <div>
            <h3>For Admins</h3>
            <p>
              Monitor progress, streamline exam workflows, and maintain transparency —
              all from one secure platform.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
