'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import Link from 'next/link'
import { 
    CheckCircle, ShieldCheck, GraduationCap, Building2, UserCircle,
    Play, ArrowRight, FileSignature, BrainCircuit, SearchCheck,
    Star, ArrowUpRight, Globe, ChevronsUpDown, Mouse
} from 'lucide-react'

import './LandingPage.css'
import { GlobalSpotlight } from '../magic-bento/MagicBento'
import SiteHeader from '../shared/SiteHeader'
import SiteFooter from '../shared/SiteFooter'
import StatsAndReview from './StatsAndReview'
import PixelTransition from './PixelTransition'
import { MorphingText } from '../magicui/morphing-text'
import Cubes from './Cubes'
import OptionWheel from '../option-wheel/OptionWheel'
import BookDemoForm from '../BookDemoForm'
import FAQSection from '../FAQSection'

const MORPHING_TEXTS = [
    "AI Evaluation",
    "Question Paper Generation",
    "Question Paper Moderation"
];

const STAKEHOLDERS = [
    {
        title: "For Educators",
        icon: <UserCircle size={28} />,
        desc: "Eliminate the burnout of manual grading. BigChalkBox's AI instantly evaluates answer scripts with pinpoint accuracy, letting you focus entirely on pedagogy.",
        points: ["Zero manual grading", "Pinpoint AI precision", "Automated rubrics"]
    },
    {
        title: "For Institutions",
        icon: <Building2 size={28} />,
        desc: "Scale your examination infrastructure flawlessly. DASES guarantees absolute standardization, zero bias, and massive operational cost reductions.",
        points: ["100% Bias-free evaluation", "Massive cost scaling", "Real-time analytics"]
    },
    {
        title: "For Students",
        icon: <GraduationCap size={28} />,
        desc: "No more waiting weeks for subjective results. Get immediate, hyper-transparent AI feedback that actually helps you master the curriculum.",
        points: ["Instant results", "Hyper-transparent grading", "Actionable insights"]
    }
];

export default function LandingPage() {
    const statsRef = useRef(null)
    const wkGridRef = useRef(null)
    const svGridRef = useRef(null)
    const statsInView = useInView(statsRef, { once: true, margin: "-100px" })

    // Stakeholder OptionWheel State
    const [selectedStakeholder, setSelectedStakeholder] = useState(0)

    // Sticky Navbar State
    const { scrollY } = useScroll()
    const [showNav, setShowNav] = useState(false)

    useMotionValueEvent(scrollY, "change", (latest) => {
        // Show navbar when scrolled past 80% of window height
        if (latest > (typeof window !== 'undefined' ? window.innerHeight * 0.8 : 800)) {
            setShowNav(true)
        } else {
            setShowNav(false)
        }
    })

    const products = [
        { 
            id: 'qpgen', 
            name: 'AI Question Generation', 
            desc: 'Creation Engine', 
            icon: <BrainCircuit size={20} strokeWidth={2} />,
            details: 'Instantly generate perfectly balanced, blueprint-aligned assessments with our advanced AI.'
        },
        { 
            id: 'qpmod', 
            name: 'Quality Moderation', 
            desc: 'Automated Audit', 
            icon: <SearchCheck size={20} strokeWidth={2} />,
            details: 'Rigorous automated audits to guarantee 100% syllabus coverage and eliminate human errors.'
        },
        { 
            id: 'dases', 
            name: 'DASES Evaluation', 
            desc: 'Grading & Analytics', 
            icon: <FileSignature size={20} strokeWidth={2} />,
            details: 'High-precision OCR and AI technology to instantly and fairly grade handwritten answer sheets.'
        }
    ]
    const [activeProductIdx, setActiveProductIdx] = useState(0)

    // Liquid Reveal Canvas Effect
    useEffect(() => {
        const canvas = document.getElementById('liquid-canvas')
        const wrap = document.getElementById('liquid-wrap')
        if (!canvas || !wrap) return

        const ctx = canvas.getContext('2d')
        let dpr = Math.min(window.devicePixelRatio || 1, 2)
        let cw = 0, ch = 0
        let brushRadius = 143
        let decay = 0.016
        let maxPoints = 60

        const coverCvs = document.createElement('canvas')
        const coverCtx = coverCvs.getContext('2d')
        const brushCvs = document.createElement('canvas')
        const brushCtx = brushCvs.getContext('2d')
        const afterImg = new Image()
        afterImg.crossOrigin = 'anonymous'
        let imgLoaded = false
        
        afterImg.onload = () => { imgLoaded = true; resizeCanvas() }
        afterImg.src = '/images/hero_chatgpt_2.png'

        function resizeCanvas() {
            if(!imgLoaded) return
            const rect = wrap.getBoundingClientRect()
            cw = rect.width * dpr
            ch = rect.height * dpr
            canvas.width = cw
            canvas.height = ch
            
            coverCvs.width = cw
            coverCvs.height = ch
            const imgW = afterImg.width
            const imgH = afterImg.height
            const scale = Math.max(cw/imgW, ch/imgH)
            const dx = (cw - imgW*scale)/2
            const dy = (ch - imgH*scale)/2
            coverCtx.drawImage(afterImg, dx, dy, imgW*scale, imgH*scale)
            
            const r = brushRadius * dpr
            brushCvs.width = r*2
            brushCvs.height = r*2
        }
        
        const resizeObserver = new ResizeObserver(resizeCanvas)
        resizeObserver.observe(wrap)

        let points = []
        let lastPt = null
        let idle = 0

        const pointerMoveHandler = (e) => {
            if(!imgLoaded) return
            const rect = canvas.getBoundingClientRect()
            const px = (e.clientX - rect.left) * dpr
            const py = (e.clientY - rect.top) * dpr
            const r = brushRadius * dpr
            if (px < -r || px > cw+r || py < -r || py > ch+r) {
                lastPt = null
                return
            }
            if (!lastPt) {
                lastPt = {x:px, y:py}
                points.push(lastPt)
                return
            }
            const dist = Math.hypot(px-lastPt.x, py-lastPt.y)
            const step = Math.max(r*0.3, 1)
            const n = Math.min(Math.ceil(dist/step), maxPoints)
            for(let i=1; i<=n; i++){
                points.push({
                x: lastPt.x + (px-lastPt.x)*(i/n),
                y: lastPt.y + (py-lastPt.y)*(i/n)
                })
            }
            lastPt = {x:px, y:py}
        }

        window.addEventListener('pointermove', pointerMoveHandler)

        let animationId
        function drawLiquid() {
            animationId = requestAnimationFrame(drawLiquid)
            if(!imgLoaded) return
            const match = window.matchMedia('(prefers-reduced-motion: reduce)')
            if(match.matches) return
            
            let drawing = points.length > 0
            if(drawing) idle = 0
            else {
                idle++
                if(idle > 120) return
            }
            
            let fade = drawing ? decay : Math.min(decay + idle*0.004, 0.5)
            ctx.globalCompositeOperation = 'destination-out'
            ctx.fillStyle = `rgba(0,0,0,${fade})`
            ctx.fillRect(0, 0, cw, ch)
            
            if(drawing) {
                const r = brushRadius * dpr
                const diam = r*2
                points.forEach(pt => {
                    brushCtx.clearRect(0,0,diam,diam)
                    brushCtx.globalCompositeOperation = 'source-over'
                    const grad = brushCtx.createRadialGradient(r,r,0, r,r,r)
                    grad.addColorStop(0, 'rgba(255,255,255,1)')
                    grad.addColorStop(0.55, 'rgba(255,255,255,0.82)')
                    grad.addColorStop(1, 'rgba(255,255,255,0)')
                    brushCtx.fillStyle = grad
                    brushCtx.fillRect(0,0,diam,diam)
                    
                    brushCtx.globalCompositeOperation = 'source-in'
                    brushCtx.drawImage(coverCvs, pt.x-r, pt.y-r, diam, diam, 0,0,diam,diam)
                    
                    ctx.globalCompositeOperation = 'source-over'
                    ctx.drawImage(brushCvs, pt.x-r, pt.y-r)
                })
                points = []
            } else if(idle === 120) {
                ctx.clearRect(0,0,cw,ch)
            }
        }
        animationId = requestAnimationFrame(drawLiquid)

        return () => {
            resizeObserver.disconnect()
            window.removeEventListener('pointermove', pointerMoveHandler)
            cancelAnimationFrame(animationId)
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveProductIdx((prev) => (prev + 1) % products.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [products.length])

    const nextProduct = () => setActiveProductIdx((prev) => (prev + 1) % products.length)
    const prevProduct = () => setActiveProductIdx((prev) => (prev - 1 + products.length) % products.length)

    // Animation Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    }

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    }

    return (
        <main className="landing-main">
            <SiteHeader />
            {/* HERO SECTION */}
            <section id="home">
                <div className="hero-liquid" id="liquid-wrap">
                    <img src="/images/hero_chatgpt_1.png" alt="Hero background" />
                    <canvas id="liquid-canvas" aria-hidden="true"></canvas>
                </div>
                <div className="hero-vignette"></div>

                
                <div className="shell hero-grid">
                    <motion.div 
                        className="hero-left"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={fadeUp} className="eyebrow eyebrow-light">
                            <div className="eyebrow-dot"></div> AI Assessment Suite
                        </motion.div>
                        
                        <motion.h1 variants={fadeUp}>
                            <span className="block">The Modern Standard</span>
                            <span className="block">for Educational</span>
                            <span className="block">Assessments</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} className="hero-subhead mt-6 text-lg text-[var(--color-cream-dark)] opacity-90 max-w-xl leading-relaxed">
                            A unified platform powering Question Generation, Quality Moderation, and Automated Evaluation.
                        </motion.p>
                        
                        <motion.div variants={fadeUp}>
                            <div className="hero-card-v3">
                                <div className="hc-v3-inner">
                                    {/* Left Image/Icon Block */}
                                    <div className="hc-v3-left">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeProductIdx}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                                className="hc-v3-icon-wrapper"
                                            >
                                                {products[activeProductIdx].icon}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    {/* Right Content Block */}
                                    <div className="hc-v3-right">
                                        <div className="hc-v3-content">
                                            <div className="hc-v3-heading" style={{ filter: 'url(#threshold)' }}>
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={activeProductIdx + '-heading'}
                                                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                                                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                                                        exit={{ opacity: 0, filter: 'blur(10px)' }}
                                                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                                        className="hc-v3-morph-text"
                                                        style={{ position: 'absolute', inset: 0 }}
                                                    >
                                                        {MORPHING_TEXTS[activeProductIdx]}
                                                    </motion.div>
                                                </AnimatePresence>
                                            </div>
                                            
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={activeProductIdx + '-desc'}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                                >
                                                    <div className="hc-v3-desc">{products[activeProductIdx].details}</div>
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>

                                        <div className="hc-v3-controls">
                                            <div className="hc-v3-dots">
                                                {products.map((p, i) => (
                                                    <div key={i} className={`hc-v3-dot ${i === activeProductIdx ? 'active' : ''}`}></div>
                                                ))}
                                            </div>
                                            <div className="hc-v3-nav">
                                                <button className="hc-v3-btn" onClick={(e) => { e.stopPropagation(); prevProduct(); }}>
                                                    <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
                                                </button>
                                                <button className="hc-v3-btn" onClick={(e) => { e.stopPropagation(); nextProduct(); }}>
                                                    <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeUp} className="cta-row">
                            <Link href="/book-demo" className="pill-wrapper">
                                <div className="pill-button light has-arrow">
                                    Book a Demo
                                    <span className="arrow-badge right"><ArrowRight size={18} /></span>
                                </div>
                            </Link>
                            <Link href="#works" className="pill-wrapper">
                                <div className="pill-button outline-light">
                                    Explore Suite
                                </div>
                            </Link>
                        </motion.div>
                    </motion.div>
                    
                    <motion.div 
                        className="hero-right"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                    </motion.div>
                </div>

                <div className="shell hero-bot">
                    <span>Working since 2023</span>
                    <span className="hb-mid">Based in India, worldwide</span>
                    <span className="hb-right">Scroll to explore <ArrowRight size={12} style={{ transform: 'rotate(90deg)' }} /></span>
                </div>
            </section>
            {/* STUDIO INTRO SECTION */}
            <section className="studio-intro">
                <div className="shell si-shell">
                    <motion.div 
                        className="si-left"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="si-eyebrow">
                            <div className="eyebrow-dot"></div> BigChalkBox
                        </div>
                        <div className="si-logo-wrapper">
                            <div style={{ width: '100%', position: 'relative' }}>
                              <Cubes 
                                gridSize={6}
                                maxAngle={15}
                                radius={2}
                                borderStyle="1px solid rgba(20, 79, 54, 0.3)"
                                faceColor="transparent"
                                rippleColor="#0F5A37"
                                rippleSpeed={1.5}
                                autoAnimate={false}
                                rippleOnClick={true}
                              />
                            </div>
                        </div>
                        <p className="si-subtitle">
                            Built for modern education.
                        </p>
                    </motion.div>
                    
                    <motion.div 
                        className="si-right"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h2 className="si-heading">
                            We build AI that grades, generates, and moderates assessments. Empowering educators with precision and scale.
                        </h2>
                        
                        <div className="si-footer">
                            <div className="si-socials-wrapper">
                                <span className="si-socials-label">Find us online</span>
                                <div className="si-socials">
                                    <a href="#" className="si-social-btn">X</a>
                                    <a href="#" className="si-social-btn">in</a>
                                    <a href="#" className="si-social-btn">ig</a>
                                </div>
                            </div>
                            
                            <Link href="/about" className="pill-wrapper">
                                <div className="pill-button dark has-arrow">
                                    About Us
                                    <span className="arrow-badge right"><ArrowRight size={18} /></span>
                                </div>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* BAND SECTION */}
            <section className="band-sec">
                <motion.ul 
                    className="shell band-ul"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={staggerContainer}
                >
                    <motion.li variants={fadeUp} className="band-li">
                        <Link href="/products/qp-generation" className="band-tile bt-1">
                            Generate
                        </Link>
                    </motion.li>
                    <motion.li variants={fadeUp} className="band-li">
                        <Link href="/products/qp-moderation" className="band-tile bt-2">
                            Moderate
                        </Link>
                    </motion.li>
                    <motion.li variants={fadeUp} className="band-li">
                        <Link href="/products/dases" className="band-tile bt-3">
                            Evaluate
                        </Link>
                    </motion.li>
                    <motion.li variants={fadeUp} className="band-li">
                        <Link href="#works" className="band-tile bt-4" aria-label="Explore The Suite">
                            <ArrowRight size={40} />
                        </Link>
                    </motion.li>
                </motion.ul>
            </section>

            {/* PORTFOLIO / THE SUITE */}
            <section id="works">
                <div className="shell wk-shell">
                    <motion.div 
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="eyebrow mb-6"
                        style={{ color: 'var(--color-gold)' }}
                    >
                        <div className="eyebrow-dot" style={{ backgroundColor: 'var(--color-gold)' }}></div> The Suite
                    </motion.div>
                    
                    <motion.h2 
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="text-center mx-auto"
                        style={{ 
                            fontFamily: 'var(--font-sans)', 
                            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
                            fontWeight: 700, 
                            lineHeight: 1.05, 
                            letterSpacing: '-0.02em', 
                            color: 'var(--color-ink)',
                            maxWidth: '800px', 
                            marginBottom: '4rem' 
                        }}
                    >
                        Three powerful modules <br /> designed for <span style={{ color: 'var(--color-gold)' }}>academia.</span>
                    </motion.h2>

                    <div className="wk-grid bento-section" ref={wkGridRef}>
                        <GlobalSpotlight 
                            gridRef={wkGridRef}
                            spotlightRadius={490}
                            glowColor="20, 90, 56"
                            cardClassName="wk-card"
                        />
                        
                        <motion.div 
                            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                            className="wk-card wk-card-1 wk-card-full group magic-bento-card--border-glow"
                        >

                            <div className="flex flex-col h-full relative z-10 pointer-events-none">
                                <div className="wk-top">
                                    <span>AI Evaluation</span>
                                    <div className="wk-badge"><ArrowUpRight /></div>
                                </div>
                                <div className="wk-bot mt-auto">
                                    <h3 className="wk-h3">DASES</h3>
                                    <p className="wk-p">Descriptive Answer Sheet Evaluation System. Combines OCR and LLMs to deliver fast, accurate, and unbiased grading for handwritten assessments.</p>
                                    <div className="wk-tags">
                                        <span className="tag-chip"><CheckCircle size={16} /> Grades in minutes</span>
                                        <span className="tag-chip"><CheckCircle size={16} /> Objective rubrics</span>
                                        <span className="tag-chip"><CheckCircle size={16} /> Question-level feedback</span>
                                    </div>
                                    <Link href="/products/dases" className="mt-8 inline-block pointer-events-auto">
                                        <span className="pill-button light has-arrow">
                                            Explore DASES
                                            <span className="arrow-badge right"><ArrowRight size={18} /></span>
                                        </span>
                                    </Link>
                                </div>
                            </div>
                            <div className="wk-vid-wrapper mt-8 lg:mt-0 relative z-10 pointer-events-none">
                                <img 
                                    src="/images/landing/dashboard_preview_1.png"
                                    alt="DASES Dashboard Preview"
                                    className="wk-vid"
                                />
                            </div>
                        </motion.div>

                        {/* Product 3: QP Moderation */}
                        <motion.div 
                            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                            className="wk-card wk-card-3 group magic-bento-card--border-glow"
                        >

                            <div className="wk-top relative z-10 pointer-events-none">
                                <span>Quality Audit</span>
                                <div className="wk-badge"><ArrowUpRight /></div>
                            </div>
                            <div className="wk-bot relative z-10 pointer-events-none">
                                <h3 className="wk-h3">QP Moderation</h3>
                                <p className="wk-p">Automated quality audits for your question papers. Ensure syllabus coverage, difficulty balance, and eliminate errors before exams.</p>
                                <div className="wk-tags mb-6">
                                    <span className="tag-chip">Repetitive checks</span>
                                    <span className="tag-chip">Difficulty scoring</span>
                                </div>
                                <Link href="/products/qp-moderation" className="mt-auto inline-block pointer-events-auto">
                                    <span className="pill-button light has-arrow">
                                        Explore QP Moderation
                                        <span className="arrow-badge right"><ArrowRight size={18} /></span>
                                    </span>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Product 2: QP Generation */}
                        <motion.div 
                            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                            className="wk-card wk-card-2 group magic-bento-card--border-glow"
                        >

                            <div className="wk-top relative z-10 pointer-events-none">
                                <span>Curriculum Aligned</span>
                                <div className="wk-badge"><ArrowUpRight /></div>
                            </div>
                            <div className="wk-bot relative z-10 pointer-events-none">
                                <h3 className="wk-h3">QP Generation</h3>
                                <p className="wk-p">Instantly create curriculum-aligned question papers. Generate diverse question types with balanced difficulty levels in seconds.</p>
                                <div className="wk-tags mb-6">
                                    <span className="tag-chip">Blueprint-aligned</span>
                                    <span className="tag-chip">Bloom's Taxonomy</span>
                                </div>
                                <Link href="/products/qp-generation" className="mt-auto inline-block pointer-events-auto">
                                    <span className="pill-button light has-arrow">
                                        Explore QP Generation
                                        <span className="arrow-badge right"><ArrowRight size={18} /></span>
                                    </span>
                                </Link>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* CTA BANNER 1 — After The Suite */}
            <section className="cta-banner cta-banner--light cta-banner--pre-pixel">
                <div className="shell cta-banner__inner">
                    <div className="cta-banner__text">
                        <h2 className="cta-banner__h2">
                            Smarter assessments.<br/>
                            <span className="cta-banner__accent">From creation to evaluation.</span>
                        </h2>
                        <p className="cta-banner__sub">Join forward-thinking institutions already using BigChalkBox to streamline exam generation, ensure quality moderation, and deliver faster, fairer evaluation.</p>
                    </div>
                    <div className="cta-banner__btns">
                        <Link href="/book-demo" className="cta-banner__btn cta-banner__btn--primary">Book a Free Demo</Link>
                        <Link href="#services" className="cta-banner__btn cta-banner__btn--ghost">Explore Solutions</Link>
                    </div>
                </div>
            </section>

            {/* UNIFIED GRADIENT WRAPPER */}
            <div className="services-gradient-wrapper">
                {/* PIXEL TRANSITION */}
                <PixelTransition />

                {/* SERVICES / STAKEHOLDERS */}
                <section id="services" className="flex flex-col items-center pt-12 pb-24 lg:pt-16 lg:pb-32 overflow-hidden relative">
                
                <div className="flex flex-col items-center mb-6 lg:mb-8 z-10 px-4 text-center">
                    <motion.div 
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="eyebrow eyebrow-light mb-4"
                    >
                        <div className="eyebrow-dot"></div> Built For Everyone
                    </motion.div>
                    
                    <motion.h2 
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="sv-h2 !mb-0 text-white"
                    >
                        Less stress. More success.<br/>
                        <span className="sv-accent-sassy">Everyone wins.</span>
                    </motion.h2>
                </div>

                <div className="shell sv-shell w-full -mt-4 lg:-mt-8 relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative w-full max-w-6xl mx-auto h-[600px] lg:h-[380px]" ref={svGridRef}>
                        
                        {/* LEFT: OptionWheel */}
                        <div className="relative w-full max-w-md mx-auto h-[250px] lg:h-full group">
                            
                            {/* Scroll Hint */}
                            <div className="absolute left-0 lg:-left-4 top-1/2 -translate-y-1/2 -translate-x-full hidden lg:flex flex-col items-center justify-center gap-4 text-white/20 transition-colors duration-500 group-hover:text-white/50">
                                <span className="text-[10px] font-medium uppercase tracking-[0.2em] -rotate-180" style={{ writingMode: 'vertical-rl' }}>Scroll or Drag</span>
                                <ChevronsUpDown size={16} className="animate-pulse" />
                            </div>

                            {/* Mobile Hint */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 lg:hidden flex items-center gap-2 text-white/40 text-[10px] font-medium uppercase tracking-[0.1em] bg-white/5 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 z-20">
                                <Mouse size={12} /> Scroll or Drag
                            </div>

                            <div className="relative h-full flex items-center justify-center lg:justify-start overflow-hidden w-full" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'}}>
                                <OptionWheel
                                    items={STAKEHOLDERS.map(s => s.title.replace('For ', ''))}
                                    defaultSelected={0}
                                    textColor="rgba(255, 255, 255, 0.3)"
                                    activeColor="#ffffff"
                                    side="left"
                                    fontSize={3.5}
                                    spacing={1.2}
                                    curve={1.2}
                                    tilt={10}
                                    blur={1.5}
                                    fade={0.3}
                                    minOpacity={0.05}
                                    smoothing={150}
                                    inset={40}
                                    loop={true}
                                    draggable={true}
                                    onChange={(idx) => setSelectedStakeholder(idx)}
                                />
                            </div>
                        </div>

                        {/* RIGHT: Dynamic Card */}
                        <div className="relative h-[320px] lg:h-full flex items-center justify-center lg:justify-end w-full max-w-md mx-auto">
                            <div className="relative w-full h-full">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedStakeholder}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="sv-bento-card absolute inset-0 w-full h-full flex flex-col justify-start overflow-hidden"
                                    >
                                        <div className="sv-card-inner !p-8 h-full flex flex-col justify-start">
                                            <div className="sv-card-header !gap-4 !mb-6">
                                                <div className="sv-icon-large !w-14 !h-14 !rounded-2xl">
                                                    {STAKEHOLDERS[selectedStakeholder].icon}
                                                </div>
                                                <h3 className="sv-card-h3 !text-3xl">
                                                    {STAKEHOLDERS[selectedStakeholder].title}
                                                </h3>
                                            </div>
                                            <p className="sv-card-desc !text-base !mb-6">
                                                {STAKEHOLDERS[selectedStakeholder].desc}
                                            </p>
                                            <div className="sv-pills !gap-3 flex-wrap">
                                                {STAKEHOLDERS[selectedStakeholder].points.map((pt, i) => (
                                                    <div key={i} className="sv-pill !py-2.5 !px-4 !text-sm !rounded-xl flex items-center gap-2">
                                                        <CheckCircle size={16} /> {pt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
            </div>


            {/* FAQs */}
            <FAQSection />

            {/* CTA BANNER 2 — After FAQs */}
            <section className="cta-banner cta-banner--light cta-banner--compact-top">
                <div className="shell cta-banner__inner">
                    <div className="cta-banner__text">
                        <h2 className="cta-banner__h2">
                            Your rubric.<br/>
                            <span className="cta-banner__accent">Our AI. Zero compromise.</span>
                        </h2>
                        <p className="cta-banner__sub">4,000+ sheets processed. 200+ question papers generated. Results that speak for themselves.</p>
                    </div>
                    <div className="cta-banner__btns">
                        <Link href="/book-demo" className="cta-banner__btn cta-banner__btn--primary">Get Started Free</Link>
                        <Link href="/pricing" className="cta-banner__btn cta-banner__btn--ghost">View Pricing</Link>
                    </div>
                </div>
            </section>

            {/* BOOK DEMO FORM */}
            <BookDemoForm />

            <StatsAndReview />
            <SiteFooter />

            {/* SVG Filters for gooey text effects */}
            <svg id="filters" className="hidden-svg" style={{ width: 0, height: 0, position: 'absolute' }}>
                <defs>
                    <filter id="threshold">
                        <feColorMatrix
                            in="SourceGraphic"
                            type="matrix"
                            values="1 0 0 0 0
                                    0 1 0 0 0
                                    0 0 1 0 0
                                    0 0 0 255 -140"
                        />
                    </filter>
                </defs>
            </svg>
        </main>
    )
}
