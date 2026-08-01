import DASESLanding from '../../../components/products/DASESLanding'

export const metadata = {
    title: 'DASES | AI-Powered Handwritten Answer Sheet Evaluation for Indian Universities',
    description: 'DASES by BigChalkBox reads handwritten student exams, scores against your rubric, and delivers detailed per-question feedback. 98% accuracy. 500 sheets in parallel. Built for India.',
    alternates: {
        canonical: 'https://bigchalkbox.com/products/dases',
    },
    openGraph: {
        title: 'DASES | Automated Handwritten Exam Evaluation — BigChalkBox',
        description: 'AI reads student handwriting, scores each answer against your rubric, and generates written feedback per question. 98% accuracy. Free demo available.',
        url: 'https://bigchalkbox.com/products/dases',
        type: 'website',
        images: [
            {
                url: '/logo/og-image.png',
                width: 1200,
                height: 630,
                alt: 'DASES — AI Handwritten Exam Evaluation by BigChalkBox',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DASES | AI Answer Sheet Evaluation for Indian Universities',
        description: 'Grade 500 handwritten answer sheets in parallel. 98% rubric accuracy. Per-question feedback for every student.',
        images: ['/logo/og-image.png'],
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'SoftwareApplication',
            '@id': 'https://bigchalkbox.com/products/dases#software',
            name: 'DASES (Digital Academic Student Evaluation System)',
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Web Browser',
            url: 'https://bigchalkbox.com/products/dases',
            description: 'AI-powered handwritten answer sheet evaluation. Reads student handwriting, scores against faculty rubrics, and generates per-question written feedback. 98% rubric accuracy. 500 sheets in parallel.',
            brand: {
                '@type': 'Brand',
                name: 'BigChalkBox',
            },
            publisher: {
                '@type': 'Organization',
                name: 'BCBX Innovations Private Limited',
                url: 'https://bigchalkbox.com',
            },
            featureList: [
                'AI handwriting recognition for exam answer sheets',
                'Criterion-based rubric evaluation with 98% accuracy',
                'Processes 500 sheets in parallel — 15 seconds per sheet',
                'Per-question, per-criterion written feedback generation',
                'AI rubric generation from model answers',
                'QuickPass™ pre-exam paper quality analysis',
                'Branded PDF student reports',
                'Syllabus coverage tracking',
                'Student portal for result access',
            ],
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '47',
                bestRating: '5',
                worstRating: '1',
            },
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'INR',
                description: 'Free institutional pilot available. Contact for custom institutional pricing.',
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
                    name: 'Products',
                    item: 'https://bigchalkbox.com/solutions',
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: 'DASES',
                    item: 'https://bigchalkbox.com/products/dases',
                },
            ],
        },
    ],
}

export default function DasesPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <DASESLanding />
        </>
    )
}
