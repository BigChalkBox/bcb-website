'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import SiteHeader from '../shared/SiteHeader'
import SiteFooter from '../shared/SiteFooter'
import './BlogPage.css'

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

const categoryColors = {
    Technology: { bg: 'rgba(198, 211, 193, 0.3)', text: 'var(--primary, #2d5a27)' },
    Research: { bg: '#dcfce7', text: 'var(--accent, #22c55e)' },
    Guide: { bg: 'rgba(239, 246, 255, 1)', text: '#3b82f6' },
    Explainer: { bg: 'rgba(255, 253, 245, 1)', text: '#eab308' },
    Comparison: { bg: '#fce4ec', text: '#e91e63' },
}

export default function BlogPage({ articles }) {
    return (
        <div className="blog-page">
            <SiteHeader />

            <main>
                {/* HERO */}
                <section className="blog-hero">
                    <div className="blog-hero-blur"></div>
                    <div className="blog-container">
                        <FadeIn>
                            <div className="blog-hero-badge">DASES Blog</div>
                            <h1 className="blog-hero-title">
                                Insights on <br />
                                <span className="accent">AI-Powered</span><br />
                                Exam Grading
                            </h1>
                            <p className="blog-hero-sub">
                                Expert guides, research, and comparisons on automated descriptive answer evaluation from the team building DASES.
                            </p>
                        </FadeIn>
                    </div>
                </section>

                {/* ARTICLES GRID */}
                <section className="blog-articles">
                    <div className="blog-container">
                        <FadeIn>
                            <div className="blog-grid">
                                {articles.map((article, idx) => {
                                    const catColor = categoryColors[article.category] || categoryColors.Technology
                                    return (
                                        <Link
                                            href={`/blog/${article.slug}`}
                                            key={article.slug}
                                            className="blog-card-link"
                                        >
                                            <motion.article
                                                className="blog-card"
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                                viewport={{ once: true }}
                                            >
                                                <div className="blog-card-top">
                                                    <span
                                                        className="blog-card-category"
                                                        style={{ background: catColor.bg, color: catColor.text }}
                                                    >
                                                        {article.category}
                                                    </span>
                                                    <span className="blog-card-read-time">{article.readTime}</span>
                                                </div>
                                                <h2 className="blog-card-title">{article.title}</h2>
                                                <p className="blog-card-desc">{article.description}</p>
                                                <div className="blog-card-tags">
                                                    {article.tags.slice(0, 3).map(tag => (
                                                        <span key={tag} className="blog-tag">{tag}</span>
                                                    ))}
                                                </div>
                                                <div className="blog-card-footer">
                                                    <span className="blog-card-date">
                                                        {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                    <span className="blog-card-read-more">
                                                        Read article <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
                                                    </span>
                                                </div>
                                            </motion.article>
                                        </Link>
                                    )
                                })}
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* CTA */}
                <section className="blog-cta">
                    <FadeIn>
                        <div className="blog-cta-card">
                            <h2>Ready to see AI grading in action?</h2>
                            <p>Book a free demo and see DASES evaluate a real answer sheet against your rubric live.</p>
                            <div className="blog-cta-buttons">
                                <Link href="/#contact"><button className="blog-btn-primary">Book a Free Demo</button></Link>
                                <Link href="/solutions"><button className="blog-btn-secondary">Explore Solutions</button></Link>
                            </div>
                        </div>
                    </FadeIn>
                </section>
            </main>

            <SiteFooter />
        </div>
    )
}
