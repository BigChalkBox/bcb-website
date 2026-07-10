'use client'

import Link from 'next/link'
import './SiteFooter.css'

export default function SiteFooter() {
    return (
        <footer className="site-footer">
            <div className="site-footer-container">
                <div className="site-footer-grid">
                    <div className="site-footer-brand">
                        <Link href="/" className="site-footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                            <img src="/logo_new/logo.png" alt="BigChalkBox Logo" style={{ height: '2.5rem', width: 'auto', objectFit: 'contain' }} />
                            <span className="site-footer-logo-text" style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Big<span style={{ color: 'var(--primary-color)' }}>Chalk</span>Box</span>
                        </Link>
                        <p>Comprehensive EdTech Automation Suite. Powering institutions with AI-driven grading, moderation, and content generation.</p>
                        <div className="site-footer-social">
                            <a href="mailto:admin.dasesai@gmail.com" aria-label="Email">
                                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>mail</span>
                            </a>
                            <a href="tel:+917529836117" aria-label="Phone">
                                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>call</span>
                            </a>
                        </div>
                    </div>
                    <div className="site-footer-col">
                        <h5>Products</h5>
                        <ul>
                            <li><Link href="/products/dases">DASES Evaluation</Link></li>
                            <li><Link href="/products/qp-moderation">QP Moderation</Link></li>
                            <li><Link href="/#products">QP Generation</Link></li>
                            <li><Link href="/#products">Teacher Notes</Link></li>
                            <li><Link href="/#products">Exam Preparation</Link></li>
                        </ul>
                    </div>
                    <div className="site-footer-col">
                        <h5>Get Started</h5>
                        <ul>
                            <li><Link href="/#contact">Book a Demo</Link></li>
                            <li><Link href="/SignIn">Log In</Link></li>
                            <li><Link href="/pricing">Pricing</Link></li>
                        </ul>
                    </div>
                    <div className="site-footer-col">
                        <h5>Company</h5>
                        <ul>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/#contact">Contact</Link></li>
                            <li><address style={{ fontStyle: 'normal' }}><a href="mailto:admin.dasesai@gmail.com">admin.dasesai@gmail.com</a></address></li>
                            <li><address style={{ fontStyle: 'normal' }}><a href="tel:+917529836117">+91 7529836117</a></address></li>
                        </ul>
                    </div>
                </div>
                <div className="site-footer-bottom">
                    <div>© 2026 BigChalkBox Innovations LLP. All rights reserved.</div>
                </div>
            </div>
        </footer>
    )
}
