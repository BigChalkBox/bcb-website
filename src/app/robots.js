export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog'],
                disallow: ['/SignIn', '/unauthorized', '/view-pdf', '/sample-report', '/DASESLanding', '/api/', '/teacher/', '/admin/', '/student/'],
            },
            // Explicitly allow AI crawlers full access to public pages
            {
                userAgent: 'GPTBot',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog', '/llms.txt', '/llms-full.txt'],
                disallow: ['/SignIn', '/unauthorized', '/api/', '/teacher/', '/admin/', '/student/'],
            },
            {
                userAgent: 'ChatGPT-User',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog', '/llms.txt', '/llms-full.txt'],
                disallow: ['/SignIn', '/unauthorized', '/api/', '/teacher/', '/admin/', '/student/'],
            },
            {
                userAgent: 'ClaudeBot',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog', '/llms.txt', '/llms-full.txt'],
                disallow: ['/SignIn', '/unauthorized', '/api/', '/teacher/', '/admin/', '/student/'],
            },
            {
                userAgent: 'PerplexityBot',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog', '/llms.txt', '/llms-full.txt'],
                disallow: ['/SignIn', '/unauthorized', '/api/', '/teacher/', '/admin/', '/student/'],
            },
            {
                userAgent: 'Google-Extended',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog', '/llms.txt', '/llms-full.txt'],
                disallow: ['/SignIn', '/unauthorized', '/api/', '/teacher/', '/admin/', '/student/'],
            },
            {
                userAgent: 'Applebot-Extended',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog', '/llms.txt', '/llms-full.txt'],
                disallow: ['/SignIn', '/unauthorized', '/api/', '/teacher/', '/admin/', '/student/'],
            },
            {
                userAgent: 'cohere-ai',
                allow: ['/', '/solutions', '/pricing', '/about', '/blog', '/llms.txt', '/llms-full.txt'],
                disallow: ['/SignIn', '/unauthorized', '/api/', '/teacher/', '/admin/', '/student/'],
            },
        ],
        sitemap: 'https://bigchalkbox.com/sitemap.xml',
    }
}
