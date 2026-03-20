'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import SiteHeader from '../shared/SiteHeader'
import SiteFooter from '../shared/SiteFooter'
import './SolutionsPage.css'

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

const solutionCards = [
    {
        icon: 'edit_note',
        title: 'Smart Paper Builder',
        desc: 'Create question papers in minutes: upload a PDF and let AI extract questions, or build from scratch with full LaTeX and math support.',
        tag: 'Paper Creation',
    },
    {
        icon: 'auto_awesome',
        title: 'AI Rubric Engine',
        desc: 'Provide model answers and get detailed, criterion-based rubrics generated instantly. Support for multiple valid approaches per question.',
        tag: 'Rubric Generation',
    },
    {
        icon: 'verified',
        title: 'QuickPass™ Analysis',
        desc: 'Catch ambiguous questions, marks-difficulty mismatches, and duplicate content before the exam. Real-time Paper Health Score (0–100).',
        tag: 'Quality Assurance',
    },
    {
        icon: 'menu_book',
        title: 'Syllabus Coverage Tracking',
        desc: 'Link your course syllabus and see exactly which topics are covered, which are missing, and how coverage is distributed visually.',
        tag: 'Curriculum Alignment',
    },
    {
        icon: 'visibility',
        title: 'Handwriting Intelligence',
        desc: 'AI reads handwritten student responses, including diagrams, equations, and margin notes, with 98% accuracy. No retyping needed.',
        tag: 'AI Evaluation',
    },
    {
        icon: 'bolt',
        title: 'Parallel Evaluation at Scale',
        desc: 'Process 500 answer sheets simultaneously. Each sheet scored, annotated, and ready for review in ~15 seconds.',
        tag: 'Speed & Scale',
    },
    {
        icon: 'summarize',
        title: 'Professional Reports',
        desc: 'Branded PDF reports with score breakdowns, criterion-level feedback, and embedded student answer images. Shareable web reports too.',
        tag: 'Reporting',
    },
    {
        icon: 'forum',
        title: 'Student Feedback Loop',
        desc: 'One-click student account creation. Students view detailed evaluation reports and submit feedback, closing the learning loop.',
        tag: 'Student Engagement',
    },
]

export default function SolutionsPage() {
    return (
        <>
            <div className="solutions-page">
                <SiteHeader />

                <main>
                    {/* ==================== HERO ==================== */}
                    <section className="sp-hero">
                        <div className="sp-container">
                            <FadeIn>
                                <span className="sp-badge">End-to-End Assessment Platform</span>
                                <h1 className="sp-hero-title">
                                    Every Step of Evaluation,{' '}
                                    <span className="accent">Handled.</span>
                                </h1>
                                <p className="sp-hero-sub">
                                    From question paper creation to AI-powered grading to student feedback, DASES covers the complete assessment lifecycle so faculty can focus on what matters: teaching.
                                </p>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ==================== STATS BAR ==================== */}
                    <section className="sp-stats-bar">
                        <FadeIn>
                            <div className="sp-container sp-stats-inner">
                                <div className="sp-stat">
                                    <span className="sp-stat-num">98%</span>
                                    <span className="sp-stat-label">Rubric Accuracy</span>
                                </div>
                                <div className="sp-stat-divider"></div>
                                <div className="sp-stat">
                                    <span className="sp-stat-num">15s</span>
                                    <span className="sp-stat-label">Per Sheet</span>
                                </div>
                                <div className="sp-stat-divider"></div>
                                <div className="sp-stat">
                                    <span className="sp-stat-num">500</span>
                                    <span className="sp-stat-label">Sheets in Parallel</span>
                                </div>
                                <div className="sp-stat-divider"></div>
                                <div className="sp-stat">
                                    <span className="sp-stat-num">90%</span>
                                    <span className="sp-stat-label">Less Grading Time</span>
                                </div>
                            </div>
                        </FadeIn>
                    </section>

                    {/* ==================== SOLUTIONS GRID ==================== */}
                    <section className="sp-grid-section">
                        <div className="sp-container">
                            <FadeIn>
                                <div className="sp-grid-header">
                                    <h2>Everything You Need to Run Exams at Scale</h2>
                                    <p>Eight integrated modules that replace your entire assessment workflow: no patchwork, no manual steps.</p>
                                </div>
                                <div className="sp-grid">
                                    {solutionCards.map((card, idx) => (
                                        <div className="sp-card" key={idx}>
                                            <div className="sp-card-tag">{card.tag}</div>
                                            <div className="sp-card-icon">
                                                <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>{card.icon}</span>
                                            </div>
                                            <h3>{card.title}</h3>
                                            <p>{card.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ==================== CTA BANNER ==================== */}
                    <section className="sp-cta-section">
                        <FadeIn>
                            <div className="sp-cta-banner">
                                <div className="sp-cta-inner">
                                    <h2>Stop grading manually. Start grading intelligently.</h2>
                                    <p>
                                        See how DASES can save your faculty 40+ hours per exam cycle while giving students better, more actionable feedback.
                                    </p>
                                    <div className="sp-cta-buttons">
                                        <Link href="/#contact"><button className="sp-cta-btn-white">Book a Free Demo</button></Link>
                                        <Link href="/#contact"><button className="sp-cta-btn-outline">Talk to Our Team</button></Link>
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
