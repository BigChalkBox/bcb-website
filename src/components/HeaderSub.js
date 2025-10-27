"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "./HeaderSub.module.css";
import logo from "../../public/logo/navbar-logo.png"; // ✅ Update if your logo is elsewhere

export default function Header() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error);
      alert("Error during logout.");
    } else {
      router.push("/DASESLanding");
    }

    setLoading(false);
  };

  return (
    <header className={styles.header}>
      {/* Left: Logo */}
      <div className={styles.logo}>
        <Link href="/">
          <Image
            src={logo}
            alt="DASES Logo"
            width={80}
            height={30}
            priority
          />
        </Link>
      </div>

      {/* Right: Logout Button */}
      <button
        className={styles.logoutButton}
        onClick={handleLogout}
        disabled={loading}
      >
        {loading ? "Logging out..." : "🚪 Logout"}
      </button>
    </header>
  );
}
