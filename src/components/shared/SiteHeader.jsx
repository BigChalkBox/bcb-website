'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import './SiteHeader.css'
import './SiteHeader.css'

export default function SiteHeader() {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    return (
        <header className="site-header site-glass">
            <div className="site-header-inner">
                <Link href="/" className="site-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <img src="/logo_new/logo.png" alt="BigChalkBox Logo" style={{ height: '2.5rem', width: 'auto', objectFit: 'contain' }} />
                    <span className="site-logo-text" style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Big<span style={{ color: 'var(--primary-color)' }}>Chalk</span>Box</span>
                </Link>
                <nav className="site-nav">
                    <div className="nav-dropdown" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                        <button className={`nav-dropdown-btn ${pathname.startsWith('/products') ? 'active-hint' : ''}`}>
                            Products <span className="material-symbols-outlined">expand_more</span>
                        </button>
                        {dropdownOpen && (
                            <div className="nav-dropdown-content">
                                <Link href="/products/dases" onClick={() => setDropdownOpen(false)}>DASES (Evaluation)</Link>
                                <Link href="/products/qp-moderation" onClick={() => setDropdownOpen(false)}>QP Moderation</Link>
                                <div className="nav-dropdown-item muted">QP Generation (Soon)</div>
                                <div className="nav-dropdown-item muted">Teacher Notes (Soon)</div>
                                <div className="nav-dropdown-item muted">Exam Prep (Soon)</div>
                            </div>
                        )}
                    </div>
                    <Link href="/about" className={pathname === '/about' ? 'active' : ''}>About Us</Link>
                    <Link href="/pricing" className={pathname === '/pricing' ? 'active' : ''}>Pricing</Link>
                    <Link href="/blog" className={pathname.startsWith('/blog') ? 'active' : ''}>Blog</Link>
                </nav>
                <div className="site-header-actions">
                    <Link className="btn-accent" href="/SignIn" style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontWeight: '800', textDecoration: 'none', transition: 'all 0.2s', display: 'inline-block' }}>Sign In</Link>
                    <Link href="/#contact" className="site-btn-demo">
                        Book Demo <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>arrow_forward</span>
                    </Link>
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle Navigation Menu"
                    >
                        <span className="material-symbols-outlined">
                            {mobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="mobile-nav-drawer">
                    <nav className="mobile-nav">
                        <Link href="/#products" onClick={() => setMobileMenuOpen(false)} className={pathname === '/' ? 'active-hint' : ''}>Products</Link>
                        <Link href="/products/dases" onClick={() => setMobileMenuOpen(false)} className={pathname === '/products/dases' ? 'active' : ''}>DASES</Link>
                        <Link href="/products/qp-moderation" onClick={() => setMobileMenuOpen(false)} className={pathname === '/products/qp-moderation' ? 'active' : ''}>QP Moderation</Link>
                        <div className="mobile-nav-item muted" style={{ color: 'var(--slate-muted)', fontSize: '0.8rem', padding: '0.5rem 1rem', textAlign: 'center' }}>QP Generation (Soon)</div>
                        <div className="mobile-nav-item muted" style={{ color: 'var(--slate-muted)', fontSize: '0.8rem', padding: '0.5rem 1rem', textAlign: 'center' }}>Teacher Notes (Soon)</div>
                        <div className="mobile-nav-item muted" style={{ color: 'var(--slate-muted)', fontSize: '0.8rem', padding: '0.5rem 1rem', textAlign: 'center' }}>Exam Prep (Soon)</div>
                        <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={pathname === '/about' ? 'active' : ''}>About Us</Link>
                        <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className={pathname === '/pricing' ? 'active' : ''}>Pricing</Link>
                        <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className={pathname.startsWith('/blog') ? 'active' : ''}>Blog</Link>
                        <Link className="mobile-login-link" href="/SignIn" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                        <Link href="/#contact" onClick={() => setMobileMenuOpen(false)} className="mobile-btn-demo">
                            Book Demo <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>arrow_forward</span>
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    )
}
