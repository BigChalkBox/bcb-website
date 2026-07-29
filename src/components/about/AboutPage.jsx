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

const stats = [
  { value: '1000s', label: 'OF HOURS SAVED' },
  { value: '500+', label: 'SHEETS IN PARALLEL' },
  { value: '10x', label: 'FASTER EVALUATION' },
  { value: '100%', label: 'SYLLABUS ALIGNED' },
]

const dnaList = [
  {
    num: '01',
    title: 'EDUCATOR FIRST',
    desc: 'Technology must adapt to the teacher, never the other way around. We build tools that align with actual classroom workflows.',
  },
  {
    num: '02',
    title: 'DEEP TECH, SIMPLE UX',
    desc: 'We handle the complex AI behind the scenes, so the end-user just clicks a button.',
  },
  {
    num: '03',
    title: 'BUILT IN INDIA, FOR THE WORLD',
    desc: 'Engineering world-class solutions locally with a vision for global scale. We solve local problems with global standards.',
  },
]

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--color-cream)', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      <SiteHeader />

      <main>
        {/* ==================== HERO ==================== */}
        <section style={{ paddingTop: '10rem', paddingBottom: '6rem', position: 'relative', overflow: 'hidden' }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(20,90,56,0.06) 1.5px, transparent 1.5px)', backgroundSize: '36px 36px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)' }} />
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
            <Reveal>
              <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(3.5rem, 8vw, 8rem)', fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.04em', textTransform: 'uppercase', marginBottom: '2.5rem' }}>
                We Are<br />
                <span style={{ color: 'var(--color-gold)' }}>Big Chalk Box.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{ maxWidth: '600px', marginLeft: 'auto' }}>
                <p style={{ fontSize: '1.25rem', color: 'var(--color-ink-soft)', fontWeight: 500, lineHeight: 1.7, marginBottom: '2rem' }}>
                  An EdTech engineering company solving the hardest, most tedious problems in education so teachers can get back to teaching.
                </p>
                <div style={{ height: '1px', width: '100%', background: 'var(--color-border)' }} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ==================== STATS ==================== */}
        <section style={{ padding: '2rem 0 6rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {stats.map((stat, idx) => (
                <Reveal key={idx} delay={idx * 0.1}>
                  <div style={{ padding: '2rem 0', borderTop: '2px solid var(--color-ink)' }}>
                    <div style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--color-gold)', lineHeight: 1, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
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

        {/* ==================== WHY WE EXIST ==================== */}
        <section style={{ padding: '8rem 0', background: 'var(--color-cream-dark)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', alignItems: 'start' }}>
              {/* Left Title */}
              <div style={{ position: 'sticky', top: '8rem' }}>
                <Reveal>
                  <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
                    Why<br />We<br />Exist
                  </h2>
                </Reveal>
              </div>
              
              {/* Right Content */}
              <div>
                <Reveal>
                  <div style={{ marginBottom: '5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: 'var(--color-gold)' }}>warning</span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-ink)' }}>The Problem</h3>
                    </div>
                    <p style={{ fontSize: '1.5rem', color: 'var(--color-ink-soft)', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                      Education technology has focused on everything except the heavy lifting. Teachers are drowning in administrative work and manual grading instead of pedagogy.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={0.1}>
                  <div style={{ marginBottom: '5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: 'var(--color-gold)' }}>flag</span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-ink)' }}>Our Mission</h3>
                    </div>
                    <p style={{ fontSize: '1.5rem', color: 'var(--color-ink-soft)', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                      We build deep-tech solutions (like advanced OCR and LLM-based evaluation) to automate the most grueling parts of an educator's job.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={0.2}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: 'var(--color-gold)' }}>architecture</span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-ink)' }}>Our Approach</h3>
                    </div>
                    <p style={{ fontSize: '1.5rem', color: 'var(--color-ink-soft)', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                      Pilot-first, educator-driven. We don't build in a vacuum. We sit with universities and schools to co-develop tools that actually work in the real world.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== DNA ==================== */}
        <section style={{ padding: '8rem 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
            <Reveal>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '4rem', textAlign: 'center' }}>
                What Drives Us
              </h2>
            </Reveal>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {dnaList.map((item, idx) => (
                <Reveal key={idx} delay={idx * 0.1}>
                  <motion.div whileHover={{ y: -4, borderColor: `var(--color-gold)`, boxShadow: '0 12px 36px rgba(0,0,0,0.04)' }}
                    style={{ background: 'var(--color-cream-dark)', border: '1px solid var(--color-border)', borderRadius: '1rem', padding: '2.5rem', height: '100%', transition: 'all 0.3s' }}
                  >
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'rgba(20,90,56,0.15)', fontFamily: 'var(--font-sans)', lineHeight: 1, marginBottom: '1.5rem' }}>
                      {item.num}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '1rem', lineHeight: 1.2 }}>
                      {item.title}
                    </h3>
                    <p style={{ color: 'var(--color-ink-soft)', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
                      {item.desc}
                    </p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== TEAM & STORY ==================== */}
        <section style={{ padding: '8rem 0', background: 'var(--color-ink)', color: 'var(--color-cream)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', alignItems: 'center' }}>
              <Reveal>
                <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.03em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
                  Our<br />Story
                </h2>
              </Reveal>
              <div>
                <Reveal delay={0.1}>
                  <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, lineHeight: 1.6, marginBottom: '2rem' }}>
                    Big Chalk Box was founded by a highly focused team of engineers and educators based in India. We saw firsthand how much time was wasted on manual processes in schools and universities.
                  </p>
                </Reveal>
                <Reveal delay={0.2}>
                  <p style={{ fontSize: '1.5rem', color: 'var(--color-cream)', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                    Our flagship product, DASES, is just the beginning. We are committed to building a suite of tools that fundamentally changes how institutions operate, evaluate, and educate.
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== CTA ==================== */}
        <section style={{ padding: '8rem 0', background: 'var(--color-gold)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
            <Reveal>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.03em', textTransform: 'uppercase', marginBottom: '3rem' }}>
                Join Our<br />Journey.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/products/dases" style={{ display: 'inline-flex', alignItems: 'center', padding: '1rem 2.5rem', background: 'var(--color-ink)', color: 'white', borderRadius: '9999px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', transition: 'all 0.25s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  Explore DASES
                </Link>
                <Link href="/#contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '1rem 2.5rem', background: 'transparent', color: 'var(--color-ink)', borderRadius: '9999px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', border: '2px solid var(--color-ink)', transition: 'all 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-ink)'; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-ink)' }}
                >
                  Contact Us
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
      <style>{`
        @media (max-width: 900px) { 
          div[style*="grid-template-columns: repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="grid-template-columns: repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 2fr"] { grid-template-columns: 1fr !important; gap: 2rem !important; }
          div[style*="position: sticky"] { position: relative !important; top: 0 !important; }
        }
        @media (max-width: 500px) {
          div[style*="grid-template-columns: repeat(4, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
