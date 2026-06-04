import AboutPage from '../../components/about/AboutPage'

export const metadata = {
    title: 'About | AI-Powered Exam Evaluation by Big Chalk Box Pvt. Ltd.',
    description:
        'DASES is built by Big Chalk Box Pvt. Ltd., solving the hardest problems in academic assessment. 98% rubric accuracy on handwritten answers, 400+ sheets evaluated, 20+ educators onboard.',
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: 'https://dasesai.com/about',
        title: 'About DASES | Built by Big Chalk Box Pvt. Ltd.',
        description:
            'A team of engineers and educators transforming descriptive grading. Learn how DASES achieves 98% accuracy on handwritten exams.',
        siteName: 'DASES',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About DASES | Big Chalk Box Pvt. Ltd.',
        description:
            '400+ sheets evaluated • 98% accuracy • 20+ educators. Built by Big Chalk Box Pvt. Ltd. in India.',
    },
    alternates: {
        canonical: 'https://dasesai.com/about',
    },
    authors: [
        {
            name: 'Big Chalk Box Pvt. Ltd.',
            url: 'https://dasesai.com',
            email: 'support@esun.solutions',
        },
    ],
    summary:
        'Big Chalk Box Pvt. Ltd. builds DASES, an AI-powered platform for evaluating handwritten descriptive answer sheets with 98% rubric accuracy.',
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            name: 'Big Chalk Box Pvt. Ltd.',
            url: 'https://dasesai.com',
            email: 'support@esun.solutions',
            telephone: '+917529836117',
            description:
                'Big Chalk Box Pvt. Ltd. builds DASES, an AI-powered platform for evaluating handwritten descriptive answer sheets with 98% rubric accuracy. Based in India, the team of engineers and educators is solving the hardest problems in academic assessment.',
            address: {
                '@type': 'PostalAddress',
                addressCountry: 'IN',
            },
            foundingDate: '2024',
            areaServed: {
                '@type': 'Country',
                name: 'India',
            },
            sameAs: [],
            makesOffer: {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'SoftwareApplication',
                    name: 'DASES',
                    alternateName: 'Digital Academic Student Evaluation System',
                    applicationCategory: 'EducationalApplication',
                    operatingSystem: 'Web',
                    description:
                        'AI-powered handwritten exam evaluation platform with 98% rubric accuracy. Processes 500 sheets in parallel with per-question feedback.',
                },
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
                    name: 'About',
                    item: 'https://dasesai.com/about',
                },
            ],
        },
    ],
}

export default function About() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <AboutPage />
        </>
    )
}
