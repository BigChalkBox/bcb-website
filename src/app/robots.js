export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/solutions', '/pricing', '/about'],
                disallow: ['/SignIn', '/unauthorized', '/view-pdf', '/sample-report', '/DASESLanding', '/api/'],
            },
        ],
        sitemap: 'https://dases.in/sitemap.xml',
    }
}
