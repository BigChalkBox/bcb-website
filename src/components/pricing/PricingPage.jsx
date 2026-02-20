'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import SiteHeader from '../shared/SiteHeader'
import SiteFooter from '../shared/SiteFooter'
import BackedBy from '../shared/BackedBy'
import './PricingPage.css'

const FadeIn = ({ children, delay = 0, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: "-100px" }}
        className={className}
    >
        {children}
    </motion.div>
)

const packages = [
    {
        name: 'Starter',
        desc: 'For individual faculty getting started with AI evaluation.',
        volume: 'Up to 200',
        volumeLabel: 'sheets / month',
        cta: 'Start Free Pilot',
        ctaStyle: 'default',
        label: 'Includes',
        features: [
            { name: 'Smart Paper Builder', included: true },
            { name: 'AI Rubric Generation', included: true },
            { name: 'AI Evaluation Engine', included: true },
            { name: 'Basic Reports (Web)', included: true },
            { name: 'QuickPass™ Analysis', included: false },
            { name: 'Syllabus Coverage', included: false },
            { name: 'Student Portal', included: false },
            { name: 'Advanced Analytics', included: false },
        ],
    },
    {
        name: 'Growth',
        desc: 'For departments scaling across multiple faculty and courses.',
        volume: 'Up to 2,000',
        volumeLabel: 'sheets / month',
        cta: 'Book a Demo',
        ctaStyle: 'primary',
        featured: true,
        label: 'Everything in Starter, plus',
        features: [
            { name: 'Smart Paper Builder', included: true },
            { name: 'AI Rubric Generation', included: true },
            { name: 'AI Evaluation Engine', included: true },
            { name: 'Professional PDF Reports', included: true },
            { name: 'QuickPass™ Analysis', included: true },
            { name: 'Syllabus Coverage', included: true },
            { name: 'Student Portal', included: false },
            { name: 'Advanced Analytics', included: false },
        ],
    },
    {
        name: 'Institution',
        desc: 'Full platform access for universities and large organizations.',
        volume: 'Unlimited',
        volumeLabel: 'sheets',
        cta: 'Contact Us',
        ctaStyle: 'default',
        label: 'Full Platform Access',
        features: [
            { name: 'Smart Paper Builder', included: true },
            { name: 'AI Rubric Generation', included: true },
            { name: 'AI Evaluation Engine', included: true },
            { name: 'Professional PDF Reports', included: true },
            { name: 'QuickPass™ Analysis', included: true },
            { name: 'Syllabus Coverage', included: true },
            { name: 'Student Portal', included: true },
            { name: 'Advanced Analytics', included: true },
        ],
    },
]

const faqData = [
    {
        question: 'How is DASES priced?',
        answer: 'Pricing is based on your chosen package and institution size. Contact us for a custom quote — we\'ll tailor it to your volume and requirements.',
    },
    {
        question: 'Is there a free pilot?',
        answer: 'Yes. We offer a free pilot where you can test DASES with your real question papers and answer sheets before committing. No credit card required.',
    },
    {
        question: 'Can I upgrade my package later?',
        answer: 'Absolutely. Start with Starter and upgrade as you grow. Your setup, rubrics, and evaluation data all carry over seamlessly.',
    },
    {
        question: 'Do you offer institutional discounts?',
        answer: 'Yes. We offer volume discounts for institutions with large faculty teams or multiple departments. Contact us for a custom pricing plan.',
    },
]

export default function PricingPage() {
    const [openFaq, setOpenFaq] = useState(null)

    return (
        <>
            <div className="pricing-page">
                <SiteHeader />

                <main>
                    {/* ==================== HERO ==================== */}
                    <section className="pp-hero">
                        <div className="pp-container">
                            <FadeIn>
                                <span className="pp-badge">Simple Pricing</span>
                                <h1 className="pp-hero-title">
                                    Pick the Package That <span className="accent">Fits You.</span>
                                </h1>
                                <p className="pp-hero-sub">
                                    Three packages, each with a clear set of solutions. Start small and scale as you grow.
                                </p>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ==================== PRICING CARDS ==================== */}
                    <section className="pp-container">
                        <FadeIn>
                            <div className="pp-cards">
                                {packages.map((pkg, idx) => (
                                    <div className={`pp-card ${pkg.featured ? 'featured' : ''}`} key={idx}>
                                        {pkg.featured && <div className="pp-card-popular">Most Popular</div>}
                                        <div className="pp-card-header">
                                            <h3>{pkg.name}</h3>
                                            <p className="desc">{pkg.desc}</p>
                                            <div className="pp-price">
                                                <span className="amount">{pkg.volume}</span>
                                                <span className="period">{pkg.volumeLabel}</span>
                                            </div>
                                        </div>
                                        <Link href="/#contact">
                                            <button className={`pp-card-cta ${pkg.ctaStyle}`}>{pkg.cta}</button>
                                        </Link>
                                        <div style={{ marginTop: 'auto' }}>
                                            <p className="pp-card-features-label">{pkg.label}</p>
                                            <ul className="pp-feature-list">
                                                {pkg.features.map((feature, i) => (
                                                    <li key={i} className={feature.included ? '' : 'disabled'}>
                                                        <span className="material-symbols-outlined">
                                                            {feature.included ? 'check_circle' : 'cancel'}
                                                        </span>
                                                        {feature.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </FadeIn>
                    </section>

                    <BackedBy />

                    {/* ==================== FAQ ==================== */}
                    <section className="pp-faq">
                        <div className="pp-container">
                            <FadeIn>
                                <h2 className="pp-faq-title">Pricing Questions</h2>
                                <div className="pp-faq-list">
                                    {faqData.map((faq, idx) => (
                                        <div
                                            className={`pp-faq-item ${openFaq === idx ? 'open' : ''}`}
                                            key={idx}
                                            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        >
                                            <h4>
                                                {faq.question}
                                                <span className="material-symbols-outlined">expand_more</span>
                                            </h4>
                                            <div className="pp-faq-answer">
                                                <p>{faq.answer}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                        </div>
                    </section>
                </main>

                <SiteFooter />
            </div>
        </>
    )
}
