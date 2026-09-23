import Link from 'next/link';
import 'highlight.js/styles/atom-one-dark.css';
import './api-docs.css';

export const metadata = {
    title: 'Partner API Reference | BigChalkBox Developers',
    description:
        'Complete API Reference and Integration Guide for the BigChalkBox Partner API v1.3 — authentication, grading lifecycle, webhooks, and every endpoint.',
};

export default function ApiDocsLayout({ children }) {
    return (
        <div className="api-docs-root">
            {/* ── Top bar ── */}
            <header className="api-topbar">
                <Link href="/" className="api-topbar-logo">
                    {/* Reuse brand logo text in BCB style */}
                    <span className="brand-green">BigChalkBox</span>
                    <span className="sep">/</span>
                    <span className="dev-label">Developers</span>
                </Link>

                <span className="api-topbar-badge">v1.3</span>

                <div className="api-topbar-spacer" />

                <a
                    href="/partner-api-openapi.json"
                    download="partner-api-openapi.json"
                    className="api-topbar-download"
                >
                    ↓ OpenAPI Spec
                </a>
            </header>

            {/* ── Two-column body ── */}
            <div className="api-layout">
                {children}
            </div>
        </div>
    );
}
