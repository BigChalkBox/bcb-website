'use client';

import { useState } from 'react';

export default function CopyDocsButton() {
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'copied' | 'error'

    const handleCopy = async () => {
        if (status === 'loading') return;
        
        try {
            setStatus('loading');
            const res = await fetch('/api/docs-md');
            if (!res.ok) throw new Error('Failed to fetch markdown');
            
            const markdown = await res.text();
            await navigator.clipboard.writeText(markdown);
            
            setStatus('copied');
            setTimeout(() => setStatus('idle'), 2500);
        } catch (error) {
            console.error('Copy failed:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2500);
        }
    };

    return (
        <button
            onClick={handleCopy}
            disabled={status === 'loading'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[var(--color-border)] text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:border-[var(--color-gold)]/50 transition-all bg-white"
            title="Copy documentation as raw Markdown for AI agents like ChatGPT or Claude"
        >
            {status === 'loading' && (
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            
            {status === 'idle' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            )}

            {status === 'copied' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            )}

            {status === 'error' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            )}

            <span className={status === 'copied' ? 'text-[var(--color-gold)] font-semibold' : ''}>
                {status === 'loading' ? 'Loading...' : 
                 status === 'copied' ? 'Copied MD!' : 
                 status === 'error' ? 'Failed' : 
                 'Copy as MD (for AI)'}
            </span>
        </button>
    );
}
