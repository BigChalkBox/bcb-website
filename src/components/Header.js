"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import logo from "../../public/logo/navbar-logo.png"
import Image from "next/image";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 1000) {
        setShowHeader(true);
      } else {
        setShowHeader(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`${styles.header} ${showHeader ? styles.visible : ""}`}
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

      <nav className={`${styles.nav} ${isOpen ? styles.open : ""}`}>
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
