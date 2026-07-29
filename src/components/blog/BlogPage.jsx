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

export default function BlogPage({ articles }) {
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
                                Engineering Journal
                            </div>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(3.5rem, 8vw, 7rem)', fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.04em', textTransform: 'uppercase', marginBottom: '2.5rem' }}>
                                Engineering<br />
                                <span style={{ color: 'var(--color-gold)' }}>EdTech.</span>
                            </h1>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div style={{ maxWidth: '650px' }}>
                                <p style={{ fontSize: '1.25rem', color: 'var(--color-ink-soft)', fontWeight: 500, lineHeight: 1.7, margin: 0 }}>
                                    Deep dives, technical research, and guides on AI-powered evaluation from the engineering team behind the Big Chalk Box suite.
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ==================== ARTICLES LIST ==================== */}
                <section style={{ padding: '4rem 0 8rem' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {articles.map((article, idx) => (
                                <Reveal key={article.slug} delay={idx * 0.05}>
                                    <Link href={`/blog/${article.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                                        <motion.article 
                                            whileHover={{ y: -4, borderColor: `var(--color-gold)`, boxShadow: '0 12px 36px rgba(0,0,0,0.04)' }}
                                            style={{ 
                                                background: 'var(--color-cream-dark)', 
                                                border: '1px solid var(--color-border)', 
                                                borderRadius: '1rem', 
                                                padding: '2.5rem', 
                                                transition: 'all 0.3s' 
                                            }}
                                        >
                                            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                    {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                            
                                            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '1rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                                                {article.title}
                                            </h2>
                                            
                                            <p style={{ color: 'var(--color-ink-soft)', fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
                                                {article.description}
                                            </p>
                                        </motion.article>
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
                                Eliminate grading bottlenecks. <span style={{ color: 'var(--color-gold)' }}>Scale your institution.</span>
                            </h2>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, lineHeight: 1.6, marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                                See how the Big Chalk Box suite evaluates real student answer sheets against your rubric live.
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
                                <Link href="/solutions" style={{ display: 'inline-flex', alignItems: 'center', padding: '1rem 2.5rem', background: 'transparent', color: 'var(--color-cream)', borderRadius: '9999px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.2)', transition: 'all 0.25s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                                >
                                    Explore Solutions
                                </Link>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    )
}
