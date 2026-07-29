'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import SiteHeader from '../../../components/shared/SiteHeader'
import SiteFooter from '../../../components/shared/SiteFooter'
import BookDemoForm from '../../../components/BookDemoForm'

const Reveal = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true, margin: '-60px' }}>{children}</motion.div>
)

export default function TeacherNotesPage() {
  return (
    <div style={{ background: '#FCFCF7', color: '#1A2421', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>
      <SiteHeader />
      <section style={{ position: 'relative', paddingTop: '8rem', paddingBottom: '7rem', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(28,95,32,0.07) 1.5px, transparent 1.5px)', backgroundSize: '36px 36px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
          <Reveal>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '3rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_back</span>Back to Home
            </Link>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div>
              <Reveal>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.1rem', background: 'rgba(191,155,48,0.08)', border: '1px solid rgba(191,155,48,0.2)', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 900, color: '#BF9B30', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>rocket_launch</span>
                  In Development — Q1 2026
                </span>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(2.5rem, 4.5vw, 4.5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
                  Lecture notes,<br />
                  <span style={{ background: 'linear-gradient(135deg, #1C5F20 0%, #BF9B30 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>written in seconds.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ fontSize: '1.15rem', color: '#64748b', fontWeight: 500, lineHeight: 1.75, maxWidth: '480px', marginBottom: '2.5rem' }}>
                  Upload a raw syllabus document, a chapter PDF, or a topic list. Teacher Notes outputs structured lesson plans, lecture slides, and concise revision handouts — automatically.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <a href="#notify" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.25rem', background: '#1C5F20', color: 'white', borderRadius: '9999px', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 12px 32px rgba(28,95,32,0.28)', transition: 'all 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>notifications</span>
                  Join the Waitlist
                </a>
              </Reveal>
            </div>
            {/* Mock output preview */}
            <Reveal delay={0.2}>
              <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '1.75rem', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.1)', borderTop: '4px solid #1C5F20' }}>
                <div style={{ background: '#f8fafc', borderBottom: '1px solid #E2E8F0', padding: '0.875rem 1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {['#fe5f57','#febb2c','#27c840'].map((c, i) => <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginLeft: '0.75rem' }}>Teacher Notes · Unit 4 — Trees and Graphs</span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#1C5F20', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem' }}>Generated Outputs</div>
                  {[
                    { icon: 'slideshow', label: 'Lecture Slides', count: '18 slides · editable PPT', color: '#1C5F20' },
                    { icon: 'description', label: 'Lesson Plan', count: 'Unit plan · 4 hours', color: '#3B8A40' },
                    { icon: 'article', label: 'Student Handout', count: '6 pages · PDF ready', color: '#BF9B30' },
                    { icon: 'quiz', label: 'Class Exercise Set', count: '12 questions · mixed level', color: '#1C5F20' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', background: '#f8fafc', borderRadius: '0.75rem', marginBottom: '0.5rem', border: '1px solid #E2E8F0' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.4rem', color: item.color }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1A2421' }}>{item.label}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>{item.count}</div>
                      </div>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: '#22c55e', marginLeft: 'auto' }}>check_circle</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section style={{ padding: '7rem 0', background: 'white', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          <Reveal><div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '1rem' }}>What Teacher Notes generates</h2>
          </div></Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
            {[
              { icon: 'slideshow', title: 'Structured Lecture Slides', desc: 'Topic-by-topic slides with explanations, examples, and diagrams — exported as editable PowerPoint files ready to present.' },
              { icon: 'description', title: 'Detailed Lesson Plans', desc: 'Unit plans with learning outcomes, time allocation per topic, teaching methods, and formative assessment checkpoints.' },
              { icon: 'article', title: 'Student Handouts', desc: 'Concise, structured revision notes for students — with definitions, worked examples, and key-point summaries per chapter.' },
              { icon: 'quiz', title: 'In-Class Exercise Sets', desc: 'Quick questions and worked examples per topic, calibrated to the Bloom\'s level of the lesson — for live classroom use.' },
              { icon: 'school', title: 'CO–PO Mapping', desc: 'Course Outcome to Program Outcome mapping tables — auto-generated from syllabus and lesson content for NAAC compliance.' },
              { icon: 'edit', title: 'Faculty Editing Control', desc: 'Every output is fully editable in Word/PPT before publishing. AI-generated content is a starting draft, not a final product.' },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <motion.div whileHover={{ y: -4, borderColor: 'rgba(28,95,32,0.25)', boxShadow: '0 12px 36px rgba(0,0,0,0.08)' }}
                  style={{ background: '#FCFCF7', border: '1px solid #E2E8F0', borderRadius: '1.5rem', padding: '2rem', transition: 'all 0.3s' }}
                >
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: '#EEF5EE', border: '1px solid rgba(28,95,32,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1C5F20', marginBottom: '1.25rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.35rem' }}>{f.icon}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.1rem', fontWeight: 700, color: '#1A2421', marginBottom: '0.625rem', lineHeight: 1.3 }}>{f.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="notify" style={{ padding: '7rem 0', background: '#1A2421' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <Reveal>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#1C5F20', marginBottom: '1.5rem', display: 'block' }}>cast_for_education</span>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.75rem,3.5vw,2.75rem)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.025em' }}>Teacher Notes launches Q1 2026</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.7, marginBottom: '2.5rem' }}>Join the waitlist for early access and launch-day pricing.</p>
          </Reveal>
          <Reveal delay={0.1}><BookDemoForm /></Reveal>
        </div>
      </section>
      <SiteFooter />
      <style>{`@media (max-width: 900px) { div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; } div[style*="grid-template-columns: repeat(3,1fr)"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
