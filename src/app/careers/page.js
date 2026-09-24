'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

const INTERN_DETAILS = {
  about: "BCBX Innovations Pvt. Ltd. builds BigChalkBox, an AI examination suite used by universities and educational institutions across India. The platform automates core academic workflows, including question paper generation, question paper moderation, and answer sheet evaluation, turning tasks that once took hours into results delivered in minutes. Our mission is to bring speed, consistency, and fairness to academic assessment by applying AI to real institutional workflows at scale.",
  overview: "We are looking for an AI Engineering Intern to help build and deploy the AI systems behind BigChalkBox. You will work on real datasets and production use cases spanning LLMs, multimodal AI, document processing, evaluation pipelines, and model deployment. The work includes building and testing AI pipelines, experimenting with models, analyzing failures, and integrating AI systems directly into our products. As the platform grows, you'll also get exposure to newer areas we're building into the suite, from secure digital assessments and richer performance analytics to AI-assisted content workflows for lectures and study material.",
  responsibilities: [
    "Build and improve AI/ML pipelines for academic use cases.",
    "Process and prepare datasets for training and evaluation.",
    "Work with PDFs, scanned documents, handwritten answer sheets, and other academic content.",
    "Experiment with different models, prompts, retrieval methods, and model configurations.",
    "Design evaluation pipelines and benchmark model performance.",
    "Investigate model failures and implement improvements.",
    "Integrate AI services with backend and product systems.",
    "Work with GPU-based model inference and deployment.",
    "Optimize AI systems for accuracy, latency, reliability, and scalability.",
    "Document experiments, results, and technical findings.",
    "Contribute to new AI-driven capabilities as the product suite expands.",
    "Stay current with developments in LLMs, multimodal AI, and model inference."
  ],
  qualifications: [
    "Strong programming fundamentals, preferably in Python.",
    "Understanding of data structures and algorithms.",
    "Understanding of core machine learning concepts, including training, validation, and evaluation.",
    "Familiarity with data preprocessing, cleaning, and analysis.",
    "Good understanding of LLMs and transformer-based models.",
    "Strong analytical and problem-solving skills.",
    "Ability to debug and work independently.",
    "Currently pursuing or recently completed a degree in Computer Science, AI, Data Science, or a related field."
  ],
  goodToHave: [
    "Experience with PyTorch, TensorFlow, Hugging Face, or Transformers.",
    "Experience with LLMs, VLMs, RAG, OCR, or document intelligence.",
    "Familiarity with FastAPI, vector databases, LangChain, or vLLM.",
    "Experience working with GPUs or deploying AI models.",
    "Experience with model fine-tuning, LoRA/QLoRA, quantization, or inference optimization.",
    "Previous AI/ML projects or internship experience."
  ],
  whatWeLookFor: "We are looking for someone who can take an AI problem from experimentation to implementation. Strong fundamentals, the ability to learn quickly, and the ability to solve problems independently matter more than knowing every technology listed above.",
  selectionProcess: "Shortlisted candidates will go through a single technical interview. Stipend will be discussed at the time of interview."
};

const ROLES = [
  {
    title: 'AI Engineering Intern',
    team: 'Deep Tech',
    location: 'Gurgaon / NCR (On-site)',
    type: 'Full-time (6 Months)',
    status: 'Open',
    desc: 'Applied AI for academic workflows: LLMs, document intelligence & model deployment. You will work on real datasets and production use cases.',
    details: INTERN_DETAILS
  },
  {
    title: 'Senior Full-Stack Engineer',
    team: 'Engineering',
    location: 'Remote (India)',
    type: 'Full-time',
    status: 'Filled',
    desc: 'Architect and scale the core Answer Sheet Evaluation platform using Next.js, Node, and Python. You will lead technical decisions and mentor junior devs.'
  },
  {
    title: 'AI / ML Researcher',
    team: 'Deep Tech',
    location: 'Remote (Global)',
    type: 'Full-time',
    status: 'Filled',
    desc: 'Train and fine-tune models for handwritten text recognition (HTR) and semantic evaluation algorithms.'
  },
  {
    title: 'Product Designer (UI/UX)',
    team: 'Design',
    location: 'Remote (India)',
    type: 'Full-time',
    status: 'Filled',
    desc: 'Design beautiful, highly intuitive interfaces that make complex educational workflows feel effortless.'
  }
]

export default function CareersPage() {
  const [expandedRole, setExpandedRole] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formStatus, setFormStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleApply(e) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.target);
    const data = {
        full_name: fd.get('fullName'),
        institution_name: fd.get('resumeLink'), // Mapping resume link to institution_name for sheetdb
        designation: 'AI Engineering Intern', // Mapping job title to designation
        email: fd.get('email'),
        phone: fd.get('phone'),
        comments: fd.get('comments'),
        created_at: new Date().toLocaleString('en-IN'),
    };
    try {
        const res = await fetch('https://sheetdb.io/api/v1/vksbsahrgkwky', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [data] }),
        });
        if (res.ok) {
            setFormStatus({ success: true, message: 'Application submitted successfully! We will review your profile and get back to you.' });
            e.target.reset();
        } else {
            setFormStatus({ success: false, message: 'Something went wrong. Please try again.' });
        }
    } catch {
        setFormStatus({ success: false, message: 'Network error. Please try again later.' });
    }
    setSubmitting(false);
  }

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
                  <motion.div whileHover={{ y: -4, borderColor: \`var(--color-gold)\`, boxShadow: '0 12px 36px rgba(0,0,0,0.04)' }}
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
                  Roles
                </h2>
              </div>
            </Reveal>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {ROLES.map((role, idx) => {
                const isExpanded = expandedRole === idx;
                const isFilled = role.status === 'Filled';
                return (
                  <Reveal key={idx} delay={idx * 0.1}>
                    <div style={{ padding: '2.5rem', border: '1px solid var(--color-border)', borderRadius: '1rem', background: 'var(--color-cream-dark)', transition: 'border-color 0.3s', opacity: isFilled ? 0.6 : 1 }}
                         onMouseEnter={e => !isFilled && (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                         onMouseLeave={e => !isFilled && (e.currentTarget.style.borderColor = 'var(--color-border)')}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
                              {role.title}
                            </h3>
                            {isFilled && (
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--color-border)', color: 'var(--color-ink-soft)', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase' }}>Filled</span>
                            )}
                            {!isFilled && (
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(20,90,56,0.1)', color: 'var(--color-gold)', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase' }}>Open</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold)' }}>{role.team}</span>
                            <span style={{ color: 'var(--color-border)' }}>•</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)' }}>{role.location}</span>
                            <span style={{ color: 'var(--color-border)' }}>•</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)' }}>{role.type}</span>
                          </div>
                        </div>
                        
                        {!isFilled && !isExpanded && (
                          <button onClick={() => setExpandedRole(idx)} style={{ cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', background: 'var(--color-ink)', color: 'white', borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.25s', flexShrink: 0 }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                          >
                            View More <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>visibility</span>
                          </button>
                        )}
                        {!isFilled && isExpanded && (
                          <button onClick={() => {setExpandedRole(null); setShowApplyForm(false);}} style={{ cursor: 'pointer', border: '1px solid var(--color-border)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', background: 'transparent', color: 'var(--color-ink)', borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.25s', flexShrink: 0 }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-border)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                          >
                            Close <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
                          </button>
                        )}
                      </div>
                      
                      {!isExpanded && (
                        <p style={{ color: 'var(--color-ink-soft)', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500, margin: 0, maxWidth: '700px' }}>
                          {role.desc}
                        </p>
                      )}

                      <AnimatePresence>
                        {isExpanded && role.details && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                              
                              <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>About BigChalkBox</h4>
                                <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.95rem', lineHeight: 1.7 }}>{role.details.about}</p>
                              </div>

                              <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Role Overview</h4>
                                <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.95rem', lineHeight: 1.7 }}>{role.details.overview}</p>
                              </div>

                              <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Key Responsibilities</h4>
                                <ul style={{ color: 'var(--color-ink-soft)', fontSize: '0.95rem', lineHeight: 1.7, paddingLeft: '1.5rem', margin: 0 }}>
                                  {role.details.responsibilities.map((item, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>)}
                                </ul>
                              </div>

                              <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Required Qualifications</h4>
                                <ul style={{ color: 'var(--color-ink-soft)', fontSize: '0.95rem', lineHeight: 1.7, paddingLeft: '1.5rem', margin: 0 }}>
                                  {role.details.qualifications.map((item, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>)}
                                </ul>
                              </div>

                              <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Good to Have</h4>
                                <ul style={{ color: 'var(--color-ink-soft)', fontSize: '0.95rem', lineHeight: 1.7, paddingLeft: '1.5rem', margin: 0 }}>
                                  {role.details.goodToHave.map((item, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>)}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>What We Look For</h4>
                                <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.95rem', lineHeight: 1.7 }}>{role.details.whatWeLookFor}</p>
                              </div>

                              <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Selection Process</h4>
                                <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.95rem', lineHeight: 1.7 }}>{role.details.selectionProcess}</p>
                              </div>

                              {!showApplyForm ? (
                                <div style={{ marginTop: '1rem' }}>
                                  <button onClick={() => setShowApplyForm(true)} style={{ cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.5rem', background: 'var(--color-gold)', color: 'var(--color-ink)', borderRadius: '9999px', fontWeight: 800, fontSize: '1rem', transition: 'all 0.25s' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(20,90,56,0.15)' }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                                  >
                                    Apply Now <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>arrow_forward</span>
                                  </button>
                                </div>
                              ) : (
                                <div style={{ marginTop: '2rem', padding: '2.5rem', background: 'var(--color-cream)', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
                                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Submit Application</h3>
                                  
                                  {formStatus ? (
                                    <div style={{ padding: '1.5rem', background: formStatus.success ? 'rgba(20,90,56,0.1)' : 'rgba(220,53,69,0.1)', color: formStatus.success ? 'var(--color-gold)' : '#dc3545', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600 }}>
                                      <span className="material-symbols-outlined">{formStatus.success ? 'check_circle' : 'error'}</span>
                                      <p style={{ margin: 0 }}>{formStatus.message}</p>
                                    </div>
                                  ) : (
                                    <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                        <div style={{ flex: '1 1 200px' }}>
                                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-ink-soft)' }}>Full Name *</label>
                                          <input name="fullName" required type="text" placeholder="John Doe" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', outline: 'none' }} />
                                        </div>
                                        <div style={{ flex: '1 1 200px' }}>
                                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-ink-soft)' }}>Email Address *</label>
                                          <input name="email" required type="email" placeholder="john@example.com" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', outline: 'none' }} />
                                        </div>
                                      </div>

                                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                        <div style={{ flex: '1 1 200px' }}>
                                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-ink-soft)' }}>Phone Number *</label>
                                          <input name="phone" required type="tel" placeholder="+91 98765 43210" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', outline: 'none' }} />
                                        </div>
                                        <div style={{ flex: '1 1 200px' }}>
                                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-ink-soft)' }}>Link to Resume (Drive, Notion, etc.) *</label>
                                          <input name="resumeLink" required type="url" placeholder="https://..." style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', outline: 'none' }} />
                                        </div>
                                      </div>

                                      <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-ink-soft)' }}>Why are you a good fit? / Comments (Optional)</label>
                                        <textarea name="comments" rows="3" placeholder="Tell us a bit about your experience..." style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', outline: 'none', resize: 'vertical' }}></textarea>
                                      </div>

                                      <button disabled={submitting} type="submit" style={{ cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, border: 'none', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', background: 'var(--color-ink)', color: 'white', borderRadius: '0.5rem', fontWeight: 700, fontSize: '1rem', transition: 'all 0.25s' }}>
                                        {submitting ? 'Submitting...' : 'Submit Application'}
                                      </button>
                                    </form>
                                  )}
                                </div>
                              )}

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  </Reveal>
                )
              })}
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
      <style>{\`
        @media (max-width: 900px) { 
          div[style*="grid-template-columns: repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
        input:focus, textarea:focus {
          border-color: var(--color-gold) !important;
          box-shadow: 0 0 0 2px rgba(20,90,56,0.1) !important;
        }
      \`}</style>
    </div>
  )
}
