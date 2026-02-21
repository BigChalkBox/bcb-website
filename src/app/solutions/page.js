import SolutionsPage from '../../components/solutions/SolutionsPage'

export const metadata = {
    title: 'Solutions | AI Exam Grading, Rubric Generation & Automated Assessment',
    description:
        'Automate your entire exam workflow — question paper creation, AI rubric generation, handwritten answer evaluation at 98% accuracy, and detailed student feedback reports. Grade 500 sheets in parallel.',
    alternates: {
        canonical: 'https://dasesai.com/solutions',
    },
    openGraph: {
        title: 'DASES Solutions | End-to-End AI Exam Automation',
        description:
            'From paper creation to evaluation reports — automate every step of the exam lifecycle with AI. 98% rubric accuracy on handwritten answers.',
        url: 'https://dasesai.com/solutions',
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
    '@type': 'WebPage',
    name: 'DASES Solutions',
    description:
        'End-to-end AI-powered exam automation — paper creation, rubric generation, handwritten evaluation, and professional reports.',
    url: 'https://dasesai.com/solutions',
    isPartOf: {
        '@type': 'WebSite',
        name: 'DASES',
        url: 'https://dasesai.com',
    },
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
