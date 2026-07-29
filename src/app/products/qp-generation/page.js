'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import SiteHeader from '../../../components/shared/SiteHeader'
import SiteFooter from '../../../components/shared/SiteFooter'
import BookDemoForm from '../../../components/BookDemoForm'

const FAQS = [
  { q: 'How does the AI know our specific syllabus?', a: 'You simply upload your unit-wise syllabus document during setup. The generator maps every topic and ensures questions are drawn proportionately without skipping or over-testing any unit.' },
  { q: 'Can we control the difficulty level of the paper?', a: 'Yes. You can define exact ratios for Easy, Medium, and Hard questions. The AI respects this cognitive load across the entire paper and within specific sections.' },
  { q: 'What happens if a question was used last year?', a: 'Our Anti-Repeat Engine cross-references your institutional question bank. If a question or a very close variant was used in recent exams, it is automatically excluded.' },
  { q: 'Can faculty review and edit the generated questions?', a: 'Absolutely. The AI generates the first draft in seconds, but every question can be individually edited, swapped for an alternative, or regenerated before final approval.' },
  { q: 'What formats can we export the final paper in?', a: 'Papers can be exported in beautifully formatted Word documents, PDFs, or plain text, complete with marks and Bloom\'s taxonomy tags.' },
]

const Reveal = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true, margin: '-60px' }}>
    {children}
  </motion.div>
)

export default function QPGenerationPage() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div style={{ background: 'var(--color-cream)', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      <SiteHeader />

      {/* HERO */}
      <section style={{ position: 'relative', paddingTop: '8rem', paddingBottom: '7rem', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(20,90,56,0.06) 1.5px, transparent 1.5px)', backgroundSize: '36px 36px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
          <Reveal>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-ink-soft)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '3rem', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-gold)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-ink-soft)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_back</span>Back to Home
            </Link>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div>
              <Reveal>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 900, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'bcbPulse 2s infinite' }} />Live — Active
                  </span>
                  <span style={{ padding: '0.35rem 1rem', background: 'rgba(20,90,56,0.08)', border: '1px solid rgba(20,90,56,0.2)', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 900, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>QP Generation</span>
                </div>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(2.5rem, 4.5vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
                  Syllabus-perfect exams.<br />
                  <span style={{ color: 'var(--color-gold)' }}>Generated in seconds.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ fontSize: '1.15rem', color: 'var(--color-ink-soft)', fontWeight: 500, lineHeight: 1.75, maxWidth: '480px', marginBottom: '2.5rem' }}>
                  Define your syllabus, difficulty curve, and Bloom's targets. QP Generation produces a complete, balanced, anti-repeat question bank automatically.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <a href="#demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.95rem 2rem', background: 'var(--color-gold)', color: 'white', borderRadius: '9999px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', transition: 'all 0.25s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'var(--color-gold-light)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'var(--color-gold)' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>event_available</span>
                    Get Free Demo
                  </a>
                  <a href="#features" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.95rem 1.75rem', background: 'transparent', color: 'var(--color-ink)', borderRadius: '9999px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', border: '1.5px solid var(--color-border)', transition: 'all 0.25s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-gold)'; e.currentTarget.style.color = 'var(--color-gold)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-ink)' }}
                  >
                    Explore Features
                  </a>
                </div>
              </Reveal>
            </div>

            {/* Mock QP Generator UI */}
            <Reveal delay={0.2}>
              <div style={{ background: 'var(--color-cream)', border: '1px solid var(--color-border)', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.06)' }}>
                <div style={{ background: 'var(--color-cream-dark)', borderBottom: '1px solid var(--color-border)', padding: '0.875rem 1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {['#fe5f57','#febb2c','#27c840'].map((c, i) => <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slate)', marginLeft: '0.75rem' }}>QP Generator · Configuration</span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  {[
                    { label: 'Subject', value: 'Data Structures and Algorithms', icon: 'library_books' },
                    { label: 'Total Marks', value: '100 marks · 3 hours', icon: 'timer' },
                    { label: "Bloom's Target", value: 'LOT 30% · HOT 70%', icon: 'psychology' },
                    { label: 'Difficulty', value: 'Easy 20% · Medium 50% · Hard 30%', icon: 'bar_chart' },
                    { label: 'Format', value: '5 Parts · OR-choice sections A–E', icon: 'format_list_numbered' },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 0', borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--color-gold)', flexShrink: 0 }}>{r.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-slate)' }}>{r.label}</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-ink)' }}>{r.value}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: 'rgba(20,90,56,0.06)', border: `1px solid rgba(20,90,56,0.15)`, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: 'var(--color-gold)', animation: 'spin 2s linear infinite' }}>autorenew</span>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-ink)' }}>Generating question bank…</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-ink-soft)', fontWeight: 500 }}>35 unique questions · Anti-repeat verified</div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* VIDEO TUTORIAL */}
      <section style={{ padding: '6rem 0 2rem', background: 'var(--color-cream)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
          <Reveal>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '1rem', border: '1px solid var(--color-border)', boxShadow: '0 24px 64px rgba(0,0,0,0.06)' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src="https://www.youtube.com/embed/M1WxSPve1_s"
                title="QP Generation Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHAT IT DOES */}
      <section id="features" style={{ padding: '8rem 0', background: 'var(--color-cream)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '1rem' }}>Everything you need. <br />Nothing you don't.</h2>
              <p style={{ color: 'var(--color-ink-soft)', fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.7, maxWidth: '480px', margin: '0 auto' }}>Produce examination-ready question banks without ever starting from scratch.</p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
            {[
              { icon: 'library_books', title: 'Syllabus-Aware Generation', desc: 'Upload your unit-wise syllabus. QP Generation draws questions proportionately from every topic — no unit gets over-tested or ignored.' },
              { icon: 'psychology', title: "Bloom's Level Control", desc: 'Set your HOT/LOT percentages. The generator distributes questions across Remember, Understand, Apply, Analyse, and Evaluate instantly.' },
              { icon: 'block', title: 'Anti-Repeat Engine', desc: 'Cross-references your institutional question bank. If a question was used in previous years, it is excluded from the new paper.' },
              { icon: 'tune', title: 'Difficulty Curve Builder', desc: 'Define easy/medium/hard ratios per section. The generator respects the cognitive load across the entire paper.' },
              { icon: 'download', title: 'Export-Ready Output', desc: "Questions export in formatted Word, PDF, or plain text — with marks, Bloom's level, and topic tags pre-attached." },
              { icon: 'edit', title: 'Human-in-the-Loop', desc: 'Every generated question can be individually edited, swapped, or regenerated before the final faculty sign-off.' },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <motion.div whileHover={{ y: -4, borderColor: `var(--color-gold)`, boxShadow: '0 12px 36px rgba(0,0,0,0.04)' }}
                  style={{ background: 'var(--color-cream-dark)', border: '1px solid var(--color-border)', borderRadius: '1rem', padding: '2rem', transition: 'all 0.3s' }}
                >
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.625rem', background: 'rgba(20,90,56,0.08)', border: '1px solid rgba(20,90,56,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.35rem' }}>{f.icon}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '0.625rem', lineHeight: 1.3 }}>{f.title}</h3>
                  <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '7rem 0', background: 'var(--color-cream)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '740px', margin: '0 auto', padding: '0 1.5rem' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <p style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1rem' }}><span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: 'var(--color-gold)', display: 'inline-block' }} />FAQs</p>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(2rem,4vw,2.75rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.025em' }}>Common Questions</h2>
            </div>
          </Reveal>
          {FAQS.map((f, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div style={{ marginBottom: '0.75rem', background: 'var(--color-cream-dark)', border: `1px solid ${openFaq === i ? `var(--color-gold)` : 'var(--color-border)'}`, borderRadius: '0.75rem', overflow: 'hidden', transition: 'all 0.2s' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1.35rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', transition: 'color 0.2s' }}>
                  {f.q}
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: openFaq === i ? 'var(--color-gold)' : 'var(--color-ink-soft)', flexShrink: 0, transition: 'transform 0.3s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>add</span>
                </button>
                <motion.div initial={false} animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }} transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
                  <p style={{ padding: '0 1.5rem 1.35rem', color: 'var(--color-ink-soft)', fontSize: '0.95rem', lineHeight: 1.8, fontWeight: 500, margin: 0 }}>{f.a}</p>
                </motion.div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div id="demo" style={{ background: 'var(--color-cream)' }}><BookDemoForm /></div>

      <SiteFooter />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bcbPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        @media (max-width: 900px) { div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; } div[style*="grid-template-columns: repeat(3,1fr)"] { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
