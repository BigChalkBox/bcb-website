import LandingPage from '../components/landing/LandingPage'

export const metadata = {
    title: 'BigChalkBox | AI Examination Suite for Indian Universities — DASES, QP Moderation & More',
    description:
        'BigChalkBox automates answer sheet grading, question paper moderation, and exam content creation for Indian universities. Grade 500 sheets in 15 minutes. Book a Free Demo.',
    keywords: [
        'AI answer sheet checking India',
        'automated answer evaluation software',
        'question paper moderation software India',
        'Bloom\'s Taxonomy question paper checker',
        'AI question paper generation',
        'university exam automation India',
        'DASES answer sheet evaluation',
        'NAAC exam quality improvement',
        'IQAC digital tools',
        'EdTech for universities India',
        'BigChalkBox',
        'handwritten answer sheet OCR',
        'descriptive answer grading AI',
    ],
    alternates: {
        canonical: 'https://bigchalkbox.com',
    },
    openGraph: {
        title: 'BigChalkBox | AI Examination Suite for Indian Universities',
        description:
            'Grade 500 answer sheets in 15 minutes. AI-powered answer sheet evaluation, question paper moderation, and exam content creation for Indian universities.',
        url: 'https://bigchalkbox.com',
        type: 'website',
        images: [
            {
                url: '/logo/og-image.png',
                width: 1200,
                height: 630,
                alt: 'BigChalkBox — AI Academic Operations Suite for Indian Universities',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'BigChalkBox | AI Examination Suite for Indian Universities',
        description:
            'Grade 500 answer sheets in 15 minutes. Automate QP moderation, answer evaluation & exam content with AI built for Indian academia.',
        images: ['/logo/og-image.png'],
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            '@id': 'https://bigchalkbox.com/#organization',
            name: 'BCBX Innovations Private Limited',
            alternateName: 'BigChalkBox',
            url: 'https://bigchalkbox.com',
            logo: {
                '@type': 'ImageObject',
                url: 'https://bigchalkbox.com/logo/logo.png',
                width: 600,
                height: 600,
            },
            description:
                'BCBX Innovations Private Limited develops AI software for Indian educational institutions. Products include DASES (automated handwritten answer sheet evaluation), QP Moderation, QP Generation, Teacher Notes, and Exam Prep. Used by 20+ educators across Indian universities.',
            email: 'admin.dasesai@gmail.com',
            telephone: '+917529836117',
            foundingDate: '2024',
            address: {
                '@type': 'PostalAddress',
                addressCountry: 'IN',
            },
            areaServed: {
                '@type': 'Country',
                name: 'India',
            },
            sameAs: [
                'https://linkedin.com/company/bigchalkbox',
                'https://youtube.com/@bigchalkbox_ai',
            ],
        },
        {
            '@type': 'WebSite',
            '@id': 'https://bigchalkbox.com/#website',
            name: 'BigChalkBox',
            url: 'https://bigchalkbox.com',
            publisher: { '@id': 'https://bigchalkbox.com/#organization' },
            description: 'AI-powered academic examination suite for Indian universities and colleges.',
        },
        {
            '@type': 'SoftwareApplication',
            '@id': 'https://bigchalkbox.com/#software',
            name: 'BigChalkBox Academic Suite',
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Web Browser',
            url: 'https://bigchalkbox.com',
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'INR',
                description: 'Free institutional demo available. Contact for custom institutional pricing.',
            },
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '47',
                bestRating: '5',
                worstRating: '1',
            },
            review: [
                {
                    '@type': 'Review',
                    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
                    author: { '@type': 'Person', name: 'Dr. Priya Sharma' },
                    reviewBody: 'BigChalkBox reduced our grading time by over 85%. What used to take our department a week now takes hours. The per-question feedback is genuinely more detailed than what our faculty write manually.',
                },
                {
                    '@type': 'Review',
                    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
                    author: { '@type': 'Person', name: 'Prof. Arun Menon' },
                    reviewBody: 'The QP Moderation tool caught three out-of-syllabus questions and two ambiguous wordings that our committee had missed. The Bloom\'s Taxonomy analysis alone is worth it for NAAC compliance.',
                },
                {
                    '@type': 'Review',
                    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
                    author: { '@type': 'Person', name: 'Kavitha R., HOD' },
                    reviewBody: 'DASES handled our 300-student end-semester exam in under 30 minutes. The accuracy was remarkable — we only had to override 4 answers out of 3,000 evaluations.',
                },
                {
                    '@type': 'Review',
                    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
                    author: { '@type': 'Person', name: 'Sanjay Kulkarni' },
                    reviewBody: 'Students actually appreciate the detailed feedback now. For the first time they understand exactly why marks were deducted — not just a score on a paper.',
                },
                {
                    '@type': 'Review',
                    reviewRating: { '@type': 'Rating', ratingValue: '4', bestRating: '5' },
                    author: { '@type': 'Person', name: 'Dr. Meena Iyer' },
                    reviewBody: 'Excellent platform. The handwriting recognition handles even difficult scripts well. Setup takes a little learning but the support team is very responsive.',
                },
            ],
            featureList: [
                'AI-powered handwritten answer sheet evaluation',
                'Question paper quality moderation with Bloom\'s Taxonomy analysis',
                'Automated question paper generation',
                'Teacher notes and PPT generation',
                'Student exam preparation content',
                'NAAC and IQAC compliance reporting',
            ],
        },
        {
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'What is AI-powered answer sheet evaluation?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'AI-powered answer sheet evaluation uses computer vision and large language models to read handwritten descriptive answers and compare them against a teacher\'s rubric. DASES by BigChalkBox processes handwritten scripts using multimodal AI — it understands the semantic meaning of each answer, not just keyword matching. This enables accurate, objective grades with per-question feedback in seconds per sheet.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'How does BigChalkBox ensure question paper quality?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'BigChalkBox\'s QP Moderation module runs a 10-point AI audit on every question paper. It checks for Bloom\'s Taxonomy balance, ambiguous phrasing, OR-choice difficulty parity, syllabus coverage gaps, out-of-syllabus questions, marks-vs-effort alignment, duplicate questions, and more. Each flagged issue comes with an AI-suggested rewrite.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Is BigChalkBox compliant with NAAC and IQAC requirements?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Yes. BigChalkBox is built for the Indian university ecosystem, including NAAC, IQAC, and NBA compliance frameworks. The QP Moderation module\'s Bloom\'s Taxonomy mapping directly supports Learning Outcome Based Education (LOBE) requirements. All data is processed with role-based access controls, and student data is never shared with third-party AI providers.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Which types of institutions can use BigChalkBox?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'BigChalkBox serves autonomous universities, deemed-to-be universities, affiliated colleges, engineering and technical institutions, B-Schools, and state boards across India. The platform supports custom configurations for any examination format, syllabus structure, or grading scheme.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'How much does it cost to implement AI examination software?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'BigChalkBox offers flexible institutional pricing based on modules selected and scale of deployment. We start with a free pilot program for qualifying institutions so you can see real results before any commitment. Contact us at admin.dasesai@gmail.com for a custom quote.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Can BigChalkBox integrate with existing University ERP systems?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'BigChalkBox supports data exchange via structured exports (Excel, PDF, CSV) compatible with most Indian university ERP and SIS systems. Full API integration is available on the Enterprise plan.',
                    },
                },
            ],
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'BigChalkBox',
                    item: 'https://bigchalkbox.com',
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
