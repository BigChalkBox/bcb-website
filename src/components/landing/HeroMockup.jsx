'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function HeroMockup() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      perspective: '1000px',
      position: 'relative'
    }}>
      <motion.div
        initial={{ rotateX: 10, rotateY: -15, scale: 0.9, opacity: 0 }}
        animate={{ rotateX: 0, rotateY: -10, scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        style={{
          position: 'relative',
          width: '85%',
          maxWidth: '460px',
          aspectRatio: '3/4',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.05), inset 0 0 0 1px #E2E8F0',
          padding: '2.5rem',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Answer Sheet Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #F1F5F9', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ width: '140px', height: '14px', background: '#F1F5F9', borderRadius: '4px', marginBottom: '10px' }} />
            <div style={{ width: '90px', height: '14px', background: '#F1F5F9', borderRadius: '4px' }} />
          </div>
          <div style={{ width: '70px', height: '70px', border: '3px solid #F1F5F9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '40px', background: 'repeating-conic-gradient(#CBD5E1 0% 25%, transparent 0% 50%) 50% / 20px 20px' }} />
          </div>
        </div>

        {/* Mock Handwriting Lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ width: i % 2 === 0 ? '100%' : '85%', height: '16px', background: 'repeating-linear-gradient(45deg, #F8FAFC, #F8FAFC 10px, #F1F5F9 10px, #F1F5F9 20px)', borderRadius: '4px', opacity: 0.7 }} />
          ))}
        </div>

        {/* Scanner Line Animation */}
        <motion.div
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            left: 0, right: 0,
            height: '2px',
            background: 'rgba(34, 197, 94, 0.8)',
            boxShadow: '0 0 20px 4px rgba(34, 197, 94, 0.25)',
            zIndex: 10,
          }}
        />

        {/* Floating Badges */}
        <motion.div
          initial={{ opacity: 0, x: 20, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6, type: 'spring', bounce: 0.4 }}
          style={{
            position: 'absolute',
            top: '25%',
            right: '-15%',
            background: '#1A2421',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transform: 'translateZ(50px)',
          }}
        >
          <span className="material-symbols-outlined" style={{ color: '#22c55e', fontSize: '24px' }}>document_scanner</span>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '2px' }}>OCR Engine</div>
            <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>99.8% Match</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20, y: -10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6, type: 'spring', bounce: 0.4 }}
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '-10%',
            background: 'white',
            border: '1px solid #E2E8F0',
            padding: '16px 24px',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transform: 'translateZ(60px)',
          }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EEF5EE', color: '#1C5F20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', fontFamily: "'Fraunces', serif" }}>
            9
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '2px' }}>Evaluation</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1A2421', fontFamily: "'Outfit', sans-serif" }}>9/10 Marks</div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
