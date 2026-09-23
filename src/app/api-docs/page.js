import { getApiDocsData } from '@/lib/api-docs';
import ApiSidebar from '@/components/api-docs/ApiSidebar';
import MermaidInit from '@/components/api-docs/MermaidInit';
import CopyDocsButton from '@/components/api-docs/CopyDocsButton';
import ThemeToggle from '@/components/api-docs/ThemeToggle';
import CodeBox from '@/components/api-docs/CodeBox';

export const metadata = {
    title: 'Partner API Reference | BigChalkBox Developers',
    description: 'Complete API Reference and Integration Guide for the BigChalkBox Partner API v1.3.',
};

function ApiSection({ section, index }) {
    const hasCode = section.hasCode;
    
    return (
        <section id={section.id} className={`grid grid-cols-1 ${hasCode ? 'lg:grid-cols-9' : 'lg:grid-cols-5'} gap-8 scroll-mt-24 group relative mb-16`}>
            {/* MIDDLE COLUMN: Prose & Stepper (5 cols) */}
            <div className="col-span-1 lg:col-span-5 relative pl-12 border-l-2 border-[var(--color-gold)]/20">
                
                {/* Floating Step Node Indicator */}
                <span className="absolute -left-[7px] top-2.5 flex h-3 w-3 rounded-full bg-[var(--color-cream)] border-2 border-[var(--color-gold)] group-hover:bg-[var(--color-gold)] transition-colors" aria-hidden="true" />


                <div className="api-prose" dangerouslySetInnerHTML={{ __html: section.proseHtml }} />
            </div>

            {/* RIGHT COLUMN: Code Sandbox (4 cols) */}
            {hasCode && (
                <div className="col-span-1 lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit min-w-0">
                    {section.codeBlocksData.map((block, i) => (
                        block.isMermaid ? (
                            <div key={i} className="rounded-xl bg-[var(--color-cream-dark)] border border-[var(--color-border)] overflow-hidden shadow-xl min-w-0" dangerouslySetInnerHTML={{ __html: block.html }} />
                        ) : (
                            <CodeBox key={i} block={block} />
                        )
                    ))}
                </div>
            )}
        </section>
    );
}

export default async function ApiDocsPage() {
    const { sections, toc } = await getApiDocsData();

    return (
        <div className="min-h-screen bg-[var(--color-cream)] text-[var(--color-ink)] font-sans antialiased selection:bg-[var(--color-gold)] selection:text-white transition-colors duration-200">
            {/* Topbar inside the dark theme wrapper */}
            <header className="sticky top-0 z-50 flex items-center h-14 px-6 border-b border-[var(--color-border)] bg-[var(--color-cream)]/90 backdrop-blur-md transition-colors duration-200">
                <a href="/" className="font-bold text-base flex items-center gap-2" style={{ textDecoration: 'none' }}>
                    <img src="/logo_new/logo.png" alt="BigChalkBox Icon" style={{ height: '28px', width: 'auto' }} />
                    <span style={{ fontFamily: "'Amaranth', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                        <span style={{ color: 'var(--color-gold)' }}>Big</span>Chalk<span style={{ color: 'var(--color-gold)' }}>Box</span>
                    </span>
                    <span style={{ color: 'var(--color-slate)', marginLeft: '4px', marginRight: '4px' }}>/</span>
                    <span className="text-[var(--color-slate)] font-mono font-semibold">Developers</span>
                </a>
                <div className="ml-4 px-2 py-0.5 text-xs font-mono rounded bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/20">v1.3</div>
                <div className="ml-auto flex items-center gap-4">
                    <ThemeToggle />
                    <CopyDocsButton />
                    <a href="/partner-api-openapi.json" className="text-sm font-medium text-[var(--color-gold)] hover:text-[var(--color-gold-light)]">Download OpenAPI</a>
                </div>
            </header>

            {/* Outer Wrapper: 3-Column API Layout */}
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 py-12">
                
                {/* LEFT COLUMN: Sticky Navigation Panel (3 Cols) */}
                <div className="hidden lg:block lg:col-span-3 border-r border-[var(--color-border)] pr-6">
                    <div className="sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto">
                        <ApiSidebar toc={toc} />
                    </div>
                </div>

                {/* MAIN CONTENT WRAPPER (9 Cols remaining) */}
                <div className="col-span-1 lg:col-span-9">
                    {sections.map((s, idx) => (
                        <ApiSection key={s.id} section={s} index={idx} />
                    ))}
                </div>

            </div>
            <MermaidInit />
        </div>
    );
}
