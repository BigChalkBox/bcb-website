// Server wrapper to provide metadata for the 'use client' QP Moderation page
import QPModerationPage from './client-page'

export const metadata = {
    title: 'QP Moderation | AI Question Paper Quality Audit for Indian Universities',
    description:
        "Automated 10-point AI audit for question papers: Bloom's Taxonomy balance, ambiguity detection, out-of-syllabus checker, OR-choice parity, and IQAC-ready moderation reports. Built for Indian universities.",
    alternates: {
        canonical: 'https://bigchalkbox.com/products/qp-moderation',
    },
    openGraph: {
        title: 'QP Moderation | 10-Point AI Question Paper Audit — BigChalkBox',
        description:
            "Flawless exams. Zero manual effort. AI checks Bloom's distribution, ambiguity, syllabus coverage, OR parity, and mark allocation in under 5 minutes.",
        url: 'https://bigchalkbox.com/products/qp-moderation',
        type: 'website',
        images: [
            {
                url: '/logo/og-image.png',
                width: 1200,
                height: 630,
                alt: 'QP Moderation — AI Question Paper Audit by BigChalkBox',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'QP Moderation | AI Question Paper Audit',
        description:
            "10-point AI audit in under 5 minutes. Bloom's analysis, out-of-syllabus detection, and IQAC-ready reports.",
        images: ['/logo/og-image.png'],
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'SoftwareApplication',
            name: 'QP Moderation by BigChalkBox',
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Web Browser',
            url: 'https://bigchalkbox.com/products/qp-moderation',
            description:
                "AI-powered question paper moderation tool. Runs a 10-point audit covering Bloom's Taxonomy balance, ambiguity detection, out-of-syllabus questions, OR-choice difficulty parity, and mark distribution. Generates IQAC-ready PDF reports.",
            brand: { '@type': 'Brand', name: 'BigChalkBox' },
            publisher: {
                '@type': 'Organization',
                name: 'BCBX Innovations Private Limited',
                url: 'https://bigchalkbox.com',
            },
            featureList: [
                "Bloom's Taxonomy level mapping for every question",
                'Ambiguity detection with AI-generated rewrite suggestions',
                'Out-of-syllabus question detection',
                'OR-choice difficulty parity verification',
                'Mark distribution audit',
                'Language quality check',
                'Cognitive diversity scoring',
                'IQAC moderation sign-off PDF report',
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
                    name: 'QP Moderation',
                    item: 'https://bigchalkbox.com/products/qp-moderation',
                },
            ],
        },
        {
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'What format does the question paper need to be in?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'We accept Word documents, PDFs, and plain text. The AI seamlessly identifies question numbers, marks, and stems automatically — no special formatting template required.',
                    },
                },
                {
                    '@type': 'Question',
                    name: "How does the AI know our institution's syllabus?",
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'You simply upload your syllabus document once during onboarding. DASES indexes it and acts as your personalized reference for all future out-of-syllabus checks.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'How long does a moderation run take?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'A standard 10-question paper completes a full 10-point moderation in under 5 minutes, delivering a comprehensive dashboard of insights instantly.',
                    },
                },
            ],
        },
    ],
}

export default function QPModerationServerPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <QPModerationPage />
        </>
    )
}
