'use client'

import Link from 'next/link'
import { useState } from 'react'
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

export default function BlogArticle({ article, allArticles }) {
    const [openFaq, setOpenFaq] = useState(null)

    const relatedArticles = allArticles
        .filter(a => a.slug !== article.slug)
        .slice(0, 3)

    return (
        <div style={{ background: 'var(--color-cream)', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
            <SiteHeader />

            <main>
                {/* ==================== ARTICLE HERO ==================== */}
                <section style={{ paddingTop: '10rem', paddingBottom: '4rem', position: 'relative', overflow: 'hidden' }}>
                    <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(20,90,56,0.06) 1.5px, transparent 1.5px)', backgroundSize: '36px 36px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
                        <Reveal>
                            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-ink-soft)', marginBottom: '3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <Link href="/" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Home</Link>
                                <span style={{ opacity: 0.5 }}>/</span>
                                <Link href="/blog" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Journal</Link>
                                <span style={{ opacity: 0.5 }}>/</span>
                                <span style={{ color: 'var(--color-gold)' }}>{article.category}</span>
                            </nav>
                        </Reveal>

                        <Reveal delay={0.1}>
                            <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
                                {article.title}
                            </h1>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <p style={{ fontSize: '1.25rem', color: 'var(--color-ink-soft)', fontWeight: 500, lineHeight: 1.7, margin: '0 0 3rem 0' }}>
                                {article.description}
                            </p>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem 0', borderTop: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '1rem', fontWeight: 700 }}>{article.author ? article.author.name : 'Big Chalk Box Engineering'}</span>
                                    {article.author && article.author.credentials && (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>{article.author.credentials}</span>
                                    )}
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', fontWeight: 500 }}>
                                        {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ==================== HERO ANSWER ==================== */}
                <section style={{ padding: '0 0 4rem 0' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
                        <Reveal>
                            <div style={{ background: 'var(--color-ink)', color: 'var(--color-cream)', padding: '2rem', borderRadius: '1rem' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                                    The Short Answer
                                </div>
                                {article.isHtml ? (
                                    <div 
                                        className="hero-answer-text blog-html-content"
                                        style={{ fontSize: '1.1rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}
                                        dangerouslySetInnerHTML={{ __html: article.heroAnswer }}
                                    />
                                ) : (
                                    <p className="hero-answer-text" style={{ fontSize: '1.1rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                                        {article.heroAnswer}
                                    </p>
                                )}
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ==================== ARTICLE BODY ==================== */}
                <section style={{ padding: '0 0 6rem 0' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {article.sections.map((section, idx) => (
                                <Reveal key={idx}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
                                            {section.heading}
                                        </h2>
                                        {article.isHtml ? (
                                            <div 
                                                className="blog-html-content"
                                                style={{ fontSize: '1.1rem', color: 'var(--color-ink-soft)', lineHeight: 1.8, fontWeight: 400 }}
                                                dangerouslySetInnerHTML={{ __html: section.content }}
                                            />
                                        ) : (
                                            <div style={{ fontSize: '1.1rem', color: 'var(--color-ink-soft)', lineHeight: 1.8, fontWeight: 400 }}>
                                                <p style={{ margin: 0 }}>{section.content}</p>
                                            </div>
                                        )}
                                    </div>
                                    {article.screenshots && article.screenshots[idx] && (
                                        <div style={{ margin: '3rem 0', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-cream-dark)', padding: '1rem' }}>
                                            <img src={article.screenshots[idx].src} alt={article.screenshots[idx].alt} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '0.5rem' }} />
                                            {article.screenshots[idx].caption && (
                                                <p style={{ fontSize: '0.95rem', color: 'var(--color-ink-soft)', marginTop: '1rem', textAlign: 'center', fontStyle: 'italic', fontWeight: 500 }}>
                                                    {article.screenshots[idx].caption}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </Reveal>
                            ))}

                            {/* INLINE COMPARISON TABLE */}
                            {article.comparisonTable && (
                                <Reveal>
                                    <div style={{ margin: '2rem 0 4rem 0', overflowX: 'auto', borderRadius: '1rem', border: '1px solid var(--color-border)', background: 'var(--color-cream)' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--color-cream-dark)', borderBottom: '2px solid var(--color-border)' }}>
                                                    {article.comparisonTable.headers.map((header, i) => (
                                                        <th key={i} style={{ padding: '1.5rem 1rem', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-ink)' }}>{header}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {article.comparisonTable.rows.map((row, i) => (
                                                    <tr key={i} style={{ borderBottom: i === article.comparisonTable.rows.length - 1 ? 'none' : '1px solid var(--color-border)' }}>
                                                        {row.map((cell, j) => (
                                                            <td key={j} style={{ padding: '1.25rem 1rem', color: j === 0 ? 'var(--color-ink)' : 'var(--color-ink-soft)', fontWeight: j === 0 ? 600 : 400, fontSize: '1.05rem', lineHeight: 1.5 }}>{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Reveal>
                            )}

                            {/* INLINE FAQ */}
                            {article.faqItems && article.faqItems.length > 0 && (
                                <Reveal>
                                    <div style={{ marginTop: '3rem', paddingTop: '3rem', borderTop: '1px solid var(--color-border)' }}>
                                        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '2rem' }}>
                                            Frequently Asked Questions
                                        </h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {article.faqItems.map((faq, idx) => (
                                                <div 
                                                    key={idx} 
                                                    style={{ background: 'var(--color-cream-dark)', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--color-border)' }}
                                                >
                                                    <button 
                                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', fontSize: '1.1rem', fontWeight: 600 }}
                                                    >
                                                        <span>{faq.question}</span>
                                                        <span style={{ fontSize: '1.5rem', color: 'var(--color-gold)', transform: openFaq === idx ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                                                            +
                                                        </span>
                                                    </button>
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: openFaq === idx ? 'auto' : 0, opacity: openFaq === idx ? 1 : 0 }}
                                                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                                    >
                                                        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: 'var(--color-ink-soft)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                                                            {faq.answer}
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Reveal>
                            )}
                        </div>
                    </div>
                </section>

                {/* ==================== RELATED ==================== */}
                {relatedArticles.length > 0 && (
                    <section style={{ padding: '6rem 0', background: 'var(--color-cream-dark)', borderTop: '1px solid var(--color-border)' }}>
                        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
                            <Reveal>
                                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '3rem', textAlign: 'center' }}>
                                    Keep Reading
                                </h3>
                            </Reveal>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                {relatedArticles.map((a, idx) => (
                                    <Reveal key={a.slug} delay={idx * 0.1}>
                                        <Link href={`/blog/${a.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                                            <motion.article 
                                                whileHover={{ y: -4, borderColor: `var(--color-gold)` }}
                                                style={{ background: 'var(--color-cream)', border: '1px solid var(--color-border)', borderRadius: '1rem', padding: '2rem', transition: 'all 0.3s', height: '100%', display: 'flex', flexDirection: 'column' }}
                                            >
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'block' }}>
                                                    {a.category}
                                                </span>
                                                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '1rem', lineHeight: 1.2 }}>
                                                    {a.title}
                                                </h4>
                                                <p style={{ color: 'var(--color-ink-soft)', fontSize: '1rem', lineHeight: 1.5, margin: '0 0 auto 0' }}>
                                                    {a.description}
                                                </p>
                                            </motion.article>
                                        </Link>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
                
                {/* ==================== CTA ==================== */}
                <section style={{ padding: '8rem 0', background: 'var(--color-ink)', color: 'white', textAlign: 'center' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
                        <Reveal>
                            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.03em', textTransform: 'uppercase', marginBottom: '2rem' }}>
                                Eliminate grading bottlenecks. <span style={{ color: 'var(--color-gold)' }}>Scale your institution.</span>
                            </h2>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <Link href="/#contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '1rem 2.5rem', background: 'var(--color-gold)', color: 'white', borderRadius: '9999px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', transition: 'all 0.25s' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                            >
                                Book a Free Demo
                            </Link>
                        </Reveal>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    )
}
