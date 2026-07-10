'use client'

import SiteHeader from '../shared/SiteHeader'
import SiteFooter from '../shared/SiteFooter'
import Link from 'next/link'
import { motion } from 'framer-motion'
import './QPModeration.css'

const FadeIn = ({ children, delay = 0, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: "-100px" }}
        className={className}
    >
        {children}
    </motion.div>
)

export default function QPModeration() {
    return (
        <div className="qpm-page">
            <SiteHeader />

            <main>
                {/* HERO SECTION */}
                <section className="qpm-hero">
                    <div className="qpm-container">
                        <FadeIn>
                            <span className="qpm-tag">Academic Quality Assurance</span>
                        </FadeIn>
                        <FadeIn delay={0.1}>
                            <h1 className="qpm-title">
                                Intelligent Question Paper Moderation
                            </h1>
                        </FadeIn>
                        <FadeIn delay={0.2}>
                            <p className="qpm-subtitle">
                                The tireless, objective AI auditor that analyzes your exam papers against syllabi natively. We catch typos, difficulty imbalances, and out-of-syllabus questions before the exam ever reaches a student.
                            </p>
                        </FadeIn>
                    </div>
                </section>

                {/* CORE FEATURES GRID */}
                <section className="qpm-features">
                    <div className="qpm-container">
                        <FadeIn>
                            <h2 className="qpm-section-title">Key Capabilities</h2>
                        </FadeIn>
                        <div className="qpm-grid">
                            <FadeIn delay={0.1} className="qpm-card">
                                <div className="qpm-card-icon">
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>account_tree</span>
                                </div>
                                <h3 className="qpm-card-title">Intelligent Syllabus Management</h3>
                                <p className="qpm-card-text">
                                    Upload any syllabus document. Our AI parses it into a structured format, accurately extracting Course Outcomes (COs), Units, and detailed sub-topics.
                                </p>
                            </FadeIn>

                            <FadeIn delay={0.2} className="qpm-card">
                                <div className="qpm-card-icon">
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>document_scanner</span>
                                </div>
                                <h3 className="qpm-card-title">AI Question Extraction</h3>
                                <p className="qpm-card-text">
                                    Upload PDFs or images. The engine identifies sections, instructions, and handles complex 'OR' choices and mathematical LaTeX seamlessly.
                                </p>
                            </FadeIn>

                            <FadeIn delay={0.3} className="qpm-card">
                                <div className="qpm-card-icon">
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>radar</span>
                                </div>
                                <h3 className="qpm-card-title">Pinpoint Coverage Analysis</h3>
                                <p className="qpm-card-text">
                                    Automatically cross-references every extracted question against the syllabus to detect out-of-syllabus content and validate Course Outcomes.
                                </p>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* 10-POINT AI AUDIT */}
                <section className="qpm-audit">
                    <div className="qpm-container">
                        <FadeIn>
                            <h2 className="qpm-section-title">The 10-Point AI Audit</h2>
                        </FadeIn>
                        <div className="qpm-audit-list">
                            {[
                                { title: "Typo & Grammar Check", desc: "Catches spelling errors that could confuse students." },
                                { title: "Readability Evaluation", desc: "Ensures accessible language for the academic level." },
                                { title: "Ambiguity Detection", desc: "Flags vague phrasing using a smart filter against the syllabus." },
                                { title: "Marks-vs-Effort", desc: "Evaluates if marks align with the required effort and time." },
                                { title: "Grading Ease", desc: "Assesses objective, straightforward grading potential." },
                                { title: "Duplicate Detection", desc: "Scans to ensure no concepts are inadvertently repeated." },
                                { title: "OR-Choice Balance", desc: "Ensures 'OR' alternatives have equal conceptual weight." },
                                { title: "Bloom’s Taxonomy", desc: "Categorizes cognitive levels and warns against rote memorization." },
                                { title: "Difficulty Mix", desc: "Classifies Easy, Medium, or Hard to prevent ceiling effects." },
                                { title: "Active AI Revisions", desc: "Suggests revised text to instantly fix clarity and grading issues." },
                            ].map((item, i) => (
                                <FadeIn delay={i * 0.05} key={i} className="qpm-audit-item">
                                    <span className="material-symbols-outlined qpm-audit-icon">check_circle</span>
                                    <div className="qpm-audit-content">
                                        <h4>{item.title}</h4>
                                        <p>{item.desc}</p>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TECHNICAL EDGE */}
                <section className="qpm-tech">
                    <div className="qpm-container">
                        <FadeIn>
                            <h2 className="qpm-tech-title">The Technical Edge</h2>
                        </FadeIn>
                        <div className="qpm-tech-grid">
                            <FadeIn delay={0.1} className="qpm-tech-card">
                                <h4>Parallel Processing</h4>
                                <p>Runs intensive AI checks concurrently to deliver full paper moderation in seconds.</p>
                            </FadeIn>
                            <FadeIn delay={0.2} className="qpm-tech-card">
                                <h4>Resilient LLM</h4>
                                <p>Built on robust generative models with intelligent fallback mechanisms for parsing safety.</p>
                            </FadeIn>
                            <FadeIn delay={0.3} className="qpm-tech-card">
                                <h4>Clean Extraction</h4>
                                <p>Strict continuous integer indexing and JSON-only outputs ensure database integrity.</p>
                            </FadeIn>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    )
}
