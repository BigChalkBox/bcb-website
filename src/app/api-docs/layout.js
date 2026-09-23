import Link from 'next/link';
import 'highlight.js/styles/atom-one-dark.css';
import './api-docs.css';

export const metadata = {
    title: 'Partner API Reference | BigChalkBox',
    description:
        'Complete API Reference and Integration Guide for the BigChalkBox Partner API v1.3 — authentication, grading lifecycle, webhooks, and every endpoint.',
};

export default function ApiDocsLayout({ children }) {
    return (
        <div className="api-docs-root">
            {/* ── Top navigation bar ── */}
            <header className="api-topbar">
                <Link href="/" className="api-topbar-logo">
                    <span className="grad">BigChalkBox</span>
                    <span className="sep">/</span>
                    <span style={{ color: '#8b949e', fontWeight: 400 }}>Developers</span>
                </Link>
                <div className="api-topbar-spacer" />
                <a
                    href="/partner-api-openapi.json"
                    download="partner-api-openapi.json"
                    className="api-topbar-download"
                >
                    ↓ Download OpenAPI Spec
                </a>
            </header>

            {/* ── Main two-column grid ── */}
            <div className="api-layout">
                {children}
            </div>
        </div>
    );
}
