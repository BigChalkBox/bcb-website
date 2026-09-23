'use client';

import { motion } from 'framer-motion';

export default function MarkdownRenderer({ htmlContent }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="api-content-area"
        >
            <div
                className="api-prose"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        </motion.div>
    );
}
