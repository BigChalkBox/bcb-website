'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import SiteHeader from '../../../components/shared/SiteHeader'
import SiteFooter from '../../../components/shared/SiteFooter'
import BookDemoForm from '../../../components/BookDemoForm'

const AUDIT_POINTS = [
  { icon: 'psychology', title: "Bloom's Taxonomy Mapping", desc: "Every question is classified across all Bloom's levels. Know instantly if your LOT/HOT distribution meets policy thresholds." },
  { icon: 'edit_off', title: 'Ambiguity Detection', desc: 'Double-barrelled meanings and missing constraints are flagged instantly — with AI-generated rewrite suggestions.' },
  { icon: 'library_books', title: 'Out-of-Syllabus Checker', desc: 'Cross-references every question against your uploaded syllabus to guarantee alignment and prevent student disputes.' },
  { icon: 'balance', title: 'OR-Choice Difficulty Parity', desc: 'Verifies that both options in internal choices test the exact same difficulty level and cognitive stage.' },
  { icon: 'format_list_numbered', title: 'Mark Distribution Audit', desc: 'Validates section-level and total-mark breakdowns against your precise exam policies (e.g., max 10 marks per section).' },
  { icon: 'translate', title: 'Language Quality Check', desc: 'Highlights grammar issues, passive voice overuse, and confusing phrasing so questions read clearly to every student.' },
  { icon: 'diversity_3', title: 'Cognitive Diversity Score', desc: 'A proprietary score revealing how effectively the paper distributes recall, application, and evaluation.' },
  { icon: 'verified', title: 'Moderation Sign-Off Report', desc: 'Generates a complete, ready-to-file PDF report of all findings, fixes, and scores for your IQAC committee.' },
]

const FAQS = [
  { q: 'What format does the question paper need to be in?', a: 'We accept Word documents, PDFs, and plain text. The AI seamlessly identifies question numbers, marks, and stems automatically — no special formatting template required.' },
  { q: "How does the AI know our institution's syllabus?", a: 'You simply upload your syllabus document once during onboarding. Answer Sheet Evaluation indexes it and acts as your personalized reference for all future out-of-syllabus checks.' },
  { q: "Can we customise the Bloom's policy thresholds?", a: "Absolutely. Institution admins can set exact target percentages for LOT/HOT, minimum HOT requirements, and maximum marks per level." },
  { q: 'How long does a moderation run take?', a: 'A standard 10-question paper completes a full 10-point moderation in under 5 minutes, delivering a comprehensive dashboard of insights instantly.' },
  { q: 'Does this replace our human moderation committee?', a: 'Not at all. Question Paper Moderation is designed to supercharge your committee by automating the tedious, rules-based checks. Your experts can focus on judgment calls and institutional context.' },
]

const Reveal = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true, margin: '-60px' }}>
    {children}
  </motion.div>
)

export default function QPModerationPage() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div style={{ background: 'var(--color-cream)', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      <SiteHeader />
      
      {/* ── HERO ── */}
      <section style={{ position: 'relative', paddingTop: '8rem', paddingBottom: '7rem', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(20,90,56,0.07) 1.5px, transparent 1.5px)', backgroundSize: '36px 36px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)' }} />
        
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
                  <span style={{ padding: '0.35rem 1rem', background: 'rgba(20,90,56,0.08)', border: '1px solid rgba(20,90,56,0.2)', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 900, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Question Paper Moderation</span>
                </div>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(2.5rem, 4.5vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
                  Flawless exams.<br />
                  <span style={{ color: 'var(--color-gold)' }}>Zero manual effort.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ fontSize: '1.15rem', color: 'var(--color-ink-soft)', fontWeight: 500, lineHeight: 1.75, maxWidth: '480px', marginBottom: '2.5rem' }}>
                  Automate your Question Paper Moderation in minutes, not days. A 10-point AI audit checks for Bloom's balance, ambiguity, and out-of-syllabus questions instantly.
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
                  <a href="#audit-points" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.95rem 1.75rem', background: 'transparent', color: 'var(--color-ink)', borderRadius: '9999px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', border: '1.5px solid var(--color-border)', transition: 'all 0.25s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-gold)'; e.currentTarget.style.color = 'var(--color-gold)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-ink)' }}
                  >
                    Explore Features
                  </a>
                </div>
              </Reveal>
            </div>

            {/* Live mock moderation report */}
            <Reveal delay={0.2}>
              <div style={{ background: 'var(--color-cream)', border: '1px solid var(--color-border)', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.06)' }}>
                <div style={{ background: 'var(--color-cream-dark)', borderBottom: '1px solid var(--color-border)', padding: '0.875rem 1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {['#fe5f57','#febb2c','#27c840'].map((c, i) => <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slate)', marginLeft: '0.75rem' }}>Question Paper Moderation · CS-401 Final Exam</span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.25rem' }}>Audit Summary</div>
                  {[
                    { icon: 'check_circle', color: '#22c55e', label: "Bloom's Distribution", val: 'Balanced · HOT: 62%', bg: 'rgba(34,197,94,0.06)' },
                    { icon: 'warning', color: '#f59e0b', label: 'Ambiguity Detected', val: '2 questions flagged', bg: 'rgba(245,158,11,0.06)' },
                    { icon: 'check_circle', color: '#22c55e', label: 'Syllabus Coverage', val: '94% covered', bg: 'rgba(34,197,94,0.06)' },
                    { icon: 'error', color: '#ef4444', label: 'Out-of-Syllabus', val: 'Q7 flagged — see fix below', bg: 'rgba(239,68,68,0.06)' },
                    { icon: 'check_circle', color: '#22c55e', label: 'OR-Choice Parity', val: 'Balanced across all ORs', bg: 'rgba(34,197,94,0.06)' },
                    { icon: 'check_circle', color: '#22c55e', label: 'Mark Distribution', val: '30% LOT / 70% HOT ✓', bg: 'rgba(34,197,94,0.06)' },
                  ].map((item, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      viewport={{ once: true }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.625rem 0.875rem', background: 'transparent', borderRadius: '0.5rem', marginBottom: '0.5rem', border: `1px solid var(--color-border)` }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: item.color, flexShrink: 0 }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-ink)' }}>{item.label}</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--color-ink-soft)' }}>{item.val}</div>
                      </div>
                    </motion.div>
                  ))}
                  <div style={{ marginTop: '0.75rem', padding: '0.875rem 1rem', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: '#f59e0b' }}>pending</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e' }}>Needs Minor Revisions — 3 Issues Found</span>
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
                src="https://www.youtube.com/embed/u5cW1WLE958"
                title="Question Paper Moderation Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section style={{ background: 'var(--color-ink)', padding: '5rem 0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            {[
              { n: '10', label: 'Audit checks per paper', icon: 'fact_check' },
              { n: '5m', label: 'vs 5-day manual review', icon: 'schedule' },
              { n: '100%', label: 'Bloom\'s classified', icon: 'psychology' },
              { n: '0', label: 'Papers left unchecked', icon: 'verified_user' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div style={{ textAlign: 'center', padding: '2rem 1rem', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: 'var(--color-gold)', marginBottom: '0.75rem', display: 'block' }}>{s.icon}</span>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-cream)', lineHeight: 1, marginBottom: '0.5rem' }}>{s.n}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUDIT POINTS ── */}
      <section id="audit-points" style={{ padding: '8rem 0', background: 'var(--color-cream)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '0.875rem' }}>8 checks. Every question. Every time.</h2>
              <p style={{ color: 'var(--color-ink-soft)', fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.7, maxWidth: '480px', margin: '0 auto' }}>A comprehensive safety net for your exams, entirely powered by AI.</p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.5rem' }}>
            {AUDIT_POINTS.map((a, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -4, borderColor: `var(--color-gold)`, boxShadow: '0 12px 36px rgba(0,0,0,0.04)' }}
                  style={{ background: 'var(--color-cream-dark)', border: '1px solid var(--color-border)', borderRadius: '1rem', padding: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', transition: 'all 0.3s' }}
                >
                  <div style={{ width: '3rem', height: '3rem', borderRadius: '0.5rem', background: 'rgba(20,90,56,0.08)', border: '1px solid rgba(20,90,56,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>{a.icon}</span>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '0.5rem', lineHeight: 1.3 }}>{a.title}</h3>
                    <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>{a.desc}</p>
                  </div>
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
      
      <style>{`
        @keyframes bcbPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(2,1fr)"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(4,1fr)"] { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  )
}
