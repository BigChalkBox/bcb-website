'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import SiteHeader from '../shared/SiteHeader'
import SiteFooter from '../shared/SiteFooter'

const Reveal = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    viewport={{ once: true, margin: "-60px" }}
    className={className}
  >
    {children}
  </motion.div>
)

const solutionCards = [
    {
        icon: 'magic_button',
        title: 'Automated QP Generation',
        desc: 'Create syllabus-aligned question papers with one click. Complete support for complex math, diagrams, and varying difficulty levels.',
        tag: 'Generation',
        link: '/products/qp-generation'
    },
    {
        icon: 'document_scanner',
        title: 'Multi-Format Assembly',
        desc: 'Compile, format, and export exam papers instantly to PDF or LaTeX. Eliminate hours of manual formatting in word processors.',
        tag: 'Generation',
        link: '/products/qp-generation'
    },
    {
        icon: 'psychology',
        title: 'Cognitive Level Analysis',
        desc: 'Automatically map questions to Bloom\'s Taxonomy to ensure a balanced exam that tests both memory and critical thinking.',
        tag: 'Moderation',
        link: '/products/qp-moderation'
    },
    {
        icon: 'rule',
        title: 'Pre-Exam Error Detection',
        desc: 'AI flags ambiguous phrasing, duplicate questions, and mismatched marks before the paper ever reaches the students.',
        tag: 'Moderation',
        link: '/products/qp-moderation'
    },
    {
        icon: 'visibility',
        title: 'Handwriting Intelligence',
        desc: 'Advanced OCR reads complex handwritten student responses, including diagrams, equations, and margin notes with extremely high accuracy.',
        tag: 'Evaluation',
        link: '/products/dases'
    },
    {
        icon: 'auto_awesome',
        title: 'Dynamic Rubric Engine',
        desc: 'Provide model answers and let AI instantly generate detailed, criterion-based rubrics. Supports multiple valid approaches per question.',
        tag: 'Evaluation',
        link: '/products/dases'
    },
    {
        icon: 'bolt',
        title: 'Parallel Grading at Scale',
        desc: 'Process up to 500 answer sheets simultaneously. Each sheet is scored, annotated, and ready for review in under 15 seconds.',
        tag: 'Evaluation',
        link: '/products/dases'
    },
    {
        icon: 'query_stats',
        title: 'Actionable Analytics',
        desc: 'Generate branded reports with deep score breakdowns and criterion-level feedback to close the learning loop for students.',
        tag: 'Reporting',
        link: '/products/dases'
    },
]

export default function SolutionsPage() {
    return (
        <div style={{ background: 'var(--color-cream)', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
            <SiteHeader />

            <main>
                {/* ==================== HERO ==================== */}
                <section style={{ paddingTop: '10rem', paddingBottom: '7rem', position: 'relative', overflow: 'hidden' }}>
                    <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(20,90,56,0.06) 1.5px, transparent 1.5px)', backgroundSize: '36px 36px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)' }} />
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
                        <Reveal>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.25rem', background: 'rgba(20,90,56,0.08)', border: '1px solid rgba(20,90,56,0.2)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>
                                End-to-End Platform
                            </div>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(3.5rem, 8vw, 7rem)', fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.04em', textTransform: 'uppercase', marginBottom: '2.5rem' }}>
                                The Complete<br />
                                <span style={{ color: 'var(--color-gold)' }}>Assessment Engine.</span>
                            </h1>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div style={{ maxWidth: '650px' }}>
                                <p style={{ fontSize: '1.25rem', color: 'var(--color-ink-soft)', fontWeight: 500, lineHeight: 1.7, margin: 0 }}>
                                    From intelligent question paper generation to AI-powered grading and student feedback, Big Chalk Box covers the complete assessment lifecycle so faculty can focus on what matters: teaching.
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.3}>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                                <Link href="/products/dases" style={{ display: 'inline-flex', alignItems: 'center', padding: '1rem 2.5rem', background: 'var(--color-ink)', color: 'var(--color-cream)', borderRadius: '9999px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', transition: 'all 0.25s' }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                >
                                    Explore DASES
                                </Link>
                                <Link href="/products/qp-generation" style={{ display: 'inline-flex', alignItems: 'center', padding: '1rem 2.5rem', background: 'transparent', color: 'var(--color-ink)', borderRadius: '9999px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', border: '2px solid rgba(26,36,33,0.2)', transition: 'all 0.25s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,36,33,0.05)'; e.currentTarget.style.borderColor = 'rgba(26,36,33,0.4)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(26,36,33,0.2)' }}
                                >
                                    Explore QP Generation
                                </Link>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ==================== STATS ==================== */}
                <section style={{ padding: '2rem 0 6rem' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                            {[
                                { value: '10x', label: 'FASTER PAPER CREATION' },
                                { value: '100%', label: 'SYLLABUS ALIGNED' },
                                { value: '98%', label: 'EVALUATION ACCURACY' },
                                { value: '500+', label: 'SHEETS GRADED IN PARALLEL' }
                            ].map((stat, idx) => (
                                <Reveal key={idx} delay={idx * 0.1}>
                                    <div style={{ padding: '2rem 0', borderTop: '2px solid var(--color-ink)' }}>
                                        <div style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--color-gold)', lineHeight: 1, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                                            {stat.value}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-ink-soft)' }}>
                                            {stat.label}
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ==================== SOLUTIONS GRID ==================== */}
                <section style={{ padding: '6rem 0 8rem', background: 'var(--color-cream-dark)', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
                        <Reveal>
                            <div style={{ marginBottom: '5rem', maxWidth: '800px' }}>
                                <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                                    A Complete Suite of EdTech Engineering Solutions
                                </h2>
                                <p style={{ fontSize: '1.25rem', color: 'var(--color-ink-soft)', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                                    Our core products—Generation, Moderation, and Evaluation—are broken down into high-performance modules that replace your entire assessment workflow. No patchwork of tools, just execution.
                                </p>
                            </div>
                        </Reveal>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                            {solutionCards.map((card, idx) => (
                                <Reveal key={idx} delay={idx * 0.05}>
                                    <Link href={card.link || '#'} style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
                                        <motion.div whileHover={{ y: -4, borderColor: `var(--color-gold)`, boxShadow: '0 12px 36px rgba(0,0,0,0.04)' }}
                                            style={{ background: 'var(--color-cream)', border: '1px solid var(--color-border)', borderRadius: '1rem', padding: '2.5rem', height: '100%', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                                        >
                                            <div style={{ display: 'inline-flex', padding: '0.25rem 0.75rem', background: 'var(--color-cream-dark)', border: '1px solid var(--color-border)', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink-soft)', marginBottom: '1.5rem', alignSelf: 'flex-start' }}>
                                                {card.tag}
                                            </div>
                                            <div style={{ color: 'var(--color-gold)', marginBottom: '1.25rem' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>{card.icon}</span>
                                            </div>
                                            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '1rem', lineHeight: 1.2 }}>
                                                {card.title}
                                            </h3>
                                            <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 500, margin: 0, flexGrow: 1 }}>
                                                {card.desc}
                                            </p>
                                            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                Explore Solution <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>arrow_forward</span>
                                            </div>
                                        </motion.div>
                                    </Link>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ==================== CTA ==================== */}
                <section style={{ padding: '8rem 0', background: 'var(--color-ink)', color: 'white', textAlign: 'center' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
                        <Reveal>
                            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.03em', textTransform: 'uppercase', marginBottom: '2rem' }}>
                                Stop grading manually.<br />
                                <span style={{ color: 'var(--color-gold)' }}>Start grading intelligently.</span>
                            </h2>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, lineHeight: 1.6, marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                                See how the Big Chalk Box suite can save your faculty 40+ hours per exam cycle while giving students better, more actionable feedback.
                            </p>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link href="/#contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '1rem 2.5rem', background: 'var(--color-gold)', color: 'white', borderRadius: '9999px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', transition: 'all 0.25s' }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                >
                                    Book a Free Demo
                                </Link>
                                <Link href="/#contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '1rem 2.5rem', background: 'transparent', color: 'var(--color-cream)', borderRadius: '9999px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.2)', transition: 'all 0.25s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                                >
                                    Talk to Our Team
                                </Link>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>

            <SiteFooter />
            <style>{`
                @media (max-width: 1100px) {
                    div[style*="grid-template-columns: repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 600px) {
                    div[style*="grid-template-columns: repeat(4, 1fr)"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    )
}
