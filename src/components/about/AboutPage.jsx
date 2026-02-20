'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import SiteHeader from '../shared/SiteHeader'
import SiteFooter from '../shared/SiteFooter'
import BackedBy from '../shared/BackedBy'
import './AboutPage.css'

const FadeIn = ({ children, delay = 0, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: "-100px" }}
        className={className}
    >
        {children}
    </motion.div>
)

const stats = [
    { value: '400+', label: 'Sheets Evaluated' },
    { value: '98%', label: 'Rubric Accuracy' },
    { value: '15s', label: 'Per Sheet' },
    { value: '20+', label: 'Educators Onboard' },
]

const dnaCards = [
    {
        icon: 'precision_manufacturing',
        title: 'Accuracy First',
        desc: '98% rubric accuracy on handwritten descriptive answers — matching human evaluator standards.',
    },
    {
        icon: 'bolt',
        title: 'Built for Scale',
        desc: '500 sheets processed in parallel. An entire batch graded in the time it takes to grade one manually.',
    },
    {
        icon: 'school',
        title: 'Made for Educators',
        desc: 'Your rubric, your criteria, your standards. DASES adapts to how you grade, not the other way around.',
    },
]

export default function AboutPage() {
    return (
        <>
            <div className="about-page">
                <SiteHeader />

                <main>
                    {/* ==================== HERO ==================== */}
                    <section className="ap-hero">
                        <div className="ap-hero-blur"></div>
                        <div className="ap-container">
                            <FadeIn>
                                <div className="ap-hero-badge">About DASES</div>
                                <h1 className="ap-hero-title">
                                    BETTER<br />
                                    <span className="accent">FEEDBACK,</span><br />
                                    FASTER.
                                </h1>
                                <p className="ap-hero-sub">
                                    We&apos;re building the evaluation infrastructure that universities need — AI that reads handwritten answers, scores against faculty-defined rubrics, and delivers the kind of detailed feedback students actually learn from.
                                </p>
                            </FadeIn>
                            <FadeIn delay={0.2}>
                                <div className="ap-hero-image-wrap">
                                    <div className="ap-hero-image">
                                        <img alt="DASES evaluation dashboard showing detailed student report" src="/images/landing/dashboard_preview.png" />
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ==================== STATS ==================== */}
                    <section className="ap-stats">
                        <div className="ap-container">
                            <FadeIn>
                                <div className="ap-stats-grid">
                                    {stats.map((stat, idx) => (
                                        <div className="ap-stat" key={idx}>
                                            <div className="ap-stat-value">{stat.value}</div>
                                            <div className="ap-stat-label">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    <BackedBy />

                    {/* ==================== THE PROBLEM WE SOLVE ==================== */}
                    <section className="ap-standard">
                        <div className="ap-container">
                            <div className="ap-standard-grid">
                                <FadeIn className="ap-standard-content">
                                    <h2 className="ap-standard-title">WHY<br />DASES?</h2>
                                    <div>
                                        <div className="ap-feature-row">
                                            <div className="ap-feature-icon green">
                                                <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>timer_off</span>
                                            </div>
                                            <div>
                                                <h4>The Problem</h4>
                                                <p>Faculty spend 40+ hours grading one batch of descriptive exams. Feedback is inconsistent. Students get a number, not insight.</p>
                                            </div>
                                        </div>
                                        <div className="ap-feature-row">
                                            <div className="ap-feature-icon dark">
                                                <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>auto_fix_high</span>
                                            </div>
                                            <div>
                                                <h4>Our Solution</h4>
                                                <p>DASES reads handwritten answers, scores each criterion against your rubric, and writes per-question feedback — in 15 seconds per sheet.</p>
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                                <FadeIn className="ap-mosaic" delay={0.2}>
                                    <div className="ap-mosaic-col">
                                        <div className="ap-mosaic-img">
                                            <img alt="DASES AI evaluation in action" src="/images/landing/dashboard_preview.png" />
                                        </div>
                                        <div className="ap-mosaic-card green">
                                            <p>Faculty focus on teaching. DASES handles the grading.</p>
                                        </div>
                                    </div>
                                    <div className="ap-mosaic-col">
                                        <div className="ap-mosaic-card dark">
                                            <div>
                                                <div className="big-stat">90%</div>
                                                <div className="small-label">Less Grading Time</div>
                                            </div>
                                        </div>
                                        <div className="ap-mosaic-img">
                                            <img alt="Student evaluation report with detailed feedback" src="/images/landing/dashboard_preview.png" />
                                        </div>
                                    </div>
                                </FadeIn>
                            </div>
                        </div>
                    </section>

                    {/* ==================== WHAT DRIVES US ==================== */}
                    <section className="ap-dna">
                        <div className="ap-container">
                            <FadeIn>
                                <h2 className="ap-dna-title">WHAT DRIVES US</h2>
                                <div className="ap-dna-bar"></div>
                            </FadeIn>
                            <FadeIn delay={0.2}>
                                <div className="ap-dna-grid">
                                    {dnaCards.map((card, idx) => (
                                        <div className="ap-dna-card" key={idx}>
                                            <div className="ap-dna-icon">
                                                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: idx === 1 ? 'var(--accent)' : 'white' }}>{card.icon}</span>
                                            </div>
                                            <h4>{card.title}</h4>
                                            <p>{card.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ==================== BUILT BY ESUN ==================== */}
                    <section className="ap-team">
                        <div className="ap-container">
                            <FadeIn>
                                <div className="ap-team-header">
                                    <div>
                                        <h2 className="ap-team-title">BUILT BY<br />ESUN SMART SOLUTIONS<br />PVT. LTD.</h2>
                                        <p className="ap-team-sub">A team of engineers and educators solving the hardest problems in academic assessment — from handwriting recognition to rubric-based AI evaluation at scale.</p>
                                    </div>
                                    <Link href="/#contact">
                                        <button className="ap-team-cta">
                                            Get in touch <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>arrow_forward</span>
                                        </button>
                                    </Link>
                                </div>
                            </FadeIn>
                            <FadeIn delay={0.2}>
                                <div className="ap-about-details">
                                    <div className="ap-about-card">
                                        <div className="ap-about-card-icon">
                                            <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>location_on</span>
                                        </div>
                                        <h4>Based in India</h4>
                                        <p>Building for Indian universities and schools, with plans to expand globally.</p>
                                    </div>
                                    <div className="ap-about-card">
                                        <div className="ap-about-card-icon">
                                            <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>rocket_launch</span>
                                        </div>
                                        <h4>Early Stage, Real Results</h4>
                                        <p>400+ sheets evaluated, 20+ educators onboard, and growing every week.</p>
                                    </div>
                                    <div className="ap-about-card">
                                        <div className="ap-about-card-icon">
                                            <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>handshake</span>
                                        </div>
                                        <h4>Pilot-First Approach</h4>
                                        <p>We work directly with institutions to co-develop and refine before scaling.</p>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ==================== CTA BANNER ==================== */}
                    <section className="ap-cta-section">
                        <FadeIn>
                            <div className="ap-cta-banner">
                                <div className="ap-cta-inner">
                                    <h2>READY TO SEE DASES IN ACTION?</h2>
                                    <div className="ap-cta-buttons">
                                        <Link href="/#contact"><button className="ap-cta-btn-white">Book a Free Demo</button></Link>
                                        <Link href="/solutions"><button className="ap-cta-btn-dark">Explore Solutions</button></Link>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </section>
                </main>

                <SiteFooter />
            </div>
        </>
    )
}
