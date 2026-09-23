import { getApiDocsData } from '@/lib/api-docs';
import ApiSidebar from '@/components/api-docs/ApiSidebar';
import MarkdownRenderer from '@/components/api-docs/MarkdownRenderer';

export const metadata = {
    title: 'Partner API Reference | BigChalkBox',
    description:
        'Complete API Reference and Integration Guide for the BigChalkBox Partner API v1.3.',
};

export default async function ApiDocsPage() {
    // Server component: reads and parses both markdown files at request time.
    // Every single line of partner-api-integration-guide.md (585 lines) and
    // partner-api-reference.md (1778 lines) flows through getApiDocsData()
    // untouched — nothing is filtered, truncated, or re-ordered.
    const { htmlContent, toc } = await getApiDocsData();

    return (
        <>
            {/* Left sidebar with ScrollSpy ToC (Client Component) */}
            <ApiSidebar toc={toc} />

            {/* Main content (Server-rendered HTML, animated on client) */}
            <main>
                <MarkdownRenderer htmlContent={htmlContent} />
            </main>
        </>
    );
}
