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
    "Generate Smarter Questions",
    "Moderate with Confidence",
    "Evaluate Without Bias"
];

const STAKEHOLDERS = [
    {
        title: "For Educators",
        icon: <UserCircle size={28} />,
        desc: "Stop drowning in paperwork. BigChalkBox gives you AI tools to generate curriculum-aligned question papers, audit them for quality, and evaluate handwritten answers. All in one place.",
        points: ["AI-powered question creation", "Automated quality checks", "Instant answer evaluation"]
    },
    {
        title: "For Institutions",
        icon: <Building2 size={28} />,
        desc: "Transform your entire examination workflow. From generating NAAC-compliant question papers to moderating quality and evaluating hundreds of scripts, BigChalkBox scales with your institution.",
        points: ["End-to-end exam automation", "NAAC & IQAC ready", "Zero bias, full consistency"]
    },
    {
        title: "For Students",
        icon: <GraduationCap size={28} />,
        desc: "Benefit from exams that are fair, thorough, and scientifically structured. BigChalkBox ensures every question paper is balanced and every answer is evaluated without human bias.",
        points: ["Fairer, balanced exams", "Transparent evaluation", "Faster results"]
    }
];

export default function LandingPage() {
    const statsRef = useRef(null)
    const wkGridRef = useRef(null)
    const svGridRef = useRef(null)
    const mobileCarouselRef = useRef(null)
    const statsInView = useInView(statsRef, { once: true, margin: "-100px" })

    // Stakeholder OptionWheel State
    const [selectedStakeholder, setSelectedStakeholder] = useState(0)

    // Mobile Carousel Auto-Scroll Logic
    useEffect(() => {
        let interval;
        if (mobileCarouselRef.current) {
            interval = setInterval(() => {
                const container = mobileCarouselRef.current;
                if (!container) return;
                
                // Get the width of one card plus gap
                const firstChild = container.children[0];
                const cardWidth = firstChild ? firstChild.offsetWidth + 24 : container.clientWidth * 0.8; 
                const maxScrollLeft = container.scrollWidth - container.clientWidth;
                
                // If we reached the end, reset to 0. Otherwise, advance one card.
                if (container.scrollLeft >= maxScrollLeft - 10) {
                    container.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    container.scrollBy({ left: cardWidth, behavior: 'smooth' });
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, []);

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
            name: 'Question Paper Generation', 
            desc: 'AI Creation Engine', 
            icon: <BrainCircuit size={20} strokeWidth={2} />,
            details: 'Generate perfectly structured, Bloom\'s Taxonomy-aligned question papers in seconds. No more hours spent drafting from scratch.'
        },
        { 
            id: 'qpmod', 
            name: 'Question Paper Moderation', 
            desc: 'Automated Quality Audit', 
            icon: <SearchCheck size={20} strokeWidth={2} />,
            details: 'Run a 10-point AI audit on every question paper before it reaches students. Catch errors, imbalance, and out-of-syllabus questions instantly.'
        },
        { 
            id: 'dases', 
            name: 'Answer Sheet Evaluation', 
            desc: 'AI Answer Evaluation', 
            icon: <FileSignature size={20} strokeWidth={2} />,
            details: 'Every handwritten script is evaluated against a fixed AI rubric, ensuring every student is judged on merit alone. Results in minutes, not weeks.'
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
        let brushRadius = 45 // Reduced from 80
        let decay = 0.016
        let maxPoints = 60

        const coverCvs = document.createElement('canvas')
        const coverCtx = coverCvs.getContext('2d')
        const brushCvs = document.createElement('canvas')
        const brushCtx = brushCvs.getContext('2d')
        const afterImg = new Image()
        afterImg.crossOrigin = 'anonymous'
        let imgLoaded = false
        let activeImageSrc = ''

        afterImg.onload = () => { imgLoaded = true; resizeCanvas() }

        function loadResponsiveImage() {
            const nextImageSrc = window.innerWidth <= 640
                ? '/images/hero_mobile_2.png'
                : '/images/hero_chatgpt_2.png'

            if (nextImageSrc === activeImageSrc) return
            activeImageSrc = nextImageSrc
            imgLoaded = false
            afterImg.src = nextImageSrc
        }

        function resizeCanvas() {
            if(!imgLoaded) return
            dpr = Math.min(window.devicePixelRatio || 1, 2)
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

        loadResponsiveImage()
        const resizeObserver = new ResizeObserver(() => {
            const previousImageSrc = activeImageSrc
            loadResponsiveImage()
            if (previousImageSrc === activeImageSrc) resizeCanvas()
        })
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
            afterImg.onload = null
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveProductIdx((prev) => (prev + 1) % products.length)
        }, 5000)
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
                    <picture>
                        <source srcSet="/images/hero_mobile_1.png" media="(max-width: 640px)" />
                        <img src="/images/hero_chatgpt_1.png" alt="Hero background" />
                    </picture>
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
                            <div className="eyebrow-dot"></div> The AI Examination Suite
                        </motion.div>
                        
                        <motion.h1 variants={fadeUp}>
                            <span className="block">The Modern Standard</span>
                            <span className="block">for Educational</span>
                            <span className="block">Assessments</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} className="hero-subhead mt-6 text-lg text-[var(--color-cream-dark)] opacity-90 max-w-xl leading-relaxed">
                            BigChalkBox automates the entire examination process. AI-powered question generation, quality moderation and unbiased answer evaluation. Built for modern universities.
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
                                                <button aria-label="Show previous product" className="hc-v3-btn" onClick={(e) => { e.stopPropagation(); prevProduct(); }}>
                                                    <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
                                                </button>
                                                <button aria-label="Show next product" className="hc-v3-btn" onClick={(e) => { e.stopPropagation(); nextProduct(); }}>
                                                    <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeUp} className="cta-row">
                            <Link href="#book-demo" className="pill-wrapper">
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
                    <span className="hb-mid">Built for universities, worldwide</span>
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
                            The complete AI suite for modern universities.
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
                            Three AI modules. One unified platform. Covering every step: from crafting the perfect question paper to delivering bias-free results at scale.
                        </h2>
                        
                        <div className="si-footer">
                            <div className="si-socials-wrapper">
                                <span className="si-socials-label">Find us online</span>
                                <div className="si-socials">
                                    <a href="https://youtube.com/@bigchalkbox_ai" target="_blank" rel="noopener noreferrer" className="si-social-btn" title="YouTube" style={{ padding: '0', background: 'transparent', border: 'none' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                                            <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                                            <path fill="#ffffff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                        </svg>
                                    </a>
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
                                    <h3 className="wk-h3">Answer Sheet Evaluation</h3>
                                    <p className="wk-p">An intelligent system. Combines OCR and LLMs to deliver fast, accurate, and unbiased grading for handwritten assessments.</p>
                                    <div className="wk-tags">
                                        <span className="tag-chip"><CheckCircle size={16} /> Grades in minutes</span>
                                        <span className="tag-chip"><CheckCircle size={16} /> Objective rubrics</span>
                                        <span className="tag-chip"><CheckCircle size={16} /> Question-level feedback</span>
                                    </div>
                                    <Link href="/products/dases" className="mt-8 inline-block pointer-events-auto">
                                        <span className="pill-button light has-arrow">
                                            Explore Answer Sheet Evaluation
                                            <span className="arrow-badge right"><ArrowRight size={18} /></span>
                                        </span>
                                    </Link>
                                </div>
                            </div>
                            <div className="wk-vid-wrapper mt-8 lg:mt-0 relative z-10 pointer-events-none">
                                <img 
                                    src="/images/landing/dashboard_preview_1.png"
                                    alt="Answer Sheet Evaluation Dashboard Preview"
                                    className="wk-vid"
                                />
                            </div>
                        </motion.div>

                        {/* Product 3: Question Paper Moderation */}
                        <motion.div 
                            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                            className="wk-card wk-card-3 group magic-bento-card--border-glow"
                        >

                            <div className="wk-top relative z-10 pointer-events-none">
                                <span>Quality Audit</span>
                                <div className="wk-badge"><ArrowUpRight /></div>
                            </div>
                            <div className="wk-bot relative z-10 pointer-events-none">
                                <h3 className="wk-h3">Question Paper Moderation</h3>
                                <p className="wk-p">Automated quality audits for your question papers. Ensure syllabus coverage, difficulty balance, and eliminate errors before exams.</p>
                                <div className="wk-tags mb-6">
                                    <span className="tag-chip">Repetitive checks</span>
                                    <span className="tag-chip">Difficulty scoring</span>
                                </div>
                                <Link href="/products/qp-moderation" className="mt-auto inline-block pointer-events-auto">
                                    <span className="pill-button light has-arrow">
                                        Explore Question Paper Moderation
                                        <span className="arrow-badge right"><ArrowRight size={18} /></span>
                                    </span>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Product 2: Question Paper Generation */}
                        <motion.div 
                            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                            className="wk-card wk-card-2 group magic-bento-card--border-glow"
                        >

                            <div className="wk-top relative z-10 pointer-events-none">
                                <span>Curriculum Aligned</span>
                                <div className="wk-badge"><ArrowUpRight /></div>
                            </div>
                            <div className="wk-bot relative z-10 pointer-events-none">
                                <h3 className="wk-h3">Question Paper Generation</h3>
                                <p className="wk-p">Instantly create curriculum-aligned question papers. Generate diverse question types with balanced difficulty levels in seconds.</p>
                                <div className="wk-tags mb-6">
                                    <span className="tag-chip">Blueprint-aligned</span>
                                    <span className="tag-chip">Bloom's Taxonomy</span>
                                </div>
                                <Link href="/products/qp-generation" className="mt-auto inline-block pointer-events-auto">
                                    <span className="pill-button light has-arrow">
                                        Explore Question Paper Generation
                                        <span className="arrow-badge right"><ArrowRight size={18} /></span>
                                    </span>
                                </Link>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* CTA BANNER 1 - After The Suite */}
            <section className="cta-banner cta-banner--light cta-banner--pre-pixel">
                <div className="shell cta-banner__inner">
                    <div className="cta-banner__text">
                        <h2 className="cta-banner__h2">
                            Generate. Moderate. Evaluate.<br/>
                            <span className="cta-banner__accent">The complete exam lifecycle, automated.</span>
                        </h2>
                        <p className="cta-banner__sub">Forward-thinking institutions trust BigChalkBox to create flawless question papers, audit them for quality, and evaluate thousands of answer sheets. All with AI precision that no manual process can match.</p>
                    </div>
                    <div className="cta-banner__btns">
                        <Link href="#book-demo" className="cta-banner__btn cta-banner__btn--primary">Book a Free Demo</Link>
                        <Link href="#works" className="cta-banner__btn cta-banner__btn--ghost">Explore the Suite</Link>
                    </div>
                </div>
            </section>

            {/* UNIFIED GRADIENT WRAPPER */}
            <div className="services-gradient-wrapper">
                {/* PIXEL TRANSITION */}
                <PixelTransition />

                {/* SERVICES / STAKEHOLDERS */}
                <section id="services" className="flex flex-col items-center pt-24 pb-24 lg:pt-24 lg:pb-32 overflow-hidden relative">
                
                <div className="flex flex-col items-center mb-6 lg:mb-8 z-10 px-4 text-center">
                    <motion.div 
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="eyebrow eyebrow-light mb-4"
                    >
                        <div className="eyebrow-dot"></div> Built For The Entire Institution
                    </motion.div>
                    
                    <motion.h2 
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="sv-h2 !mb-0 text-white"
                    >
                        One suite. Infinite impact.<br/>
                        <span className="sv-accent-sassy">For every stakeholder.</span>
                    </motion.h2>
                </div>

                <div className="shell sv-shell w-full mt-6 lg:-mt-8 relative z-20">
                    {/* MOBILE VIEW: Horizontal Card Carousel */}
                    <div ref={mobileCarouselRef} className="flex lg:hidden w-full overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {STAKEHOLDERS.map((stakeholder, idx) => (
                            <div key={idx} className="snap-center shrink-0 w-[85vw] max-w-sm sv-bento-card stakeholder-card flex flex-col justify-start overflow-hidden relative">
                                <div className="sv-card-inner stakeholder-card-inner !p-6 sm:!p-8 h-full flex flex-col justify-start">
                                    <div className="sv-card-header !gap-4 !mb-6">
                                        <div className="sv-icon-large !w-14 !h-14 !rounded-2xl">
                                            {stakeholder.icon}
                                        </div>
                                        <h3 className="sv-card-h3 !text-2xl sm:!text-3xl">
                                            {stakeholder.title}
                                        </h3>
                                    </div>
                                    <p className="sv-card-desc !text-sm sm:!text-base !mb-6">
                                        {stakeholder.desc}
                                    </p>
                                    <div className="sv-pills !gap-3 flex-wrap mt-auto">
                                        {stakeholder.points.map((pt, i) => (
                                            <div key={i} className="sv-pill !py-2 !px-3 sm:!py-2.5 sm:!px-4 !text-[13px] sm:!text-sm !rounded-xl flex items-center gap-2">
                                                <CheckCircle size={14} className="shrink-0" /> {pt}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* DESKTOP VIEW: Wheel + Dynamic Card */}
                    <div className="stakeholder-grid hidden lg:grid grid-cols-2 gap-16 relative w-full max-w-6xl mx-auto h-[380px]" ref={svGridRef}>
                        
                        {/* LEFT: OptionWheel */}
                        <div className="stakeholder-wheel-panel relative w-full h-full group">
                            
                            {/* Scroll Hint */}
                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 -translate-x-full flex flex-col items-center justify-center gap-4 text-white/20 transition-colors duration-500 group-hover:text-white/50">
                                <span className="text-[10px] font-medium uppercase tracking-[0.2em] -rotate-180" style={{ writingMode: 'vertical-rl' }}>Scroll or Drag</span>
                                <ChevronsUpDown size={16} className="animate-pulse" />
                            </div>

                            <div className="stakeholder-wheel-mask relative h-full flex items-center justify-start overflow-hidden w-full" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'}}>
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
                                    className="stakeholder-option-wheel"
                                    onChange={(idx) => setSelectedStakeholder(idx)}
                                />
                            </div>
                        </div>

                        {/* RIGHT: Dynamic Card */}
                        <div className="stakeholder-card-panel relative h-full flex items-center justify-end w-full max-w-md mx-auto">
                            <div className="relative w-full h-full">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedStakeholder}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="sv-bento-card stakeholder-card absolute inset-0 w-full h-full flex flex-col justify-start overflow-hidden"
                                    >
                                        <div className="sv-card-inner stakeholder-card-inner !p-8 h-full flex flex-col justify-start">
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

            {/* CTA BANNER 2 - After FAQs */}
            <section className="cta-banner cta-banner--light cta-banner--compact-top">
                <div className="shell cta-banner__inner">
                    <div className="cta-banner__text">
                        <h2 className="cta-banner__h2">
                            Stop managing exams manually.<br/>
                            <span className="cta-banner__accent">Let BigChalkBox run the full cycle.</span>
                        </h2>
                        <p className="cta-banner__sub">4,000+ answer sheets evaluated. 200+ question papers generated & moderated. Trusted by educators worldwide. Your institution is next.</p>
                    </div>
                    <div className="cta-banner__btns">
                        <Link href="#book-demo" className="cta-banner__btn cta-banner__btn--primary">Book a Free Pilot</Link>
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
