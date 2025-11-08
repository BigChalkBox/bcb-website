"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "./Headersample.module.css";
import logo from "../../public/logo/navbar-logo.png"; // ✅ Update if your logo is elsewhere

export default function Header() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
    const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className={styles.header}
    >
      <div className={styles.logo}>
        <Link href="/">


        <Image
          src={logo}// put your logo in public/mylogo.png
          alt="My Logo"
          width={80}
          height={30}
          priority
        />
        
    
        
        </Link>
      </div>

      <nav className={styles.nav}>
        <Link href="/">Home</Link>
        <Link href="/SignIn">SignIn</Link>
        <Link href="#bookDemo">Contact</Link>
      </nav>

      <button
        className={styles.menuToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
    </header>
  );
}
rafce