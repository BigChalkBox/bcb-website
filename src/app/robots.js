export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog'],
                disallow: ['/sample-report', '/DASESLanding'],
            },
            // Explicitly allow AI crawlers full access to public pages
            {
                userAgent: 'GPTBot',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog', '/llms.txt', '/llms-full.txt'],
            },
            {
                userAgent: 'ChatGPT-User',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog', '/llms.txt', '/llms-full.txt'],
            },
            {
                userAgent: 'ClaudeBot',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog', '/llms.txt', '/llms-full.txt'],
            },
            {
                userAgent: 'PerplexityBot',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog', '/llms.txt', '/llms-full.txt'],
            },
            {
                userAgent: 'Google-Extended',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog', '/llms.txt', '/llms-full.txt'],
            },
            {
                userAgent: 'Applebot-Extended',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog', '/llms.txt', '/llms-full.txt'],
            },
            {
                userAgent: 'cohere-ai',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog', '/llms.txt', '/llms-full.txt'],
            },
        ],
        sitemap: 'https://bigchalkbox.com/sitemap.xml',
    }
}
