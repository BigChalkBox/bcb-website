import SolutionsPage from '../../components/solutions/SolutionsPage'

export const metadata = {
    title: 'Solutions | AI Exam Grading, Rubric Generation & Automated Assessment',
    description:
        'Automate your entire exam workflow: question paper creation, AI rubric generation, handwritten answer evaluation at 98% accuracy, and detailed student feedback reports. Grade 500 sheets in parallel.',
    alternates: {
        canonical: 'https://bigchalkbox.com/solutions',
    },
    openGraph: {
        title: 'DASES Solutions | End-to-End AI Exam Automation',
        description:
            'From paper creation to evaluation reports: automate every step of the exam lifecycle with AI. 98% rubric accuracy on handwritten answers.',
        url: 'https://bigchalkbox.com/solutions',
        type: 'website',
    },
    twitter: {
        title: 'DASES Solutions | AI Exam Grading & Rubric Generation',
        description:
            'Paper creation → Rubric generation → AI evaluation → Reports. 500 sheets in 15 seconds each.',
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'ItemList',
            name: 'DASES AI Exam Solutions',
            description:
                'Complete suite of AI-powered exam automation solutions for universities and schools.',
            url: 'https://bigchalkbox.com/solutions',
            numberOfItems: 6,
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Handwriting Intelligence',
                    description:
                        'Reads and understands handwritten student responses, including diagrams, equations, and margin notes, with 98% accuracy.',
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Smart Paper Builder',
                    description:
                        'Create question papers with LaTeX/math support, image attachments, OR-question pairing, and automatic OCR extraction from existing paper PDFs.',
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: 'AI Rubric Engine',
                    description:
                        'Provide model answers and DASES generates detailed criterion-based rubrics with customizable weights. Supports multiple valid answer approaches per question.',
                },
                {
                    '@type': 'ListItem',
                    position: 4,
                    name: 'QuickPass™ Paper Analysis',
                    description:
                        'AI-powered paper quality check that detects ambiguous questions, difficulty-marks misalignment, duplicate questions, and OR pair imbalance before the exam.',
                },
                {
                    '@type': 'ListItem',
                    position: 5,
                    name: 'Parallel AI Evaluation',
                    description:
                        'Upload up to 500 scanned answer sheets at once. AI processes them in parallel with each sheet scored in approximately 15 seconds.',
                },
                {
                    '@type': 'ListItem',
                    position: 6,
                    name: 'Professional Reports & Student Portal',
                    description:
                        'Interactive web reports with criterion-level breakdowns, downloadable branded PDF reports, and student portal for viewing detailed evaluation results.',
                },
            ],
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
                    name: 'Solutions',
                    item: 'https://bigchalkbox.com/solutions',
                },
            ],
        },
    ],
}

export default function Solutions() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <SolutionsPage />
        </>
    )
}
