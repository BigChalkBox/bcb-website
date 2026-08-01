'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import SiteHeader from '../shared/SiteHeader'
import SiteFooter from '../shared/SiteFooter'
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
        name: 'Question Paper Moderation',
        desc: 'Automated quality audits for your question papers before sign-off.',
        volume: '₹400',
        volumeLabel: '+ GST / paper',
        cta: 'Book a Demo',
        ctaStyle: 'default',
        label: 'Features',
        features: [
            { name: 'AI-assisted review for syllabus coverage', included: true },
            { name: "Difficulty balance & Bloom's verification", included: true },
            { name: 'Flags gaps, overlaps, and structural issues', included: true },
            { name: 'Sample Answers (releasing Sept 2026)', included: true },
            { name: 'Marking Rubrics (releasing Sept 2026)', included: true },
        ],
    },
    {
        name: 'Question Paper Generation',
        desc: 'Instantly create curriculum-aligned question papers.',
        volume: '₹400',
        volumeLabel: '+ GST / paper',
        cta: 'Book a Demo',
        ctaStyle: 'primary',
        featured: true,
        label: 'Features',
        features: [
            { name: 'End-to-end AI generation aligned to syllabus', included: true },
            { name: "Configurable by section, difficulty, & Bloom's", included: true },
            { name: 'Sample Answers for every question', included: true },
            { name: 'Marking Rubrics with criterion descriptors', included: true },
            { name: 'Print-ready output in institutional format', included: true },
        ],
    },
    {
        name: 'Evaluation Module',
        desc: 'Automated AI evaluation for handwritten assessments.',
        volume: 'Custom',
        volumeLabel: 'pricing',
        cta: 'Contact Us',
        ctaStyle: 'default',
        label: 'Features',
        features: [
            { name: 'QP, sample answers, & rubrics flow in directly', included: true },
            { name: 'Faculty upload student scripts for AI evaluation', included: true },
            { name: 'Per-sheet, per-question scores with feedback', included: true },
            { name: 'Seamlessly connected to Question Paper Generation', included: true },
        ],
    },
]

const faqData = [
    {
        question: 'How is the Answer Sheet Evaluation priced?',
        answer: 'Pricing is based on your chosen package and institution size. Contact us for a custom quote — we\'ll tailor it to your volume and requirements.',
    },
    {
        question: 'Is there a free pilot?',
        answer: 'Yes. We offer a free pilot where you can test the Answer Sheet Evaluation system with your real question papers and answer sheets before committing. No credit card required.',
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
                                <span className="pp-badge">AI Assessment Suite</span>
                                <h1 className="pp-hero-title">
                                    Simple, modular <span className="accent">pricing.</span>
                                </h1>
                                <p className="pp-hero-sub">
                                    Only pay for the products you need. No complicated tiers.
                                </p>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ==================== PRICING PRODUCTS (MINIMALIST) ==================== */}
                    <section className="pp-container">
                        <div className="pp-products-wrapper">
                            {packages.map((pkg, idx) => (
                                <FadeIn key={idx} delay={idx * 0.1}>
                                    <div className="pp-product-section">
                                        <div className="pp-product-left">
                                            <h3 className="pp-product-name">{pkg.name}</h3>
                                            <p className="pp-product-desc">{pkg.desc}</p>
                                            <Link href="/#contact">
                                                <button className={`pp-product-cta ${pkg.ctaStyle}`}>
                                                    {pkg.cta} <span className="material-symbols-outlined">arrow_forward</span>
                                                </button>
                                            </Link>
                                        </div>
                                        
                                        <div className="pp-product-right">
                                            <div className="pp-product-price">
                                                <span className="amount">{pkg.volume}</span>
                                                <span className="period">{pkg.volumeLabel}</span>
                                            </div>
                                            
                                            <ul className="pp-product-features">
                                                {pkg.features.map((feature, i) => (
                                                    <li key={i}>
                                                        <span className="material-symbols-outlined check">check</span>
                                                        {feature.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </section>


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
