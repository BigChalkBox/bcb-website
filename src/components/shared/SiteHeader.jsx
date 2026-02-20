'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './SiteHeader.css'

export default function SiteHeader() {
    const pathname = usePathname()

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
                </div>
            </div>
        </header>
    )
}
