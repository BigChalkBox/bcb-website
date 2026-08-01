'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import SiteHeader from '../../../components/shared/SiteHeader'
import SiteFooter from '../../../components/shared/SiteFooter'
import BookDemoForm from '../../../components/BookDemoForm'

const Reveal = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true, margin: '-60px' }}>{children}</motion.div>
)

export default function ExamPrepPage() {
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
                  In Development — Q2 2026
                </span>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(2.5rem, 4.5vw, 4.5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
                  Every student gets a<br />
                  <span style={{ background: 'linear-gradient(135deg, #1C5F20 0%, #3B8A40 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>personalised guide.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ fontSize: '1.15rem', color: '#64748b', fontWeight: 500, lineHeight: 1.75, maxWidth: '480px', marginBottom: '2.5rem' }}>
                  Answer Sheet Evaluation Exam Prep turns grading data into actionable study plans. Based on past performance, the AI generates a bespoke revision guide highlighting exactly what each student needs to focus on.
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginLeft: '0.75rem' }}>Revision Guide · Student #14A2</span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#1C5F20', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem' }}>Focus Areas for Final Exam</div>
                  {[
                    { topic: 'Dynamic Programming', score: '45% average', action: 'Review Memoization basics. Attempt 3 practice questions.', priority: 'High', color: '#ef4444' },
                    { topic: 'Graph Traversal', score: '60% average', action: 'Focus on BFS vs DFS edge cases. Read Chapter 4 summary.', priority: 'Medium', color: '#f59e0b' },
                    { topic: 'Sorting Algorithms', score: '85% average', action: 'Strong grasp. Quick revision of worst-case scenarios.', priority: 'Low', color: '#22c55e' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', marginBottom: '0.75rem', border: '1px solid #E2E8F0', borderLeft: `3px solid ${item.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1A2421' }}>{item.topic}</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: item.color, background: `${item.color}15`, padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>{item.score}</div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{item.action}</div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <button style={{ background: '#1C5F20', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>download</span>
                      Download Full PDF Guide
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section style={{ padding: '7rem 0', background: 'white', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          <Reveal><div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '1rem' }}>How Exam Prep Works</h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.7, maxWidth: '480px', margin: '0 auto' }}>Bridging the gap between evaluation and student improvement.</p>
          </div></Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
            {[
              { icon: 'insights', title: 'Data-Driven Insights', desc: 'Analyzes student performance across multiple Answer Sheet Evaluation-evaluated exams to identify consistent weak points.' },
              { icon: 'target', title: 'Targeted Revision Plans', desc: 'Creates a custom study schedule for each student, prioritizing topics where they lost the most marks.' },
              { icon: 'library_books', title: 'Curated Study Material', desc: 'Links weak topics to specific textbook chapters, lecture slides, or recorded videos from your syllabus.' },
              { icon: 'trending_up', title: 'Progress Tracking', desc: 'Visualizes improvement over the semester, showing students how their targeted study is affecting their grades.' },
              { icon: 'psychology', title: 'Cognitive Level Focus', desc: 'Identifies if a student struggles with basic recall (LOT) or complex application (HOT) and adjusts practice accordingly.' },
              { icon: 'share', title: 'Easy Distribution', desc: 'Automatically emails personalized PDF guides to students or integrates with your existing LMS portal.' },
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
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#1C5F20', marginBottom: '1.5rem', display: 'block' }}>school</span>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.75rem,3.5vw,2.75rem)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.025em' }}>Exam Prep launches Q2 2026</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.7, marginBottom: '2.5rem' }}>Join the waitlist for early access and to shape the product roadmap.</p>
          </Reveal>
          <Reveal delay={0.1}><BookDemoForm /></Reveal>
        </div>
      </section>
      <SiteFooter />
      <style>{`@media (max-width: 900px) { div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; } div[style*="grid-template-columns: repeat(3,1fr)"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
