import BlogPage from '../../components/blog/BlogPage'
import { articles } from './articles'

export const metadata = {
    title: 'Blog | AI Exam Grading Insights, Guides & Research | BigChalkBox',
    description:
        'Expert insights on AI-powered exam grading, handwriting recognition, rubric-based evaluation, and automated descriptive answer checking. By the team at BigChalkBox.',
    alternates: {
        canonical: 'https://bigchalkbox.com/blog',
    },
    openGraph: {
        title: 'BigChalkBox Blog | AI Exam Grading Insights & Guides',
        description:
            'Expert insights on AI exam grading, handwriting recognition, and rubric-based evaluation from the team at BigChalkBox.',
        url: 'https://bigchalkbox.com/blog',
        type: 'website',
        images: [
            {
                url: '/logo/og-image.png',
                width: 1200,
                height: 630,
                alt: 'BigChalkBox Blog — AI Exam Grading Insights',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'BigChalkBox Blog | AI Grading Insights & Research',
        description:
            'Guides, comparisons, and research on AI-powered exam grading by BigChalkBox.',
        images: ['/logo/og-image.png'],
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'CollectionPage',
            name: 'BigChalkBox Blog',
            description:
                'Expert insights on AI-powered exam grading, handwriting recognition, rubric-based evaluation, and automated descriptive answer checking.',
            url: 'https://bigchalkbox.com/blog',
            isPartOf: {
                '@type': 'WebSite',
                name: 'BigChalkBox',
                url: 'https://bigchalkbox.com',
            },
            author: {
                '@type': 'Organization',
                name: 'BCBX Innovations Private Limited',
                url: 'https://bigchalkbox.com',
            },
            about: {
                '@type': 'Thing',
                name: 'AI-Powered Exam Grading for Indian Universities',
            },
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://bigchalkbox.com',
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Blog',
                    item: 'https://bigchalkbox.com/blog',
                },
            ],
        },
    ],
}

export default function Blog() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BlogPage articles={articles} />
        </>
    )
}
