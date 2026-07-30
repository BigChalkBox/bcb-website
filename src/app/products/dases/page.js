import DASESLanding from '../../../components/products/DASESLanding'

export const metadata = {
    title: 'DASES | Descriptive Answer Sheet Evaluation System by BigChalkBox',
    description: 'AI-powered descriptive answer evaluation that reads handwriting, scores against your rubric, and delivers detailed per-question feedback.',
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'Product'],
    name: 'DASES (Digital Academic Student Evaluation System)',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    url: 'https://bigchalkbox.com/products/dases',
    description: 'AI-powered descriptive answer evaluation that reads handwriting, scores against your rubric, and delivers detailed per-question feedback.',
    brand: {
        '@type': 'Brand',
        name: 'BigChalkBox'
    },
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        description: 'Contact for custom institutional pricing.',
    }
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
