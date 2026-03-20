'use client'

import Link from 'next/link'
import { useState } from 'react'
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

export default function BlogArticle({ article, allArticles }) {
    const [openFaq, setOpenFaq] = useState(null)

    const relatedArticles = allArticles
        .filter(a => a.slug !== article.slug)
        .slice(0, 3)

    return (
        <div className="blog-page">
            <SiteHeader />

            <main>
                {/* ARTICLE HEADER */}
                <section className="article-hero">
                    <div className="article-hero-blur"></div>
                    <div className="blog-container">
                        <FadeIn>
                            <nav className="article-breadcrumb">
                                <Link href="/">Home</Link>
                                <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>chevron_right</span>
                                <Link href="/blog">Blog</Link>
                                <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>chevron_right</span>
                                <span className="current">{article.category}</span>
                            </nav>

                            <div className="article-meta-top">
                                <span className="article-category">{article.category}</span>
                                <span className="article-read-time">
                                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>schedule</span>
                                    {article.readTime}
                                </span>
                            </div>

                            <h1 className="article-title">{article.title}</h1>
                            <p className="article-subtitle">{article.description}</p>

                            <div className="article-meta-bottom">
                                <div className="article-author">
                                    <div className="article-author-avatar">
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: 'white' }}>smart_toy</span>
                                    </div>
                                    <div>
                                        <div className="article-author-name">DASES Team</div>
                                        <div className="article-author-org">eSun Smart Solutions Pvt. Ltd.</div>
                                    </div>
                                </div>
                                <div className="article-date">
                                    Published {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* HERO ANSWER — The key GEO element */}
                <section className="article-hero-answer">
                    <div className="blog-container">
                        <FadeIn>
                            <div className="hero-answer-card">
                                <div className="hero-answer-icon">
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>lightbulb</span>
                                </div>
                                <div>
                                    <div className="hero-answer-label">Quick Answer</div>
                                    <p className="hero-answer-text">{article.heroAnswer}</p>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ARTICLE BODY */}
                <section className="article-body">
                    <div className="blog-container">
                        <div className="article-layout">
                            <div className="article-content">
                                {article.sections.map((section, idx) => (
                                    <FadeIn key={idx} delay={idx * 0.05}>
                                        <div className="article-section">
                                            <h2>{section.heading}</h2>
                                            <p>{section.content}</p>
                                        </div>
                                    </FadeIn>
                                ))}

                                {/* INLINE FAQ */}
                                {article.faqItems && article.faqItems.length > 0 && (
                                    <FadeIn>
                                        <div className="article-faq">
                                            <h2>Frequently Asked Questions</h2>
                                            <div className="article-faq-list">
                                                {article.faqItems.map((faq, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`article-faq-item ${openFaq === idx ? 'open' : ''}`}
                                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                                    >
                                                        <div className="article-faq-q">
                                                            <span>{faq.question}</span>
                                                            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
                                                                {openFaq === idx ? 'remove' : 'add'}
                                                            </span>
                                                        </div>
                                                        {openFaq === idx && (
                                                            <motion.div
                                                                className="article-faq-a"
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                <p>{faq.answer}</p>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </FadeIn>
                                )}

                                {/* Tags */}
                                <div className="article-tags">
                                    {article.tags.map(tag => (
                                        <span key={tag} className="blog-tag">{tag}</span>
                                    ))}
                                </div>
                            </div>

                            {/* SIDEBAR */}
                            <aside className="article-sidebar">
                                <div className="sidebar-sticky">
                                    {/* TOC */}
                                    <div className="sidebar-card">
                                        <h4>In This Article</h4>
                                        <ul className="sidebar-toc">
                                            {article.sections.map((section, idx) => (
                                                <li key={idx}>{section.heading}</li>
                                            ))}
                                            {article.faqItems && article.faqItems.length > 0 && (
                                                <li>Frequently Asked Questions</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* CTA */}
                                    <div className="sidebar-cta">
                                        <h4>See DASES in Action</h4>
                                        <p>Book a free demo and watch AI grade a real answer sheet live.</p>
                                        <Link href="/#contact">
                                            <button className="sidebar-cta-btn">
                                                Book Demo <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </section>

                {/* RELATED ARTICLES */}
                <section className="article-related">
                    <div className="blog-container">
                        <FadeIn>
                            <h3 className="related-title">Continue Reading</h3>
                            <div className="related-grid">
                                {relatedArticles.map(a => (
                                    <Link href={`/blog/${a.slug}`} key={a.slug} className="related-card-link">
                                        <div className="related-card">
                                            <span className="related-category">{a.category}</span>
                                            <h4>{a.title}</h4>
                                            <p>{a.description}</p>
                                            <span className="related-read-more">
                                                Read article <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>arrow_forward</span>
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </FadeIn>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    )
}
