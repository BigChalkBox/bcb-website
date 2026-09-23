'use client';
import { useState } from 'react';

export default function CodeBox({ block }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(block.raw);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="rounded-xl bg-[var(--color-cream-dark)] border border-[var(--color-border)] overflow-hidden shadow-xl min-w-0 cb transition-colors duration-200">
            <div className="cb-head flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)] transition-colors duration-200">
                <span className="cb-lang font-mono text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-slate)]">
                    {block.label}
                </span>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-1 rounded text-[0.65rem] font-mono font-bold uppercase tracking-widest text-[var(--color-slate)] hover:text-[var(--color-ink)] hover:bg-[var(--color-gold)]/10 transition-colors"
                    aria-label="Copy code"
                >
                    {copied ? (
                        <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <span className="text-green-500">Copied</span>
                        </>
                    ) : (
                        <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="p-5 overflow-x-auto text-[0.8125rem] leading-relaxed m-0"><code className="hljs" dangerouslySetInnerHTML={{ __html: block.html }}></code></pre>
        </div>
    );
}
