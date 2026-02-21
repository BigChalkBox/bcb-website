import PricingPage from '../../components/pricing/PricingPage'

export const metadata = {
    title: 'Pricing | Starter, Growth & Institution Packages',
    description:
        'Pick the DASES package that fits — Starter (200 sheets/mo), Growth (2,000 sheets/mo), or Institution (unlimited). AI rubric engine, QuickPass™ analysis, student portal, and more.',
    alternates: {
        canonical: 'https://dasesai.com/pricing',
    },
    openGraph: {
        title: 'DASES Pricing | AI Evaluation Packages for Every Institution',
        description:
            'Three packages, each with a clear set of AI evaluation solutions. Start with a free pilot, scale as you grow.',
        url: 'https://dasesai.com/pricing',
        type: 'website',
    },
    twitter: {
        title: 'DASES Pricing | Starter • Growth • Institution',
        description:
            'Modular AI evaluation from 200 to unlimited sheets/month. Paper builder, rubric engine, evaluation, reports, analytics.',
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'DASES Pricing',
    description:
        'Modular AI evaluation packages — Starter, Growth, and Institution.',
    url: 'https://dasesai.com/pricing',
    isPartOf: {
        '@type': 'WebSite',
        name: 'DASES',
        url: 'https://dasesai.com',
    },
}

export default function Pricing() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PricingPage />
        </>
    )
}
