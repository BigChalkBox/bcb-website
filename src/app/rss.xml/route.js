import { articles } from '../blog/articles';

export const dynamic = 'force-static';

export async function GET() {
    const baseUrl = 'https://bigchalkbox.com';
    const siteTitle = 'BigChalkBox Blog';
    const siteDescription = 'AI-powered academic examination suite for Indian universities and colleges.';

    // XML escape function to prevent broken RSS feeds from special characters
    const escapeXml = (unsafe) => {
        if (!unsafe) return '';
        return unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case "'": return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    };

    const feedItems = articles
        .map((article) => {
            const url = `${baseUrl}/blog/${article.slug}`;
            // RSS requires RFC-822 date format, standard JS Date handles toUTCString reasonably well
            const date = new Date(article.publishedAt).toUTCString();
            
            return `
        <item>
            <title>${escapeXml(article.title)}</title>
            <link>${url}</link>
            <guid isPermaLink="true">${url}</guid>
            <pubDate>${date}</pubDate>
            <description>${escapeXml(article.description)}</description>
            ${article.author && article.author.name ? `<author>admin.dasesai@gmail.com (${escapeXml(article.author.name)})</author>` : ''}
        </item>`;
        })
        .join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${escapeXml(siteTitle)}</title>
        <link>${baseUrl}</link>
        <description>${escapeXml(siteDescription)}</description>
        <language>en-in</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
        ${feedItems}
    </channel>
</rss>`;

    return new Response(rss, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
        },
    });
}
