'use client'

import Link from 'next/link'
import './SiteFooter.css'

export default function SiteFooter() {
    return (
        <footer className="site-footer">
            <div className="site-footer-container">
                <div className="site-footer-grid">
                    <div className="site-footer-brand">
                        <Link href="/" className="site-footer-logo">
                            <div className="site-footer-logo-box">
                                <img src="/logo/logo-dases-green.png" alt="DASES" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.8)' }} />
                            </div>
                            <span className="site-footer-logo-text">DASES</span>
                        </Link>
                        <p>AI-powered handwritten exam evaluation. 98% rubric accuracy, 500 sheets in parallel, detailed per-question feedback.</p>
                        <div className="site-footer-social">
                            <a href="mailto:support@esun.solutions" aria-label="Email">
                                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>mail</span>
                            </a>
                            <a href="tel:+917529836117" aria-label="Phone">
                                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>call</span>
                            </a>
                        </div>
                    </div>
                    <div className="site-footer-col">
                        <h5>Product</h5>
                        <ul>
                            <li><Link href="/#features">Features</Link></li>
                            <li><Link href="/solutions">Solutions</Link></li>
                            <li><Link href="/pricing">Pricing</Link></li>
                            <li><Link href="/#workflow">How It Works</Link></li>
                            <li><Link href="/blog">Blog</Link></li>
                        </ul>
                    </div>
                    <div className="site-footer-col">
                        <h5>Get Started</h5>
                        <ul>
                            <li><Link href="/#contact">Book a Demo</Link></li>
                            <li><Link href="/SignIn">Log In</Link></li>
                            <li><Link href="/#faq">FAQ</Link></li>
                        </ul>
                    </div>
                    <div className="site-footer-col">
                        <h5>Company</h5>
                        <ul>
                            <li><Link href="/about">About</Link></li>
                            <li><Link href="/#contact">Contact</Link></li>
                            <li><address style={{ fontStyle: 'normal' }}><a href="mailto:support@esun.solutions">support@esun.solutions</a></address></li>
                            <li><address style={{ fontStyle: 'normal' }}><a href="tel:+917529836117">+91 7529836117</a></address></li>
                        </ul>
                    </div>
                </div>
                <div className="site-footer-bottom">
                    <div>© 2026 DASES by Big Chalk Box Pvt. Ltd. All rights reserved.</div>
                </div>
            </div>
        </footer>
    )
}
