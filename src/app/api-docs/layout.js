import Link from 'next/link';
import 'highlight.js/styles/atom-one-dark.css';
import './api-docs.css';
import { ThemeProvider } from '@/components/api-docs/ThemeProvider';

export const metadata = {
    title: 'Partner API Reference | BigChalkBox Developers',
    description:
        'Complete API Reference and Integration Guide for the BigChalkBox Partner API v1.3 — authentication, grading lifecycle, webhooks, and every endpoint.',
};

export default function ApiDocsLayout({ children }) {
    return (
        <ThemeProvider>
            <div className="api-docs-root">
                {/* ── Two-column body ── */}
                <div className="api-layout">
                    {children}
                </div>
            </div>
        </ThemeProvider>
    );
}
