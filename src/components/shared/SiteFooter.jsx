'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import '../landing/LandingPage.css' // Needed for ft-shell and other landing page styles
import './SiteFooter.css' // New professional footer styles

export default function SiteFooter() {
    const pathname = usePathname()
    const hideCta = pathname === '/pricing' || pathname === '/about'

    const statsRef = useRef(null)
    const statsInView = useInView(statsRef, { once: true, margin: "-100px" })

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    }

    const [email, setEmail] = useState('')
    const [status, setStatus] = useState({ state: 'idle', msg: '' })

    const handleSubscribe = async (e) => {
        e.preventDefault()
        setStatus({ state: 'loading', msg: 'Subscribing...' })
        
        const data = {
            email: email,
            created_at: new Date().toLocaleString('en-IN'),
            comments: 'Newsletter Subscriber'
        }
        
        try {
            const res = await fetch('https://sheetdb.io/api/v1/vksbsahrgkwky', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: [data] }),
            })
            if (res.ok) {
                setStatus({ state: 'success', msg: 'Subscribed successfully!' })
                setEmail('')
                setTimeout(() => setStatus({ state: 'idle', msg: '' }), 4000)
            } else {
                setStatus({ state: 'error', msg: 'Something went wrong.' })
            }
        } catch {
            setStatus({ state: 'error', msg: 'Network error.' })
        }
    }

    return (
        <footer>
            {/* ====================================================
                PROFESSIONAL SITE LINKS & NEWSLETTER
            ==================================================== */}
            <div className="ft-links-shell">
                <div className="ft-links-divider"></div>
                
                <div className="ft-links-grid">
                    {/* Brand & Newsletter Column */}
                    <div className="ft-brand-col">
                        <Link href="/" className="ft-brand-logo">
                            <img src="/logo_new/logo.png" alt="BigChalkBox Logo" />
                            <span><span className="accent">Big</span>Chalk<span className="accent">Box</span></span>
                        </Link>
                        <p className="ft-brand-desc">
                            Comprehensive EdTech Automation Suite. Powering institutions with AI-driven grading, moderation, and content generation.
                        </p>
                        
                        <div className="ft-newsletter">
                            <h4>Stay Updated</h4>
                            <form className="ft-newsletter-form" onSubmit={handleSubscribe}>
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={status.state === 'loading'}
                                />
                                <button type="submit" disabled={status.state === 'loading'}>
                                    {status.state === 'loading' ? '...' : 'Subscribe'}
                                </button>
                            </form>
                            {status.msg && (
                                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: status.state === 'error' ? '#ef4444' : 'var(--color-gold)' }}>
                                    {status.msg}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {/* Products Column */}
                    <div className="ft-links-col">
                        <h4>Products</h4>
                        <ul>
                            <li>
                                <Link href="/products/dases">
                                    DASES Evaluation
                                    <span className="ft-live-badge">Live</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/products/qp-moderation">
                                    QP Moderation
                                    <span className="ft-live-badge">Live</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/products/qp-generation">
                                    QP Generation
                                    <span className="ft-live-badge">Live</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div className="ft-links-col">
                        <h4>Resources</h4>
                        <ul>
                            <li><Link href="/#book-demo">Book a Demo</Link></li>
                            <li><Link href="/pricing">Pricing</Link></li>
                            <li><Link href="/blog">Blog</Link></li>
                        </ul>
                        <h4 style={{ marginTop: '1.5rem' }}>Find us online</h4>
                        <ul>
                            <li>
                                <a href="https://youtube.com/@dases_ai" target="_blank" rel="noopener noreferrer">
                                    YouTube ↗
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div className="ft-links-col">
                        <h4>Company</h4>
                        <ul>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/#contact">Contact</Link></li>
                            <li><Link href="/solutions">Solutions</Link></li>
                            <li><Link href="/careers">Careers</Link></li>
                        </ul>
                    </div>
                </div>
                
                {/* Bottom Legal / Copyright Bar */}
                <div className="ft-bottom">
                    <div className="ft-bottom-text">
                        © {new Date().getFullYear()} BCBX INNOVATIONS PRIVATE LIMITED. All rights reserved.
                    </div>
                    <div className="ft-bottom-links">
                        <Link href="/privacy">Privacy Policy</Link>
                        <span className="ft-bottom-sep">·</span>
                        <Link href="/terms">Terms of Service</Link>
                        <span className="ft-bottom-sep">·</span>
                        <span className="ft-bottom-text" style={{ color: 'rgba(0,0,0,0.5)' }}>Registered under MCA</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
