'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import SiteHeader from '../../components/shared/SiteHeader'
import SiteFooter from '../../components/shared/SiteFooter'

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

const PERKS = [
  { icon: 'bolt', title: 'Ship on Day 1', desc: 'No multi-week onboarding or red tape. You will push code to production on your first day.' },
  { icon: 'memory', title: 'Hard AI Problems', desc: 'We aren\'t an OpenAI wrapper. You will build proprietary OCR, NLP models, and evaluation algorithms.' },
  { icon: 'terminal', title: 'Modern Stack', desc: 'Next.js, Python, custom LLMs. Zero legacy spaghetti code to maintain.' },
  { icon: 'monitoring', title: 'Massive Scale', desc: 'Our systems process hundreds of thousands of documents. Your code immediately impacts millions of users.' },
  { icon: 'block', title: 'No BS Meetings', desc: 'We operate on a maker schedule. Async-first communication so you have uninterrupted blocks to actually code.' },
  { icon: 'groups', title: 'High Talent Density', desc: 'You will work exclusively alongside senior, highly-focused engineers. No hand-holding, just execution.' },
]

const ROLES = [
  {
    title: 'Senior Full-Stack Engineer',
    team: 'Engineering',
    location: 'Remote (India)',
    type: 'Full-time',
    desc: 'Architect and scale the core DASES platform using Next.js, Node, and Python. You will lead technical decisions and mentor junior devs.'
  },
  {
    title: 'AI / ML Researcher',
    team: 'Deep Tech',
    location: 'Remote (Global)',
    type: 'Full-time',
    desc: 'Train and fine-tune models for handwritten text recognition (HTR) and semantic evaluation algorithms.'
  },
  {
    title: 'Product Designer (UI/UX)',
    team: 'Design',
    location: 'Remote (India)',
    type: 'Full-time',
    desc: 'Design beautiful, highly intuitive interfaces that make complex educational workflows feel effortless.'
  }
]

export default function CareersPage() {
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
                Join The Team
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(3rem, 7vw, 6.5rem)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.04em', textTransform: 'uppercase', marginBottom: '2.5rem' }}>
                Build the future<br />
                <span style={{ color: 'var(--color-gold)' }}>of education.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <div style={{ maxWidth: '600px' }}>
                <p style={{ fontSize: '1.25rem', color: 'var(--color-ink-soft)', fontWeight: 500, lineHeight: 1.7, margin: 0 }}>
                  We are a lean, engineering-first deep tech company. We hire builders who want to solve the hardest problems in EdTech and ship tools that millions of students and teachers will rely on.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ==================== PERKS ==================== */}
        <section style={{ padding: '8rem 0', background: 'var(--color-cream-dark)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '1rem', color: 'var(--color-ink)' }}>
                  Why Big Chalk Box?
                </h2>
                <p style={{ color: 'var(--color-ink-soft)', fontSize: '1.1rem', fontWeight: 500, maxWidth: '500px', margin: '0 auto' }}>
                  We treat our team like adults. High autonomy, deep focus, and zero micro-management.
                </p>
              </div>
            </Reveal>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {PERKS.map((perk, idx) => (
                <Reveal key={idx} delay={idx * 0.05}>
                  <motion.div whileHover={{ y: -4, borderColor: `var(--color-gold)`, boxShadow: '0 12px 36px rgba(0,0,0,0.04)' }}
                    style={{ background: 'var(--color-cream)', border: '1px solid var(--color-border)', borderRadius: '1rem', padding: '2.5rem', height: '100%', transition: 'all 0.3s' }}
                  >
                    <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: 'rgba(20,90,56,0.08)', border: '1px solid rgba(20,90,56,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', marginBottom: '1.5rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>{perk.icon}</span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                      {perk.title}
                    </h3>
                    <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>
                      {perk.desc}
                    </p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== OPEN ROLES ==================== */}
        <section style={{ padding: '8rem 0' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
            <Reveal>
              <div style={{ marginBottom: '4rem' }}>
                <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
                  Open<br />Roles
                </h2>
              </div>
            </Reveal>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {ROLES.map((role, idx) => (
                <Reveal key={idx} delay={idx * 0.1}>
                  <div style={{ padding: '2.5rem', border: '1px solid var(--color-border)', borderRadius: '1rem', background: 'var(--color-cream-dark)', transition: 'border-color 0.3s' }}
                       onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-gold)'}
                       onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '0.75rem' }}>
                          {role.title}
                        </h3>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold)' }}>{role.team}</span>
                          <span style={{ color: 'var(--color-border)' }}>•</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)' }}>{role.location}</span>
                          <span style={{ color: 'var(--color-border)' }}>•</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)' }}>{role.type}</span>
                        </div>
                      </div>
                      <a href="mailto:admin@bigchalkbox.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', background: 'var(--color-ink)', color: 'white', borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', transition: 'all 0.25s', flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        Apply Now <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_forward</span>
                      </a>
                    </div>
                    <p style={{ color: 'var(--color-ink-soft)', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500, margin: 0, maxWidth: '700px' }}>
                      {role.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <div style={{ marginTop: '4rem', padding: '2rem', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: '1rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '0.5rem' }}>Don't see a fit?</h4>
                <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '1.25rem' }}>We are always looking for exceptional talent. Reach out anyway.</p>
                <a href="mailto:admin@bigchalkbox.com" style={{ color: 'var(--color-gold)', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>admin@bigchalkbox.com</a>
              </div>
            </Reveal>
          </div>
        </section>

      </main>

      <SiteFooter />
      <style>{`
        @media (max-width: 900px) { 
          div[style*="grid-template-columns: repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
