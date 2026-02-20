'use client'

import { motion } from 'framer-motion'
import './BackedBy.css'

const backers = [
    {
        name: 'Runway Incubator',
        icon: 'rocket_launch',
    },
    {
        name: 'Google for Startups',
        icon: 'cloud',
    },
    {
        name: 'AWS Startups',
        icon: 'deployed_code',
    },
]

export default function BackedBy() {
    return (
        <motion.section
            className="backed-by"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-50px" }}
        >
            <div className="backed-by-inner">
                <span className="backed-by-label">Backed By</span>
                <div className="backed-by-logos">
                    {backers.map((b, idx) => (
                        <div className="backed-by-item" key={idx}>
                            <span className="material-symbols-outlined backed-by-icon">{b.icon}</span>
                            <span className="backed-by-name">{b.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.section>
    )
}
