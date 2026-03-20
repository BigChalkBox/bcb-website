import LandingPage from '../components/landing/LandingPage'

export const metadata = {
    title: 'DASES | AI-Powered Handwritten Exam Grading: Grade 500 Sheets in Minutes',
    description:
        'DASES is an AI-powered answer sheet checking software that grades handwritten descriptive exams with 98% rubric accuracy. Process 500 sheets in parallel, get per-question feedback in 15 seconds per sheet. Built for universities, schools, and coaching institutes in India.',
    alternates: {
        canonical: 'https://dasesai.com',
    },
    openGraph: {
        title: 'DASES | AI-Powered Handwritten Exam Grading: 98% Accuracy',
        description:
            'Grade handwritten exams with AI in 15 seconds per sheet. 500 sheets in parallel, 98% rubric accuracy, detailed per-question feedback. Used by 20+ educators across Indian universities.',
        url: 'https://dasesai.com',
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
            alternateName: 'Digital Academic Student Evaluation System',
            applicationCategory: 'EducationalApplication',
            applicationSubCategory: 'AI Grading Software',
            operatingSystem: 'Web',
            description:
                'DASES is an AI-powered handwritten exam evaluation platform that grades descriptive answer sheets with 98% rubric accuracy, processes 500 sheets in parallel, and delivers per-question feedback in 15 seconds per sheet. Built for universities, schools, and coaching institutes.',
            url: 'https://dasesai.com',
            screenshot: 'https://dasesai.com/images/landing/dashboard_preview.png',
            featureList: [
                'Handwriting recognition for exam answer sheets',
                'AI rubric generation from model answers',
                'Batch processing of 500 answer sheets in parallel',
                'Per-question written feedback generation',
                'QuickPass™ paper quality analysis',
                'Smart Paper Builder with LaTeX support',
                'Syllabus coverage tracking',
                'Professional branded PDF reports',
                'Student portal for viewing evaluation reports',
                'Criterion-based scoring with partial credit logic',
            ],
            author: {
                '@type': 'Organization',
                name: 'eSun Smart Solutions Pvt. Ltd.',
                url: 'https://dasesai.com',
                email: 'support@esun.solutions',
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
            },
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'INR',
                description: 'Free pilot available for institutions',
            },
        },
        {
            '@type': 'WebSite',
            name: 'DASES',
            alternateName: 'Digital Academic Student Evaluation System',
            url: 'https://dasesai.com',
            description: 'AI-powered handwritten exam evaluation platform for universities and schools.',
        },
        {
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'How accurate is DASES compared to human grading?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'DASES achieves 98% rubric accuracy on handwritten descriptive answers, matching experienced evaluator standards while eliminating subjective bias and inconsistencies across graders.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'How many answer sheets can DASES process at once?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'DASES processes up to 500 sheets in parallel, with each sheet scored in approximately 15 seconds. An entire batch that would take a faculty member days can be completed in minutes.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'How do I get started with DASES?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'It takes less than 10 minutes. Upload your question paper, add model answers, and DASES generates rubrics automatically. From there, just upload student answer sheets and let the AI handle the rest.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Can I customize how DASES grades?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Absolutely. You define the rubric — your criteria, your weights, your standards. DASES adapts to your grading expectations, not the other way around. It also supports multiple valid answer approaches per question.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Is student data secure on DASES?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Yes. All data is encrypted at rest and in transit. Role-based access control ensures students only see their own results, and faculty only access their own papers and submissions. Complete audit trails are maintained.',
                    },
                },
            ],
        },
        {
            '@type': 'HowTo',
            name: 'How to Grade Handwritten Exams with AI Using DASES',
            description: 'Grade handwritten descriptive answer sheets using AI in three simple steps with DASES.',
            totalTime: 'PT10M',
            tool: {
                '@type': 'HowToTool',
                name: 'DASES AI Evaluation Platform',
            },
            step: [
                {
                    '@type': 'HowToStep',
                    position: 1,
                    name: 'Upload & Scan',
                    text: 'Bulk upload scanned answer sheet PDFs from a document scanner or phone camera. DASES accepts standard PDF format.',
                    url: 'https://dasesai.com/#workflow',
                },
                {
                    '@type': 'HowToStep',
                    position: 2,
                    name: 'AI Evaluation',
                    text: 'The DASES AI engine reads handwriting, maps answers to questions, and scores each answer against your faculty-defined rubric with 98% accuracy. Up to 500 sheets processed in parallel.',
                    url: 'https://dasesai.com/#workflow',
                },
                {
                    '@type': 'HowToStep',
                    position: 3,
                    name: 'Review & Publish',
                    text: 'Faculty verify AI-generated scores, download branded PDF reports with per-question feedback, and share detailed results with students through the student portal.',
                    url: 'https://dasesai.com/#workflow',
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
