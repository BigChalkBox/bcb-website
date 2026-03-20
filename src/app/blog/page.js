import BlogPage from '../../components/blog/BlogPage'
import { articles } from './articles'

export const metadata = {
    title: 'Blog | AI Grading Insights, Guides & Research',
    description:
        'Expert insights on AI-powered exam grading, handwriting recognition, rubric-based evaluation, and automated descriptive answer checking. By the team building DASES.',
    alternates: {
        canonical: 'https://dasesai.com/blog',
    },
    openGraph: {
        title: 'DASES Blog | AI Grading Insights & Guides',
        description:
            'Expert insights on AI exam grading, handwriting recognition, and rubric-based evaluation from the team building DASES.',
        url: 'https://dasesai.com/blog',
        type: 'website',
    },
    twitter: {
        title: 'DASES Blog | AI Grading Insights & Research',
        description:
            'Guides, comparisons, and research on AI-powered exam grading by DASES.',
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'CollectionPage',
            name: 'DASES Blog',
            description:
                'Expert insights on AI-powered exam grading, handwriting recognition, rubric-based evaluation, and automated descriptive answer checking.',
            url: 'https://dasesai.com/blog',
            isPartOf: {
                '@type': 'WebSite',
                name: 'DASES',
                url: 'https://dasesai.com',
            },
            about: {
                '@type': 'Thing',
                name: 'AI-Powered Exam Grading',
            },
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://dasesai.com',
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Blog',
                    item: 'https://dasesai.com/blog',
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
