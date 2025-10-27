"use client";

import React, { useState, useEffect } from "react";
import styles from "../dashboard/dashboard.module.css";

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [message, setMessage] = useState("");

  // Fetch settings
  const fetchSettings = async () => {
    const res = await fetch("/api/admin/get-settings");
    const data = await res.json();
    if (!data.error) setSettings(data);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle toggle/update
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    const res = await fetch("/api/admin/update-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const result = await res.json();
    if (result.error) setMessage("❌ " + result.error);
    else setMessage("✅ Settings updated!");
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Settings</h1>
      <p className={styles.pageDesc}>
        Configure platform-wide settings for admins, institutions, and security.
      </p>

      {/* Platform Settings */}
      <section className={styles.settingsSection}>
        <h2>Platform Settings</h2>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            name="allow_student_self_reports"
            checked={settings.allow_student_self_reports || false}
            onChange={handleChange}
          />
          Allow students to upload their own reports
        </label>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            name="enable_analytics"
            checked={settings.enable_analytics || false}
            onChange={handleChange}
          />
          Enable usage analytics
        </label>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            name="enable_notifications"
            checked={settings.enable_notifications || false}
            onChange={handleChange}
          />
          Enable email notifications
        </label>
      </section>

      {/* Security Settings */}
      <section className={styles.settingsSection}>
        <h2>Security Settings</h2>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            name="force_password_reset"
            checked={settings.force_password_reset || false}
            onChange={handleChange}
          />
          Force password reset on next login
        </label>
      </section>

      {/* Danger Zone */}
      <section className={`${styles.settingsSection} ${styles.dangerZone}`}>
        <h2>Danger Zone</h2>
        <button
          className={styles.deleteButton}
          onClick={() => alert("⚠️ Institution reset not implemented yet")}
        >
          Reset Institution Data
        </button>
      </section>

      {message && <p>{message}</p>}

      <button className={styles.addButton} onClick={handleSave}>
        Save Settings
      </button>
    </div>
  );
}
