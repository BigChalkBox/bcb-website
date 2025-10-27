"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import logo from "../../public/logo/navbar-logo.png";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const pathname = usePathname(); // ✅ get the current route

  useEffect(() => {
    const handleScroll = () => {
      // ✅ Apply scroll logic only if:
      // 1. On /DASESLanding page
      // 2. Screen width >= 770px
      if (pathname === "/DASESLanding" && window.innerWidth >= 770) {
        if (window.scrollY > 1000) {
          setShowHeader(true);
        } else {
          setShowHeader(false);
        }
      } else {
        // On mobile or other routes — always visible
        setShowHeader(true);
      }
    };

    handleScroll(); // Run once on mount for initial setup

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [pathname]); // ✅ re-run if the route changes

  return (
    <header className={`${styles.header} ${showHeader ? styles.visible : ""}`}>
      <div className={styles.logo}>
        <Link href="/">
          <Image
            src={logo}
            alt="My Logo"
            width={80}
            height={30}
            priority
          />
        </Link>
      </div>

      <nav className={`${styles.nav} ${isOpen ? styles.open : ""}`}>
        <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
        <Link href="/SignIn" onClick={() => setIsOpen(false)}>SignIn</Link>
        <Link href="#bookDemo" onClick={() => setIsOpen(false)}>Contact</Link>
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
