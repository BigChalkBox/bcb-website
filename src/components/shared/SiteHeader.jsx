'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import './SiteHeader.css'
import './SiteHeader.css'

export default function SiteHeader() {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="site-header site-glass">
            <div className="site-header-inner">
                <Link href="/" className="site-logo">
                    <div className="site-logo-box">
                        <img src="/logo/logo-dases-green.png" alt="DASES" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.8)' }} />
                    </div>
                    <span className="site-logo-text">DASES</span>
                </Link>
                <nav className="site-nav">
                    <Link href="/#features" className={pathname === '/' ? 'active-hint' : ''}>Features</Link>
                    <Link href="/#workflow" className={pathname === '/' ? 'active-hint' : ''}>How it works</Link>
                    <Link href="/solutions" className={pathname === '/solutions' ? 'active' : ''}>Solutions</Link>
                    <Link href="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
                    <Link href="/pricing" className={pathname === '/pricing' ? 'active' : ''}>Pricing</Link>
                </nav>
                <div className="site-header-actions">
                    <Link className="site-login-link" href="/SignIn">Log In</Link>
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
                        <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className={pathname === '/' ? 'active-hint' : ''}>Features</Link>
                        <Link href="/#workflow" onClick={() => setMobileMenuOpen(false)} className={pathname === '/' ? 'active-hint' : ''}>How it works</Link>
                        <Link href="/solutions" onClick={() => setMobileMenuOpen(false)} className={pathname === '/solutions' ? 'active' : ''}>Solutions</Link>
                        <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={pathname === '/about' ? 'active' : ''}>About</Link>
                        <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className={pathname === '/pricing' ? 'active' : ''}>Pricing</Link>
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
