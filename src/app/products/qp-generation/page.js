// Server wrapper to provide metadata for the 'use client' Question Paper Generation page
import QPGenerationPage from './client-page'

export const metadata = {
    title: 'Question Paper Generation | AI Question Paper Generator for Indian Universities',
    description:
        "Generate syllabus-perfect, Bloom's-balanced, anti-repeat question papers in seconds. BigChalkBox's QP Generator creates curriculum-aligned exam papers with difficulty control and export-ready formatting.",
    alternates: {
        canonical: 'https://bigchalkbox.com/products/qp-generation',
    },
    openGraph: {
        title: 'Question Paper Generation | AI Question Paper Generator — BigChalkBox',
        description:
            "Syllabus-perfect exams generated in seconds. Define your Bloom's targets, difficulty curve, and anti-repeat rules — get a complete question paper instantly.",
        url: 'https://bigchalkbox.com/products/qp-generation',
        type: 'website',
        images: [
            {
                url: '/logo/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Question Paper Generation — AI Question Paper Generator by BigChalkBox',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Question Paper Generation | AI Question Paper Generator',
        description:
            "Syllabus-aware. Bloom's-balanced. Anti-repeat. Generate complete question papers in seconds.",
        images: ['/logo/og-image.png'],
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'SoftwareApplication',
            name: 'Question Paper Generation by BigChalkBox',
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Web Browser',
            url: 'https://bigchalkbox.com/products/qp-generation',
            description:
                "AI-powered question paper generation tool. Produces syllabus-aligned, Bloom's-balanced, anti-repeat question papers with customizable difficulty curves. Exports to Word, PDF, or plain text with marks and taxonomy tags pre-attached.",
            brand: { '@type': 'Brand', name: 'BigChalkBox' },
            publisher: {
                '@type': 'Organization',
                name: 'BCBX Innovations Private Limited',
                url: 'https://bigchalkbox.com',
            },
            featureList: [
                'Syllabus-aware question generation from uploaded curriculum',
                "Bloom's Taxonomy level control (LOT/HOT ratio)",
                'Anti-repeat engine cross-referencing institutional question bank',
                'Difficulty curve builder (easy/medium/hard ratios)',
                'Export to Word, PDF, or plain text with marks and tags',
                'Human-in-the-loop editing and regeneration',
            ],
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bigchalkbox.com' },
                { '@type': 'ListItem', position: 2, name: 'Solutions', item: 'https://bigchalkbox.com/solutions' },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: 'Question Paper Generation',
                    item: 'https://bigchalkbox.com/products/qp-generation',
                },
            ],
        },
        {
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: "How does the AI know our specific syllabus?",
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'You simply upload your unit-wise syllabus document during setup. The generator maps every topic and ensures questions are drawn proportionately without skipping or over-testing any unit.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Can we control the difficulty level of the paper?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Yes. You can define exact ratios for Easy, Medium, and Hard questions. The AI respects this cognitive load across the entire paper and within specific sections.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'What happens if a question was used last year?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Our Anti-Repeat Engine cross-references your institutional question bank. If a question or a very close variant was used in recent exams, it is automatically excluded.',
                    },
                },
            ],
        },
    ],
}

export default function QPGenerationServerPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <QPGenerationPage />
        </>
    )
}
