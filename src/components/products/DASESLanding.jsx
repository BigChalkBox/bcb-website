'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../shared/SiteHeader'
import SiteFooter from '../shared/SiteFooter'
import Link from 'next/link'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import TestimonialStack from '../TestimonialStack'
import BookDemoForm from '../BookDemoForm'
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
import './DASESLanding.css'

export default function DASESLanding() {
    const [openFaq, setOpenFaq] = useState(1)
    const [activeStep, setActiveStep] = useState(2)

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep(prev => prev >= 3 ? 1 : prev + 1)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const initPlayer = () => {
            if (window.YT && window.YT.Player) {
                new window.YT.Player('dases-workflow-video', {
                    videoId: 'k13pAnWj0Tc',
                    playerVars: {
                        autoplay: 0,
                        controls: 1,
                        loop: 0,
                        playlist: 'k13pAnWj0Tc',
                        playsinline: 1,
                        rel: 0,
                        disablekb: 0,
                        fs: 1
                    },
                    events: {
                        onReady: (event) => {
                            event.target.setVolume(15);
                            event.target.getIframe().setAttribute('title', 'DASES AI Grading Workflow Demonstration');
                        }
                    }
                });
            }
        };

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            window.onYouTubeIframeAPIReady = initPlayer;
        } else {
            initPlayer();
        }
    }, []);

    const workflowSteps = [
        { title: "Upload & Scan", desc: "Bulk upload scanned answer sheet PDFs — from a document scanner or phone camera." },
        { title: "AI Evaluation", desc: "Our engine reads handwriting, maps answers to questions, and scores against your rubric." },
        { title: "Review & Publish", desc: "Verify scores, download branded PDF reports, and share results with students." }
    ]

    const faqData = [
        {
            question: "How accurate is DASES compared to human grading?",
            answer: "DASES achieves <span class='hl'>98% rubric accuracy</span> on handwritten descriptive answers — matching experienced evaluator standards while eliminating subjective bias and inconsistencies across graders."
        },
        {
            question: "How many answer sheets can DASES process at once?",
            answer: "DASES processes up to <span class='hl'>500 sheets in parallel</span>, with each sheet scored in approximately 15 seconds. An entire batch that would take a faculty member days can be completed in minutes."
        },
        {
            question: "How do I get started with DASES?",
            answer: "It takes less than 10 minutes. Upload your question paper, add model answers, and DASES generates rubrics automatically. From there, just upload student answer sheets and let the AI handle the rest."
        },
        {
            question: "Can I customize how DASES grades?",
            answer: "Absolutely. You define the rubric — your criteria, your weights, your standards. DASES adapts to your grading expectations, not the other way around. It also supports multiple valid answer approaches per question."
        },
        {
            question: "Is student data secure?",
            answer: "Yes. All data is <span class='hl'>encrypted at rest and in transit</span>. Role-based access control ensures students only see their own results, and faculty only access their own papers and submissions. Complete audit trails are maintained."
        }
    ]



    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />

            <div className="landing-page">
                <SiteHeader />

                <main>
                    {/* ==================== HERO ==================== */}
                    <section className="lp-hero lp-hero-gradient">
                        <div className="lp-container" style={{ textAlign: 'center' }}>
                            <div className="lp-badge">
                                <span className="lp-ping-dot">
                                    <span className="ping"></span>
                                    <span className="dot"></span>
                                </span>
                                Now Processing: 500 Sheets in Parallel
                            </div>
                            <h1 className="lp-hero-title">
                                Grade Handwritten Exams <br />
                                <span className="lp-gradient-text">in Minutes, Not Days.</span>
                            </h1>
                            <p className="lp-hero-sub">
                                <strong>DASES is an AI-powered descriptive answer evaluation system</strong> that reads handwriting, scores against your rubric, and delivers detailed per-question feedback for educational institutions — at 98% accuracy.
                            </p>
                            <FadeIn delay={0.1} className="lp-cta-buttons" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', position: 'relative', zIndex: 10 }}>
                                <Link href="https://www.youtube.com/watch?v=k13pAnWj0Tc&list=TLGGtZTxRZOBne8yMjAyMjAyNg" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                    <button className="lp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.875rem 1.5rem', background: 'white' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>play_circle</span>
                                        Watch a quick demo video
                                    </button>
                                </Link>
                            </FadeIn>
                            <FadeIn className="lp-dash-wrap" delay={0.2}>
                                <div className="lp-dash-outer">
                                    <img alt="DASES Evaluation Dashboard Preview" src="/images/landing/dashboard_preview.png" />
                                    <div className="lp-float-badge lp-float-left">
                                        <div className="icon-box" style={{ background: 'var(--color-cream-dark)', color: 'var(--primary)' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>edit_note</span>
                                        </div>
                                        <div>
                                            <span className="label-small">No Manual Checking</span>
                                            <span className="label-main">Reads Any Handwriting</span>
                                        </div>
                                    </div>
                                    <div className="lp-float-badge lp-float-right">
                                        <div className="icon-box" style={{ background: 'rgba(20, 90, 56, 0.1)', color: 'var(--accent)' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>check_circle</span>
                                        </div>
                                        <div>
                                            <span className="label-small">Per Question</span>
                                            <span className="label-main">Detailed Remarks</span>
                                        </div>
                                    </div>

                                    <div className="lp-float-badge lp-float-top-right">
                                        <div className="icon-box" style={{ background: 'rgba(255, 253, 245, 1)', color: '#eab308' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>verified</span>
                                        </div>
                                        <div>
                                            <span className="label-small">Only on DASES</span>
                                            <span className="label-main">QuickPass™</span>
                                        </div>
                                    </div>

                                    <div className="lp-float-badge lp-float-bottom-left">
                                        <div className="icon-box" style={{ background: 'rgba(239, 246, 255, 1)', color: '#3b82f6' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>bolt</span>
                                        </div>
                                        <div>
                                            <span className="label-small">500 Sheets at Once</span>
                                            <span className="label-main">15 sec / sheet</span>
                                        </div>
                                    </div>
                                </div>
                                <p style={{
                                    fontSize: '0.65rem',
                                    color: 'var(--slate-content)',
                                    opacity: 0.55,
                                    marginTop: '0.6rem',
                                    textAlign: 'right',
                                    fontWeight: 500,
                                    letterSpacing: '0.01em',
                                    paddingRight: '0.25rem',
                                }}>
                                    * For illustration purposes only. No real student data is shown. DASES secures all data with end-to-end encryption.
                                </p>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ==================== PROBLEM ==================== */}
                    <section className="lp-problem">
                        <div className="lp-container">
                            <FadeIn>
                                <h2>
                                    Grading descriptive answers takes days of valuable teaching time. <br />
                                    <span className="highlight">DASES brings that down to minutes</span> empowering you to focus on teaching.
                                </h2>
                            </FadeIn>
                        </div>
                    </section>



                    {/* ==================== FEATURES ==================== */}
                    <section className="lp-features" id="features">
                        <div className="lp-container">
                            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                <span className="lp-section-tag">Core Capabilities</span>
                                <h2 className="lp-section-title">Built for Descriptive Exams</h2>
                            </div>
                            <FadeIn className="lp-features-grid" delay={0.2}>
                                {/* Handwriting Intelligence Card */}
                                <div className="lp-card">
                                    <div className="lp-card-icon" style={{ background: 'var(--color-cream-dark)', color: 'var(--primary)' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '2rem', fontWeight: 'bold' }}>rate_review</span>
                                    </div>
                                    <h3>Per-Question Feedback</h3>
                                    <p>Go beyond a simple grade. Deliver detailed scores and actionable written feedback for every answer so students gain clear, personalized insights. Bonus: they can download their complete performance report as a PDF.</p>
                                    <div className="lp-blockquote">
                                        <span className="hl">Q3:</span> &quot;Bubble sort compares adjacent elements and swaps them if they are in wrong order...&quot;<br />
                                        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓ Concept: 4/4</span> · <span style={{ color: '#eab308', fontWeight: 700 }}>⚠ Complexity: 1/2</span> · <span style={{ fontWeight: 600 }}>Score: 8/10</span>
                                    </div>
                                </div>

                                {/* Speed Card */}
                                <div className="lp-card lp-card-green">
                                    <div className="lp-card-icon">
                                        <span className="material-symbols-outlined" style={{ fontSize: '2rem', fontWeight: 'bold' }}>speed</span>
                                    </div>
                                    <h3>500 Sheets at Once</h3>
                                    <p>Process an entire batch in parallel. Each sheet evaluated in ~15 seconds.</p>
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <div className="lp-stat-big">15s</div>
                                        <p className="lp-stat-label">Per Sheet Processing</p>
                                    </div>
                                </div>

                                {/* Custom Rubric Mapping Card */}
                                <div className="lp-card">
                                    <div className="lp-card-icon" style={{ background: 'rgba(20, 90, 56, 0.1)', color: 'var(--accent)' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '2rem', fontWeight: 'bold' }}>fact_check</span>
                                    </div>
                                    <h3>Standardised Rubrics</h3>
                                    <p>Instantly turn your sample answers into comprehensive rubrics. You retain absolute control to adjust, refine, and perfect every single criterion before the grading process even begins.</p>
                                    <ul className="lp-checklist" style={{ marginTop: '1rem' }}>
                                        <li><span className="material-symbols-outlined">check_circle</span> Criterion-Based Scoring</li>
                                        <li><span className="material-symbols-outlined">check_circle</span> Partial Credit Logic</li>
                                        <li><span className="material-symbols-outlined">check_circle</span> Multiple Answer Variants</li>
                                    </ul>
                                </div>

                                {/* QuickPass Card */}
                                <div className="lp-card" style={{ padding: 0, overflow: 'hidden', position: 'relative', minHeight: '300px' }}>
                                    <video
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        aria-label="QuickPass Paper Analysis tool preview showing mismatch highlighting"
                                        src="/videos/final.mp4"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            filter: 'brightness(120%)',
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'var(--color-gold-light)',
                                        mixBlendMode: 'hue',
                                        pointerEvents: 'none'
                                    }}></div>
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'var(--color-gold-light)',
                                        mixBlendMode: 'color',
                                        opacity: 0.5,
                                        pointerEvents: 'none'
                                    }}></div>

                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        width: '100%',
                                        padding: '2rem',
                                        background: 'linear-gradient(to top, var(--color-ink), transparent)',
                                        color: 'white',
                                        zIndex: 10
                                    }}>
                                        <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>QuickPass™ Paper Analysis</h3>
                                        <p style={{ color: 'var(--color-cream)', fontSize: '0.9rem' }}>
                                            Catch ambiguous questions and marks-difficulty mismatches before the exam.
                                        </p>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ==================== WORKFLOW ==================== */}
                    <section className="lp-workflow" id="workflow">
                        <div className="lp-workflow-bg"></div>
                        <div className="lp-container">
                            <div className="lp-workflow-inner">
                                <FadeIn className="lp-workflow-text">
                                    <span className="lp-section-tag">How It Works</span>
                                    <h2 className="lp-workflow-title">
                                        From Scanned Paper to <br />
                                        <span className="wavy">Detailed Feedback</span> <br />
                                        in Three Steps.
                                    </h2>
                                    <p className="lp-workflow-desc">
                                        Upload your students&apos; answer sheets. DASES reads the handwriting, scores each answer against your rubric, and generates personalized feedback — ready for faculty review and student delivery.
                                    </p>
                                    <div className="lp-steps">
                                        {workflowSteps.map((step, idx) => {
                                            const isActive = activeStep === (idx + 1)
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`lp-step ${isActive ? 'active' : ''}`}
                                                    onClick={() => setActiveStep(idx + 1)}
                                                >
                                                    <div className={`lp-step-num ${isActive ? 'filled' : 'outline'} ${isActive ? 'active' : ''}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <h4>{step.title}</h4>
                                                        <p>{step.desc}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <Link className="lp-link-arrow" href="/solutions">
                                        See all capabilities <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>arrow_forward</span>
                                    </Link>
                                </FadeIn>
                                <FadeIn className="lp-tablet-wrap" delay={0.2}>
                                    <div className="lp-tablet">
                                        <div className="lp-tablet-screen" style={{ overflow: 'hidden', position: 'relative' }}>
                                            <div id="dases-workflow-video" style={{ width: '100%', height: '100%' }}></div>
                                        </div>
                                    </div>
                                </FadeIn>
                            </div >
                        </div >
                    </section >

                    {/* ==================== CTA ==================== */}
                    < section className="lp-cta" >
                        <FadeIn className="lp-container">
                            <h2>
                                Ready to stop grading <br />
                                <span className="lp-gradient-text">and start evaluating?</span>
                            </h2>
                            <p>
                                Join 20+ educators already using DASES to deliver faster, fairer, and more meaningful assessment feedback.
                            </p>
                            <div className="lp-cta-buttons">
                                <Link href="/#contact"><button className="lp-btn-primary">Book a Free Demo</button></Link>
                                <Link href="/solutions"><button className="lp-btn-secondary">Explore Solutions</button></Link>
                            </div>
                        </FadeIn>
                    </section >

                    {/* ==================== FAQ ==================== */}
                    < section className="lp-faq" id="faq" >
                        <div className="lp-faq-blob"></div>
                        <FadeIn className="lp-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                            <h2 className="lp-faq-title" style={{ textAlign: 'center' }}>Frequently Asked Questions</h2>
                            <p className="lp-faq-subtitle" style={{ textAlign: 'center' }}>Everything you need to know about DASES — from accuracy to data security.</p>

                            <div className="lp-faq-list" style={{ textAlign: 'left', width: '100%' }}>
                                {faqData.map((faq, idx) => {
                                    const isOpen = openFaq === idx
                                    return isOpen ? (
                                        <div key={idx} className="lp-faq-open">
                                            <div className="q-row" onClick={() => setOpenFaq(null)} style={{ cursor: 'pointer' }}>
                                                <span>{faq.question}</span>
                                                <button className="lp-faq-close-btn">
                                                    <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'white' }}>close</span>
                                                </button>
                                            </div>
                                            <p dangerouslySetInnerHTML={{ __html: faq.answer }}></p>
                                        </div>
                                    ) : (
                                        <div key={idx} className="lp-faq-item" onClick={() => setOpenFaq(idx)}>
                                            <span>{faq.question}</span>
                                            <span className="material-symbols-outlined">add</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </FadeIn>
                    </section >

                    {/* ==================== TESTIMONIALS ==================== */}
                    <FadeIn>
                        <TestimonialStack />
                    </FadeIn>
                    
                    {/* ==================== CONTACT / PILOT FORM ==================== */}
                    <BookDemoForm />
                </main >

                <SiteFooter />
            </div >
        </>
    )
}
