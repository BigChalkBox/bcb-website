"use client";

import styles from "../dashboard/dashboard.module.css";

export default function AnalyticsPage() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Usage Analytics</h1>
      <p className={styles.pageDesc}>
        Track platform usage across institutions, teachers, and students.
      </p>

      <div className={styles.placeholderBox}>
        📊 Charts and reports will be shown here.
      </div>
    </div>
  );
}
