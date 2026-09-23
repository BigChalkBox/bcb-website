'use client';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { useTheme } from './ThemeProvider';

export default function MermaidInit() {
    const { theme, mounted } = useTheme();
    const initialized = useRef(false);

    useEffect(() => {
        if (!mounted) return;

        // Initialize mermaid with the current theme
        mermaid.initialize({ 
            startOnLoad: false, 
            theme: theme === 'dark' ? 'dark' : 'default',
        });

        const renderMermaid = async () => {
            const elements = document.querySelectorAll('.language-mermaid');
            
            elements.forEach((el, i) => {
                const id = `mermaid-svg-${i}`;
                const text = el.textContent;
                
                // If it was already rendered, remove the old SVG wrapper
                if (el.hasAttribute('data-processed')) {
                    const oldWrapper = document.getElementById(`${id}-wrapper`);
                    if (oldWrapper) oldWrapper.remove();
                } else {
                    el.setAttribute('data-processed', 'true');
                    // Hide the original pre tag so we can read it again later
                    if (el.parentElement.tagName === 'PRE') {
                        el.parentElement.style.display = 'none';
                    } else {
                        el.style.display = 'none';
                    }
                }

                mermaid.render(id, text).then(({ svg }) => {
                    const wrapper = document.createElement('div');
                    wrapper.id = `${id}-wrapper`;
                    wrapper.innerHTML = svg;
                    wrapper.className = 'mermaid-rendered my-8 flex justify-center bg-[var(--color-cream-dark)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm transition-colors duration-200';
                    
                    if (el.parentElement.tagName === 'PRE') {
                        el.parentElement.after(wrapper);
                    } else {
                        el.after(wrapper);
                    }
                }).catch(e => console.error(e));
            });
        };

        renderMermaid();
    }, [theme, mounted]);

    return null;
}
