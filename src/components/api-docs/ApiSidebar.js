'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function ApiSidebar({ toc }) {
    const [activeId, setActiveId] = useState('');
    const observerRef = useRef(null);

    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        const elements = toc.map(item => document.getElementById(item.id)).filter(Boolean);
        if (elements.length === 0) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) setActiveId(visible[0].target.id);
            },
            { rootMargin: '-96px 0px -68% 0px', threshold: 0 }
        );

        elements.forEach(el => observerRef.current.observe(el));

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [toc]);

    // Scroll active item into view in the sidebar
    useEffect(() => {
        if (!activeId) return;
        const link = document.querySelector(`.api-toc-link[href="#${CSS.escape(activeId)}"]`);
        if (link) {
            link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [activeId]);

    return (
        <motion.nav
            className="space-y-4 text-sm"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="text-xs font-semibold tracking-wider text-[var(--color-slate)] uppercase mb-4">Contents</div>
            <ul className="space-y-1">
                {toc.map((item, idx) => {
                    if (item.level > 3) return null;
                    const isActive = activeId === item.id;

                    // Tailwind styling based on nesting level
                    let linkClasses = 'block py-1 api-toc-link transition-colors duration-150 ';
                    if (item.level === 1 || item.level === 2) {
                        linkClasses += isActive 
                            ? 'text-[var(--color-gold)] font-medium' 
                            : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] font-medium';
                    } else {
                        linkClasses += 'pl-3 border-l ' + (isActive 
                            ? 'border-[var(--color-gold)] text-[var(--color-gold)] font-medium' 
                            : 'border-[var(--color-border)] text-[var(--color-slate)] hover:text-[var(--color-ink-soft)] hover:border-slate-400');
                    }

                    return (
                        <li key={`${item.id}-${idx}`}>
                            <a
                                href={`#${item.id}`}
                                className={linkClasses}
                                onClick={(e) => {
                                    e.preventDefault();
                                    const el = document.getElementById(item.id);
                                    if (el) {
                                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        window.history.pushState(null, '', `#${item.id}`);
                                    }
                                }}
                                title={item.title}
                            >
                                {item.title}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </motion.nav>
    );
}
