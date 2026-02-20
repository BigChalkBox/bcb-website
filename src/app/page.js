import LandingPage from '../components/landing/LandingPage'

export const metadata = {
    title: 'DASES | AI-Powered Handwritten Exam Grading — 98% Accuracy, 15s Per Sheet',
    description:
        'Grade 500 handwritten answer sheets in parallel with AI that reads handwriting, scores against your rubric, and delivers per-question feedback. 98% accuracy. Built for universities.',
    alternates: {
        canonical: 'https://dases.in',
    },
    openGraph: {
        title: 'DASES | AI-Powered Handwritten Exam Grading — 98% Accuracy',
        description:
            'Grade handwritten exams with AI in 15 seconds per sheet. 500 sheets in parallel, 98% rubric accuracy, detailed per-question feedback.',
        url: 'https://dases.in',
        type: 'website',
    },
    twitter: {
        title: 'DASES | Grade Handwritten Exams in Minutes, Not Days',
        description:
            '500 sheets in parallel • 98% accuracy • 15s per sheet • Per-question feedback. AI-powered exam grading for universities.',
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'SoftwareApplication',
            name: 'DASES',
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Web',
            description:
                'AI-powered handwritten exam evaluation platform that grades descriptive answer sheets with 98% rubric accuracy, processes 500 sheets in parallel, and delivers per-question feedback in 15 seconds per sheet.',
            url: 'https://dases.in',
            author: {
                '@type': 'Organization',
                name: 'eSun Smart Solutions Pvt. Ltd.',
                url: 'https://eSun.solutions',
                email: 'support@esun.solutions',
                telephone: '+917529836117',
                address: {
                    '@type': 'PostalAddress',
                    addressCountry: 'IN',
                },
            },
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'INR',
                description: 'Free pilot available',
            },
        },
        {
            '@type': 'WebSite',
            name: 'DASES',
            url: 'https://dases.in',
        },
        {
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'How accurate is DASES compared to human grading?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'DASES achieves 98% rubric accuracy on handwritten descriptive answers, verified across 400+ evaluated sheets.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'How many answer sheets can DASES process at once?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'DASES processes up to 500 answer sheets in parallel, with each sheet evaluated in approximately 15 seconds.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'How do I get started with DASES?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Upload your question paper, add model answers, and DASES generates rubrics automatically. Then upload student answer sheets and get results in minutes.',
                    },
                },
            ],
        },
    ],
}

export default function Home() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <LandingPage />
        </>
    )
}
