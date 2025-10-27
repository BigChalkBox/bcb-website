"use client";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function SignInPage() {

const supabase = createClientComponentClient();

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Invalid email or password.");
      return;
    }

    // Fetch role from users table
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (!userData) {
      setErrorMsg("No account found. Contact admin.");
      return;
    }

    // Redirect based on role
    if (userData.role === "superadmin") router.push("/admin/dashboard");
    else if (userData.role === "teacher") router.push("/teacher/dashboard");
    else if (userData.role === "student") router.push("/student/dashboard");
    else setErrorMsg("Invalid role. Contact admin.");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>DASES Login</h1>
        <form onSubmit={handleSignIn} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errorMsg && <p className={styles.error}>{errorMsg}</p>}
          <button type="submit" className={styles.button}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
