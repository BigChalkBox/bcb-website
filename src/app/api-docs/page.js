import { getApiDocsData } from '@/lib/api-docs';
import ApiSidebar from '@/components/api-docs/ApiSidebar';

export const metadata = {
    title: 'Partner API Reference | BigChalkBox Developers',
    description: 'Complete API Reference and Integration Guide for the BigChalkBox Partner API v1.3.',
};

// ── Section heading ───────────────────────────────────────────────────────────

const ANCHOR = (
    <svg width="14" height="14" fill="none" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0z" fill="currentColor" />
    </svg>
);

function SectionHead({ id, level, titleHtml }) {
    const Tag = `h${level}`;
    return (
        <Tag id={id} className={`dh dh${level} group`}>
            <a href={`#${id}`} className="da" aria-label="Link to section">{ANCHOR}</a>
            <span dangerouslySetInnerHTML={{ __html: titleHtml }} />
        </Tag>
    );
}

// ── Section row ───────────────────────────────────────────────────────────────

function ApiSection({ section }) {
    const cls = `api-section${section.hasCode ? '' : ' api-section-wide'}`;
    return (
        <section id={`sec-${section.id}`} className={cls}>
            {/* LEFT — prose */}
            <div className="api-prose-col">
                <SectionHead id={section.id} level={section.level} titleHtml={section.titleHtml} />
                {section.proseHtml && (
                    <div className="api-prose" dangerouslySetInnerHTML={{ __html: section.proseHtml }} />
                )}
            </div>

            {/* RIGHT — code (dark column) */}
            {section.hasCode && (
                <div className="api-code-col">
                    {section.codeBlocksHtml.map((html, i) => (
                        <div key={i} dangerouslySetInnerHTML={{ __html: html }} />
                    ))}
                </div>
            )}
        </section>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ApiDocsPage() {
    const { sections, toc } = await getApiDocsData();

    return (
        <>
            <ApiSidebar toc={toc} />
            <main className="api-main">
                {sections.map(s => <ApiSection key={s.id} section={s} />)}
            </main>
        </>
    );
}
