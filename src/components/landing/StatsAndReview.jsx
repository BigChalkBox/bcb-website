'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import './LandingPage.css'

const REVIEWS = [
    {
        initials: 'LS',
        name: 'Lalit Sachan',
        role: 'Prof.',
        gradient: 'from-emerald-400 to-emerald-800',
        ring: 'ring-emerald-500/20 group-hover:ring-emerald-500/50',
        shadow: 'shadow-emerald-900/50',
        quote: 'BigChalkBox brought a level of speed and fairness to our evaluation process that we had never seen before. Results that took weeks now arrive within hours.'
    },

    {
        initials: 'P',
        name: 'Dr. Pramod',
        role: 'Prof.',
        gradient: 'from-green-400 to-green-900',
        ring: 'ring-green-500/20 group-hover:ring-green-500/50',
        shadow: 'shadow-green-900/50',
        quote: 'What impressed me most was the consistency. Every student is evaluated against the same rubric, with no room for bias. That is exactly what academia needs.'
    },
    {
        initials: 'SK',
        name: 'Dr. Sanjeev Kumar',
        role: 'Prof.',
        gradient: 'from-lime-400 to-lime-900',
        ring: 'ring-lime-500/20 group-hover:ring-lime-500/50',
        shadow: 'shadow-lime-900/50',
        quote: 'BigChalkBox has transformed our evaluation workflow. The faculty can finally focus on teaching instead of spending entire weekends grading answer sheets.'
    }
]

export default function StatsAndReview() {
    const statsRef = useRef(null)
    const statsInView = useInView(statsRef, { once: true, margin: "-100px" })
    const [activeIdx, setActiveIdx] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIdx(prev => (prev + 1) % REVIEWS.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    }

    const r = REVIEWS[activeIdx]

    return (
        <div className="shell ft-shell stats-review" style={{ borderRadius: '0', overflow: 'hidden' }}>
            <motion.div
                ref={statsRef}
                initial="hidden" animate={statsInView ? "visible" : "hidden"} variants={fadeUp}
                className="stats-review__layout flex flex-col lg:flex-row items-stretch lg:items-center gap-12 lg:gap-16 py-0 relative w-full"
            >
            {/* Glowing background accent */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Stats */}
                <div className="stats-review__metrics flex flex-col sm:flex-row flex-wrap lg:flex-nowrap items-center sm:items-start lg:items-center justify-center lg:justify-start gap-10 sm:gap-12 lg:gap-16 w-full lg:w-auto flex-shrink-0 relative z-10 text-center sm:text-left">
                    <div className="stats-review__metric group relative min-w-0 flex flex-col items-center sm:items-start lg:items-start">
                        <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative text-5xl lg:text-7xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform duration-500">
                            {statsInView ? '150+' : '0'}
                        </div>
                        <div className="text-xs lg:text-sm text-white/60 mt-2 uppercase tracking-[0.2em] font-bold">Educators</div>
                    </div>
                    <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent hidden lg:block" />
                    <div className="stats-review__metric group relative min-w-0 flex flex-col items-center sm:items-start lg:items-start">
                        <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative text-5xl lg:text-7xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform duration-500">
                            {statsInView ? '10K+' : '0'}
                        </div>
                        <div className="text-xs lg:text-sm text-white/60 mt-2 uppercase tracking-[0.2em] font-bold">Sheets Done</div>
                    </div>
                    <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent hidden lg:block" />
                    <div className="stats-review__metric group relative min-w-0 flex flex-col items-center sm:items-start lg:items-start">
                        <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative text-5xl lg:text-7xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform duration-500">
                            {statsInView ? '500+' : '0'}
                        </div>
                        <div className="text-xs lg:text-sm text-white/60 mt-2 uppercase tracking-[0.2em] font-bold">Question Papers</div>
                    </div>
                </div>

                {/* Rotating Review Card */}
                <div className="flex-none lg:flex-1 relative ml-0 lg:ml-8 z-10 w-full">
                    <AnimatePresence mode="wait">
                        <motion.blockquote
                            key={activeIdx}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="relative w-full h-full min-h-[280px] lg:min-h-[260px] p-8 lg:p-10 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md overflow-hidden group hover:bg-white/[0.04] transition-colors duration-500 flex flex-col justify-between"
                        >
                            {/* Decorative Giant Quote */}
                            <div className="absolute -top-8 -left-6 text-[15rem] font-serif text-white/[0.02] leading-none pointer-events-none group-hover:text-emerald-500/[0.05] transition-colors duration-700 select-none">
                                "
                            </div>

                            <p className="text-white/90 text-base lg:text-lg leading-relaxed font-light relative z-10 flex-1">
                                "{r.quote}"
                            </p>

                            <footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10 mt-6 sm:mt-8 gap-6 sm:gap-0 flex-shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${r.gradient} flex items-center justify-center text-white font-bold shadow-lg ${r.shadow} border border-white/10 ring-2 ${r.ring} transition-all duration-500`}>
                                        {r.initials}
                                    </div>
                                    <div>
                                        <strong className="block text-white text-base font-semibold">{r.name}</strong>
                                        <span className="text-emerald-400 text-xs uppercase tracking-[0.15em] font-bold mt-0.5 block">{r.role}</span>
                                    </div>
                                </div>

                                {/* Dot indicators */}
                                <div className="flex gap-2 items-center self-center sm:self-auto">
                                    {REVIEWS.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveIdx(i)}
                                            aria-label={`Show review ${i + 1}`}
                                            className={`rounded-full transition-all duration-300 ${i === activeIdx ? 'w-5 h-2 bg-emerald-400' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
                                        />
                                    ))}
                                </div>
                            </footer>
                        </motion.blockquote>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
