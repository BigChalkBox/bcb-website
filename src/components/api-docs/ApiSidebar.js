'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function ApiSidebar({ toc }) {
    const [activeId, setActiveId] = useState('');
    const observerRef = useRef(null);

    useEffect(() => {
        // Clean up previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        // Collect all heading elements referenced in the TOC
        const elements = toc
            .map(item => document.getElementById(item.id))
            .filter(Boolean);

        if (elements.length === 0) return;

        // Use IntersectionObserver to track which heading is in the viewport.
        // rootMargin: top offset accounts for sticky header (56px); bottom
        // cutoff (-70%) ensures we highlight the heading you're reading, not
        // one far below.
        observerRef.current = new IntersectionObserver(
            (entries) => {
                // Find the topmost intersecting heading
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                if (visible.length > 0) {
                    setActiveId(visible[0].target.id);
                }
            },
            { rootMargin: '-64px 0px -68% 0px', threshold: 0 }
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
        <motion.aside
            className="api-sidebar"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="api-sidebar-inner">
                <p className="api-sidebar-heading">On this page</p>

                <ul className="api-toc-list">
                    {toc.map((item, idx) => {
                        // Only render h1, h2, h3 — h4/h5 are too granular for a sidebar
                        if (item.level > 3) return null;

                        const isActive = activeId === item.id;

                        return (
                            <li
                                key={`${item.id}-${idx}`}
                                className={`api-toc-item api-toc-l${item.level}`}
                            >
                                <a
                                    href={`#${item.id}`}
                                    className={`api-toc-link${isActive ? ' active' : ''}`}
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
            </div>
        </motion.aside>
    );
}
