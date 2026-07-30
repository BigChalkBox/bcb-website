'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import './LandingPage.css' // Needed for ft-shell styling

export default function StatsAndReview() {
    const statsRef = useRef(null)
    const statsInView = useInView(statsRef, { once: true, margin: "-100px" })

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    }

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
                <div className="stats-review__metrics grid grid-cols-2 lg:flex items-start lg:items-center gap-8 lg:gap-16 w-full lg:w-auto flex-shrink-0 relative z-10">
                    <div className="stats-review__metric group relative min-w-0">
                        <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative text-5xl lg:text-7xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform duration-500">
                            {statsInView ? '50+' : '0'}
                        </div>
                        <div className="text-xs lg:text-sm text-white/60 mt-2 uppercase tracking-[0.2em] font-bold">Educators</div>
                    </div>
                    <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent hidden lg:block" />
                    <div className="stats-review__metric group relative min-w-0">
                        <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative text-5xl lg:text-7xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform duration-500">
                            {statsInView ? '4K+' : '0'}
                        </div>
                        <div className="text-xs lg:text-sm text-white/60 mt-2 uppercase tracking-[0.2em] font-bold">Sheets Done</div>
                    </div>
                    <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent hidden lg:block" />
                    <div className="stats-review__metric group relative min-w-0 col-span-2 lg:col-span-1">
                        <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative text-5xl lg:text-7xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform duration-500">
                            {statsInView ? '200+' : '0'}
                        </div>
                        <div className="text-xs lg:text-sm text-white/60 mt-2 uppercase tracking-[0.2em] font-bold">Question Papers</div>
                    </div>
                </div>

                {/* Premium Glass Card Quote */}
                <blockquote className="stats-review__quote flex-1 relative p-8 lg:p-10 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md overflow-hidden group hover:bg-white/[0.04] transition-colors duration-500 ml-0 lg:ml-8 z-10">
                    {/* Decorative Giant Quote */}
                    <div className="absolute -top-8 -left-6 text-[15rem] font-serif text-white/[0.02] leading-none pointer-events-none group-hover:text-emerald-500/[0.05] transition-colors duration-700 select-none">
                        "
                    </div>
                    
                    <p className="text-white/90 text-lg lg:text-xl leading-relaxed mb-8 font-light relative z-10">
                        "BigChalkBox dramatically improved our evaluation turnaround time while maintaining academic rigor. Our faculty can now focus more on teaching."
                    </p>
                    
                    <footer className="flex items-center gap-4 relative z-10">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-800 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/50 border border-white/10 ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/50 transition-all duration-500">
                            SK
                        </div>
                        <div>
                            <strong className="block text-white text-base font-semibold">Dr. Sanjeev Kumar</strong>
                            <span className="text-emerald-400 text-xs uppercase tracking-[0.15em] font-bold mt-0.5 block">Professor</span>
                        </div>
                    </footer>
                </blockquote>
            </motion.div>
        </div>
    )
}
