'use client'

import { useState, useEffect, useRef } from 'react'
import SiteHeader from '../shared/SiteHeader'
import SiteFooter from '../shared/SiteFooter'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import './LandingPage.css'
import BookDemoForm from '../BookDemoForm'

/* ─── Animation Utilities ─── */
const FadeIn = ({ children, delay = 0, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: "-80px" }}
        className={className}
    >
        {children}
    </motion.div>
)

/* ─── Counter Animation ─── */
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const inView = useInView(ref, { once: true })

    useEffect(() => {
        if (!inView) return
        let start = 0
        const increment = target / (duration / 16)
        const timer = setInterval(() => {
            start += increment
            if (start >= target) { setCount(target); clearInterval(timer) }
            else setCount(Math.floor(start))
        }, 16)
        return () => clearInterval(timer)
    }, [inView, target, duration])

    return <span ref={ref}>{count.toLocaleString('en-IN')}{suffix}</span>
}

/* ─── How It Works Tabs ─── */
const HOW_IT_WORKS = [
    {
        id: 'dases', label: 'DASES', live: true,
        steps: [
            { icon: 'upload_file', title: 'Upload Answer Sheets', desc: 'Drag & drop up to 500 handwritten scripts. PDFs, phone photos, scans — all accepted.' },
            { icon: 'rule', title: 'Attach Your Rubric', desc: 'Upload your marking scheme or build one in our editor. Set marks, keywords, partial credit rules.' },
            { icon: 'grade', title: 'Receive Grades + Feedback', desc: 'Get per-question scores, aggregate grades, and AI-written feedback for every student in minutes.' },
        ],
        highlight: '500 sheets in 15 minutes'
    },
    {
        id: 'qpmod', label: 'QP Moderation', live: true,
        steps: [
            { icon: 'upload_file', title: 'Upload Question Paper', desc: 'Submit your question paper PDF or image. Our OCR engine handles any scan quality.' },
            { icon: 'account_tree', title: 'AI Runs 10-Point Audit', desc: 'Bloom\'s Taxonomy check, ambiguity detection, OR-choice parity, syllabus coverage — all at once.' },
            { icon: 'summarize', title: 'Download Full Report', desc: 'Get a comprehensive moderation report as PDF, Word, or PowerPoint in one click.' },
        ],
        highlight: '3-day review → 4 hours'
    },
    {
        id: 'qpgen', label: 'QP Generation', live: false,
        steps: [
            { icon: 'library_books', title: 'Input Course Outline', desc: 'Upload your syllabus and set difficulty, marks, and Bloom\'s level targets.' },
            { icon: 'psychology', title: 'AI Generates Questions', desc: 'Get a balanced, unique question bank tailored to your course outcomes and exam format.' },
            { icon: 'edit_document', title: 'Edit & Export', desc: 'Review questions in our editor, make tweaks, and export in your institution\'s format.' },
        ],
        highlight: 'Coming Soon'
    },
]

const FAQS = [
    {
        q: 'What is AI-powered answer sheet evaluation?',
        a: 'AI-powered answer sheet evaluation uses computer vision and large language models to read handwritten descriptive answers and compare them against a teacher\'s rubric. DASES by BigChalkBox processes handwritten scripts using multimodal AI — it understands the semantic meaning of each answer, not just keyword matching. This enables it to assign accurate, objective grades with per-question feedback in seconds per sheet.'
    },
    {
        q: 'How does BigChalkBox ensure question paper quality?',
        a: 'BigChalkBox\'s QP Moderation module runs a 10-point AI audit on every question paper. It checks for Bloom\'s Taxonomy balance, ambiguous phrasing, OR-choice difficulty parity, syllabus coverage gaps, out-of-syllabus questions, marks-vs-effort alignment, duplicate questions, and more. Each flagged issue comes with an AI-suggested rewrite, making resolution fast and clear.'
    },
    {
        q: 'Is BigChalkBox compliant with university examination norms?',
        a: 'Yes. BigChalkBox is built for the Indian university ecosystem, including NAAC, IQAC, and NBA compliance frameworks. The QP Moderation module\'s Bloom\'s Taxonomy mapping directly supports Learning Outcome Based Education (LOBE) requirements. All data is processed with role-based access controls, and student data is never shared with third-party AI providers.'
    },
    {
        q: 'Which types of institutions can use BigChalkBox?',
        a: 'BigChalkBox serves autonomous universities, deemed-to-be universities, affiliated colleges, engineering and technical institutions, B-Schools, and state boards across India. The platform is institution-agnostic and supports custom configurations for any examination format, syllabus structure, or grading scheme.'
    },
    {
        q: 'How much does it cost to implement AI examination software?',
        a: 'BigChalkBox offers flexible institutional pricing based on the modules selected and the scale of deployment (number of students, exams per year). We start with a free pilot program for qualifying institutions so you can see real results before any commitment. Contact us for a custom quote tailored to your institution\'s needs.'
    },
    {
        q: 'Can BigChalkBox integrate with existing University ERP systems?',
        a: 'BigChalkBox is designed as a standalone web platform with open export capabilities (Excel, PDF, CSV). We support data exchange via structured exports that are compatible with most Indian university ERP and SIS systems. Full API integration is available on our Enterprise plan.'
    },
]

const MODULES = [
    {
        id: 'dases', span: 8, live: true,
        icon: 'grading', label: 'DASES',
        title: 'Answer Sheet Evaluation System',
        desc: 'Our flagship product. AI-powered handwritten answer sheet checking. Grade 500 descriptive sheets with 98% rubric accuracy. Delivers detailed per-question feedback in 15 seconds per sheet.',
        href: '/products/dases',
        linkText: 'Explore DASES',
        ghost: 'description',
        stat: '500+ Sheets/hr',
        accent: true,
    },
    {
        id: 'qpmod', span: 4, live: true,
        icon: 'fact_check', label: 'QP Moderation',
        title: 'Question Paper Quality Audit',
        desc: 'Detect ambiguities, Bloom\'s imbalances, and out-of-syllabus questions automatically — before the paper reaches your students.',
        href: '/products/qp-moderation',
        linkText: 'Learn More',
        ghost: 'checklist',
    },
    {
        id: 'qpgen', span: 4, live: false,
        icon: 'auto_fix_high', label: 'QP Generation',
        title: 'Smart Question Creation',
        desc: 'AI-generated question banks dynamically tailored to your course outcomes, difficulty constraints, and past exam history.',
        href: null,
        ghost: 'edit_note',
    },
    {
        id: 'teacher', span: 4, live: false,
        icon: 'cast_for_education', label: 'Teacher Notes',
        title: 'Lecture Notes & PPTs',
        desc: 'Automated generation of highly structured PPTs, lesson plans, and lecture notes from raw curriculum documents.',
        href: null,
        ghost: 'slideshow',
    },
    {
        id: 'exam', span: 4, live: false,
        icon: 'school', label: 'Exam Prep',
        title: 'Student Study Material',
        desc: 'Personalized revision guides and practice tests designed specifically for your institution\'s syllabus and student level.',
        href: null,
        ghost: 'menu_book',
    },
]

const STATS = [
    { value: 12000, suffix: '+', label: 'Answer Sheets Evaluated' },
    { value: 98, suffix: '.2%', label: 'Grading Accuracy' },
    { value: 50, suffix: '+', label: 'Institutions Onboarded' },
    { value: 5, suffix: '', label: 'AI Modules in One Suite' },
]

export default function LandingPage() {
    const [activeTab, setActiveTab] = useState('dases')
    const [openFaq, setOpenFaq] = useState(null)
    const [showMobileCta, setShowMobileCta] = useState(false)

    useEffect(() => {
        const handleScroll = () => setShowMobileCta(window.scrollY > window.innerHeight * 0.4)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const activeHIT = HOW_IT_WORKS.find(h => h.id === activeTab)

    return (
        <div className="bcb-landing">
            <SiteHeader />

            <main>
                {/* ════════════════════════════════════
                    SECTION 1 — HERO
                ════════════════════════════════════ */}
                <section className="bcb-hero" aria-label="Hero">
                    <div className="bcb-hero-bg" aria-hidden="true">
                        <div className="bcb-hero-glow" />
                        <div className="bcb-dot-grid" />
                    </div>
                    <div className="bcb-container bcb-hero-content">
                        <FadeIn>
                            <div className="bcb-badge">
                                <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--bcb-gold)' }}>auto_awesome</span>
                                Introducing BigChalkBox Innovations LLP
                            </div>
                        </FadeIn>
                        <FadeIn delay={0.08}>
                            <h1 className="bcb-hero-title">
                                The Academic Operations Suite<br />
                                <span className="bcb-gradient-text">Your Institute Deserves</span>
                            </h1>
                        </FadeIn>
                        <FadeIn delay={0.16}>
                            <p className="bcb-hero-subtitle">
                                From question paper generation to answer sheet evaluation — BigChalkBox automates the entire examination cycle with AI that actually understands Indian curriculum standards.
                            </p>
                        </FadeIn>
                        <FadeIn delay={0.24}>
                            <div className="bcb-hero-ctas">
                                <a href="#book-demo" className="bcb-btn-gold">
                                    <span className="material-symbols-outlined">event_available</span>
                                    Book a Free Demo
                                </a>
                                <a href="#modules" className="bcb-btn-outline">
                                    <span className="material-symbols-outlined">explore</span>
                                    Explore Our Suite
                                </a>
                            </div>
                        </FadeIn>

                        {/* ─── Animated Stat Bar ─── */}
                        <FadeIn delay={0.36}>
                            <div className="bcb-hero-stats" role="list" aria-label="Key metrics">
                                {STATS.map((s, i) => (
                                    <div key={i} className="bcb-hero-stat" role="listitem">
                                        <div className="bcb-hero-stat-num">
                                            <AnimatedCounter target={s.value} suffix={s.suffix} />
                                        </div>
                                        <div className="bcb-hero-stat-label">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    SECTION 2 — PROBLEM STATEMENT
                ════════════════════════════════════ */}
                <section className="bcb-problem" aria-label="The problem with traditional evaluation">
                    <div className="bcb-container">
                        <FadeIn>
                            <div className="bcb-problem-eyebrow">The Reality of Academic Operations Today</div>
                            <div className="bcb-problem-lines">
                                {[
                                    "Checking 300 answer sheets by hand takes a faculty member an entire week.",
                                    "A question paper can pass 4 rounds of moderation and still reach students with a typo.",
                                    "Two evaluators grading the same answer will give different scores — every time.",
                                    "None of this should still be happening in 2025.",
                                ].map((line, i) => (
                                    <motion.p
                                        key={i}
                                        className={`bcb-problem-line ${i === 3 ? 'bcb-problem-line--accent' : ''}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                                        viewport={{ once: true, margin: "-60px" }}
                                    >
                                        {i < 3 && <span className="bcb-problem-bullet" aria-hidden="true" />}
                                        {line}
                                    </motion.p>
                                ))}
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    SECTION 3 — MODULES BENTO GRID
                ════════════════════════════════════ */}
                <section className="bcb-modules" id="modules" aria-label="BigChalkBox product modules">
                    <div className="bcb-container">
                        <FadeIn className="bcb-section-header">
                            <div className="bcb-section-tag">Our Suite</div>
                            <h2 className="bcb-section-title">Five Modules. One Platform.</h2>
                            <p className="bcb-section-desc">We build tools that save thousands of faculty hours while delivering unparalleled academic insights — all under one institution login.</p>
                        </FadeIn>

                        <div className="bcb-bento-grid">
                            {MODULES.map((mod, i) => (
                                <FadeIn key={mod.id} delay={i * 0.07} className={`bcb-bento-card bcb-${mod.id} ${mod.accent ? 'bcb-bento-accent' : ''}`}>
                                    <div className="bcb-bento-inner">
                                        <div className="bcb-card-top">
                                            <div className="bcb-card-icon" aria-hidden="true">
                                                <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>{mod.icon}</span>
                                            </div>
                                            <div className="bcb-card-badges">
                                                {mod.live
                                                    ? <span className="bcb-badge-live"><span className="bcb-badge-live-dot" />LIVE</span>
                                                    : <span className="bcb-badge-soon">Coming Soon</span>
                                                }
                                            </div>
                                        </div>
                                        <div className="bcb-card-label">{mod.label}</div>
                                        <h3 className="bcb-card-title">{mod.title}</h3>
                                        <p className="bcb-card-desc">{mod.desc}</p>
                                        {mod.href
                                            ? <Link href={mod.href} className="bcb-card-link" aria-label={`${mod.linkText} — ${mod.title}`}>
                                                {mod.linkText} <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                                            </Link>
                                            : <div className="bcb-card-link bcb-card-link--muted" aria-label="Coming soon">
                                                Notify Me <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
                                            </div>
                                        }
                                    </div>
                                    <span className="bcb-card-ghost material-symbols-outlined" aria-hidden="true">{mod.ghost}</span>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    SECTION 4 — HOW IT WORKS (TABBED)
                ════════════════════════════════════ */}
                <section className="bcb-how" aria-label="How BigChalkBox works">
                    <div className="bcb-container">
                        <FadeIn className="bcb-section-header">
                            <div className="bcb-section-tag">How It Works</div>
                            <h2 className="bcb-section-title">Up and Running in One Afternoon</h2>
                            <p className="bcb-section-desc">No lengthy onboarding. No IT department required. See it in action with your own exam paper.</p>
                        </FadeIn>

                        <div className="bcb-tabs" role="tablist" aria-label="Product walkthroughs">
                            {HOW_IT_WORKS.map(h => (
                                <button
                                    key={h.id}
                                    role="tab"
                                    aria-selected={activeTab === h.id}
                                    aria-controls={`tabpanel-${h.id}`}
                                    id={`tab-${h.id}`}
                                    className={`bcb-tab ${activeTab === h.id ? 'bcb-tab--active' : ''} ${!h.live ? 'bcb-tab--soon' : ''}`}
                                    onClick={() => setActiveTab(h.id)}
                                >
                                    {h.label}
                                    {!h.live && <span className="bcb-tab-soon-pill">Soon</span>}
                                </button>
                            ))}
                        </div>

                        <motion.div
                            key={activeTab}
                            className="bcb-how-panel"
                            id={`tabpanel-${activeTab}`}
                            role="tabpanel"
                            aria-labelledby={`tab-${activeTab}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="bcb-how-steps">
                                {activeHIT.steps.map((step, i) => (
                                    <div key={i} className="bcb-how-step">
                                        <div className="bcb-how-step-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</div>
                                        <div className="bcb-how-step-icon" aria-hidden="true">
                                            <span className="material-symbols-outlined">{step.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="bcb-how-step-title">{step.title}</h3>
                                            <p className="bcb-how-step-desc">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bcb-how-visual" aria-hidden="true">
                                <div className="bcb-how-mockup">
                                    <div className="bcb-mockup-bar">
                                        <span /><span /><span />
                                    </div>
                                    <div className="bcb-mockup-body">
                                        <div className="bcb-mockup-row bcb-mockup-row--wide bcb-shimmer" />
                                        <div className="bcb-mockup-row bcb-shimmer" />
                                        <div className="bcb-mockup-row bcb-mockup-row--short bcb-shimmer" />
                                        <div className="bcb-mockup-divider" />
                                        <div className="bcb-mockup-cards">
                                            {[82, 91, 76, 95].map((score, i) => (
                                                <div key={i} className="bcb-mockup-score-card">
                                                    <div className="bcb-mockup-score-label">Q{i + 1}</div>
                                                    <div className="bcb-mockup-score-val" style={{ color: score > 85 ? 'var(--bcb-green)' : 'var(--bcb-gold)' }}>
                                                        {score}%
                                                    </div>
                                                    <div className="bcb-mockup-score-bar">
                                                        <div className="bcb-mockup-score-fill" style={{ width: `${score}%`, background: score > 85 ? 'var(--bcb-green)' : 'var(--bcb-gold)' }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bcb-mockup-total">
                                            <span>Overall Grade</span>
                                            <span className="bcb-mockup-total-val">A+ · 86%</span>
                                        </div>
                                    </div>
                                    <div className="bcb-how-highlight-pill">
                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>bolt</span>
                                        {activeHIT.highlight}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    SECTION 5 — STATS / NUMBERS
                ════════════════════════════════════ */}
                <section className="bcb-numbers" aria-label="BigChalkBox impact metrics">
                    <div className="bcb-numbers-bg" aria-hidden="true" />
                    <div className="bcb-container">
                        <div className="bcb-numbers-grid">
                            {STATS.map((s, i) => (
                                <FadeIn key={i} delay={i * 0.08} className="bcb-number-item">
                                    <div className="bcb-number-val">
                                        <AnimatedCounter target={s.value} suffix={s.suffix} />
                                    </div>
                                    <div className="bcb-number-label">{s.label}</div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    SECTION 6 — FEATURE DEEP DIVE: DASES
                ════════════════════════════════════ */}
                <section className="bcb-feature-section" aria-labelledby="feature-dases-heading">
                    <div className="bcb-container">
                        <div className="bcb-feature-row">
                            <FadeIn className="bcb-feature-text">
                                <div className="bcb-section-tag">DASES · Answer Sheet Evaluation</div>
                                <h2 id="feature-dases-heading" className="bcb-feature-title">
                                    The most sophisticated evaluator built for Indian exam formats
                                </h2>
                                <p className="bcb-feature-desc">
                                    Stop treating descriptive answer checking as a burden. DASES turns your marking scheme into an AI evaluator that works at scale, with the consistency you've always wanted.
                                </p>
                                <ul className="bcb-feature-list" role="list">
                                    {[
                                        'Recognizes handwriting from any script quality',
                                        'Parallel processing — all sheets simultaneously',
                                        'Custom rubric builder with partial marks support',
                                        'Student-level AI feedback generation per evaluation',
                                        'Performance heatmaps across the entire class',
                                        'Export: Excel, PDF, CSV for any university system',
                                    ].map((item, i) => (
                                        <li key={i} role="listitem">
                                            <span className="material-symbols-outlined bcb-check-icon" aria-hidden="true">check_circle</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/products/dases" className="bcb-feature-cta">
                                    See Full DASES Feature Set
                                    <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                                </Link>
                            </FadeIn>
                            <FadeIn delay={0.15} className="bcb-feature-visual">
                                <div className="bcb-feature-card bcb-feature-card--dases">
                                    <div className="bcb-feature-card-header">
                                        <div className="bcb-feature-card-icon" aria-hidden="true">
                                            <span className="material-symbols-outlined">grading</span>
                                        </div>
                                        <div>
                                            <div className="bcb-feature-card-title">DASES Evaluation</div>
                                            <div className="bcb-feature-card-sub">Batch: CS-401 · 42 Sheets</div>
                                        </div>
                                        <div className="bcb-processing-badge" aria-label="Processing complete">
                                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check</span>
                                            Done
                                        </div>
                                    </div>
                                    <div className="bcb-score-breakdown">
                                        {[
                                            { q: 'Q1 — Data Structures', score: 18, max: 20, level: 'Apply' },
                                            { q: 'Q2 — Algorithm Analysis', score: 14, max: 20, level: 'Analyse' },
                                            { q: 'Q3 — Graph Theory', score: 22, max: 25, level: 'Evaluate' },
                                            { q: 'Q4 — Sorting Algorithms', score: 28, max: 35, level: 'Remember' },
                                        ].map((row, i) => (
                                            <div key={i} className="bcb-score-row">
                                                <div className="bcb-score-meta">
                                                    <span className="bcb-score-q">{row.q}</span>
                                                    <span className="bcb-score-bloom">{row.level}</span>
                                                </div>
                                                <div className="bcb-score-bar-wrap">
                                                    <div className="bcb-score-bar-track">
                                                        <motion.div
                                                            className="bcb-score-bar-fill"
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${(row.score / row.max) * 100}%` }}
                                                            transition={{ duration: 1, delay: i * 0.15, ease: 'easeOut' }}
                                                            viewport={{ once: true }}
                                                        />
                                                    </div>
                                                    <span className="bcb-score-frac">{row.score}/{row.max}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bcb-feature-card-footer">
                                        <div className="bcb-grade-display">
                                            <div className="bcb-grade-label">Final Grade</div>
                                            <div className="bcb-grade-val">82<span>/100</span></div>
                                        </div>
                                        <div className="bcb-grade-ai-note">
                                            <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--bcb-green)' }}>smart_toy</span>
                                            AI Feedback Generated
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    SECTION 7 — FEATURE DEEP DIVE: QP MOD
                ════════════════════════════════════ */}
                <section className="bcb-feature-section bcb-feature-section--alt" aria-labelledby="feature-qpmod-heading">
                    <div className="bcb-container">
                        <div className="bcb-feature-row bcb-feature-row--reverse">
                            <FadeIn className="bcb-feature-visual" delay={0.08}>
                                <div className="bcb-feature-card bcb-feature-card--qpmod">
                                    <div className="bcb-audit-header">
                                        <span className="material-symbols-outlined" style={{ color: 'var(--bcb-green)', fontSize: '1.5rem' }}>fact_check</span>
                                        <div>
                                            <div className="bcb-feature-card-title">Moderation Report</div>
                                            <div className="bcb-feature-card-sub">CS-401 Final Exam · 2025</div>
                                        </div>
                                    </div>
                                    <div className="bcb-audit-items">
                                        {[
                                            { icon: 'check_circle', color: '#22c55e', label: 'Bloom\'s Distribution', status: 'Balanced (HOT: 60%)' },
                                            { icon: 'warning', color: '#f59e0b', label: 'Ambiguity Detected', status: '2 questions flagged' },
                                            { icon: 'check_circle', color: '#22c55e', label: 'Syllabus Coverage', status: '94% topics covered' },
                                            { icon: 'check_circle', color: '#22c55e', label: 'OR-Choice Parity', status: 'Difficulty balanced' },
                                            { icon: 'error', color: '#ef4444', label: 'Out-of-Syllabus', status: 'Q7 flagged — see fix' },
                                        ].map((item, i) => (
                                            <div key={i} className="bcb-audit-row">
                                                <span className="material-symbols-outlined" style={{ color: item.color, fontSize: '1.25rem' }} aria-hidden="true">{item.icon}</span>
                                                <div className="bcb-audit-text">
                                                    <div className="bcb-audit-label">{item.label}</div>
                                                    <div className="bcb-audit-status" style={{ color: item.color }}>{item.status}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bcb-audit-verdict">
                                        <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '1rem' }}>pending</span>
                                        Needs Minor Revisions — 2 Issues
                                    </div>
                                </div>
                            </FadeIn>
                            <FadeIn className="bcb-feature-text" delay={0.15}>
                                <div className="bcb-section-tag">QP Moderation · Quality Assurance</div>
                                <h2 id="feature-qpmod-heading" className="bcb-feature-title">
                                    Never let an unfair question paper reach your students again
                                </h2>
                                <p className="bcb-feature-desc">
                                    Our 10-point AI audit catches what committee reviews miss — in a fraction of the time.
                                </p>
                                <ul className="bcb-feature-list" role="list">
                                    {[
                                        'Bloom\'s Taxonomy auto-classification for every question',
                                        'Ambiguity detection with AI-suggested rewrites',
                                        'OR-choice difficulty parity check (unique to BigChalkBox)',
                                        'Syllabus coverage heatmap — overtested & undertested topics',
                                        'Out-of-syllabus detection with instant flag',
                                        'Export as PDF, Word, or PowerPoint for Academic Committee',
                                    ].map((item, i) => (
                                        <li key={i} role="listitem">
                                            <span className="material-symbols-outlined bcb-check-icon" aria-hidden="true">check_circle</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/products/qp-moderation" className="bcb-feature-cta">
                                    Explore QP Moderation
                                    <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                                </Link>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    SECTION 8 — COMPARISON TABLE
                ════════════════════════════════════ */}
                <section className="bcb-compare" aria-label="BigChalkBox vs traditional methods comparison">
                    <div className="bcb-container">
                        <FadeIn className="bcb-section-header">
                            <div className="bcb-section-tag">Why BigChalkBox</div>
                            <h2 className="bcb-section-title">The Numbers Don't Lie</h2>
                            <p className="bcb-section-desc">A direct look at what changes when institutions adopt BigChalkBox.</p>
                        </FadeIn>
                        <FadeIn delay={0.1}>
                            <div className="bcb-compare-table-wrap" role="region" aria-label="Comparison table">
                                <table className="bcb-compare-table">
                                    <thead>
                                        <tr>
                                            <th scope="col">Dimension</th>
                                            <th scope="col" className="bcb-col-old">Traditional / Manual</th>
                                            <th scope="col" className="bcb-col-new">BigChalkBox</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            ['Grading 500 answer sheets', '5–7 days per faculty', '15 minutes'],
                                            ['Grading consistency', 'Varies by evaluator mood & fatigue', '98.2% rubric adherence'],
                                            ['Student feedback', 'Marks only — no comments', 'Per-question AI feedback for every student'],
                                            ['QP moderation', '3–5 day committee review', '4 hours with full written report'],
                                            ['Audit trail', 'None (or manual records)', 'Complete, time-stamped digital record'],
                                            ['Scalability', 'Limited by faculty count & time', 'Unlimited — scales instantly'],
                                            ['NAAC/IQAC reporting', 'Manual data collection', 'Auto-generated, exportable'],
                                        ].map(([dim, old, nw], i) => (
                                            <tr key={i}>
                                                <td className="bcb-compare-dim">{dim}</td>
                                                <td className="bcb-col-old-val">
                                                    <span className="material-symbols-outlined bcb-x-icon" aria-hidden="true">close</span>
                                                    {old}
                                                </td>
                                                <td className="bcb-col-new-val">
                                                    <span className="material-symbols-outlined bcb-check-icon" aria-hidden="true">check</span>
                                                    {nw}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    SECTION 9 — SEO FAQ (GEO-OPTIMISED)
                ════════════════════════════════════ */}
                <section className="bcb-faq" aria-labelledby="faq-heading">
                    <div className="bcb-container">
                        <FadeIn className="bcb-section-header">
                            <div className="bcb-section-tag">Common Questions</div>
                            <h2 id="faq-heading" className="bcb-section-title">Everything You Need to Know</h2>
                            <p className="bcb-section-desc">Straightforward answers to the questions decision-makers always ask.</p>
                        </FadeIn>
                        <div className="bcb-faq-list" role="list">
                            {FAQS.map((faq, i) => (
                                <FadeIn key={i} delay={i * 0.05}>
                                    <div
                                        className={`bcb-faq-item ${openFaq === i ? 'bcb-faq-item--open' : ''}`}
                                        role="listitem"
                                    >
                                        <button
                                            className="bcb-faq-q"
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            aria-expanded={openFaq === i}
                                            aria-controls={`faq-answer-${i}`}
                                            id={`faq-question-${i}`}
                                        >
                                            <span>{faq.q}</span>
                                            <span className="material-symbols-outlined bcb-faq-chevron" aria-hidden="true">
                                                {openFaq === i ? 'remove' : 'add'}
                                            </span>
                                        </button>
                                        <motion.div
                                            id={`faq-answer-${i}`}
                                            role="region"
                                            aria-labelledby={`faq-question-${i}`}
                                            className="bcb-faq-a"
                                            initial={false}
                                            animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <p>{faq.a}</p>
                                        </motion.div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    SECTION 10 — GEO PROSE BLOCK
                ════════════════════════════════════ */}
                <section className="bcb-geo-prose" aria-label="About BigChalkBox">
                    <div className="bcb-container">
                        <FadeIn>
                            <div className="bcb-geo-card">
                                <div className="bcb-geo-icon" aria-hidden="true">
                                    <span className="material-symbols-outlined">school</span>
                                </div>
                                <div className="bcb-geo-text">
                                    <h2 className="bcb-geo-title">About BigChalkBox</h2>
                                    <p>
                                        <strong>BigChalkBox Innovations LLP</strong> develops AI software for Indian educational institutions.
                                        Their product suite includes: <strong>DASES</strong> (automated answer sheet evaluation), <strong>QP Moderation</strong> (question paper quality auditing),{' '}
                                        <strong>QP Generation</strong> (AI-assisted question creation), <strong>Teacher Notes</strong> (automated PPT and lecture note generation), and <strong>Exam Prep</strong> (personalized student study material).
                                    </p>
                                    <p>
                                        DASES uses multimodal AI to read handwritten descriptive answers and evaluate them against teacher-defined rubrics.
                                        QP Moderation uses Bloom's Taxonomy classification to audit exam papers for cognitive balance and syllabus coverage.
                                        BigChalkBox operates in India and serves universities, deemed-to-be universities, engineering colleges, and examination boards.
                                    </p>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    SECTION 11 — BOOK DEMO FORM
                ════════════════════════════════════ */}
                <BookDemoForm />
            </main>

            <SiteFooter />

            {/* ─── Sticky Mobile CTA ─── */}
            <motion.div
                className="bcb-mobile-cta"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: showMobileCta ? 0 : 100, opacity: showMobileCta ? 1 : 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden={!showMobileCta}
            >
                <span className="bcb-mobile-cta-text">Ready to see it live?</span>
                <a href="#book-demo" className="bcb-btn-gold bcb-btn-gold--sm">
                    Book Demo
                </a>
            </motion.div>
        </div>
    )
}
