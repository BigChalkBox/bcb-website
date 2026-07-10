import PricingPage from '../../components/pricing/PricingPage'

export const metadata = {
    title: 'Pricing | Starter, Growth & Institution Packages',
    description:
        'Pick the DASES package that fits: Starter (200 sheets/mo), Growth (2,000 sheets/mo), or Institution (unlimited). AI rubric engine, QuickPass™ analysis, student portal, and more.',
    alternates: {
        canonical: 'https://bigchalkbox.com/pricing',
    },
    openGraph: {
        title: 'DASES Pricing | AI Evaluation Packages for Every Institution',
        description:
            'Three packages, each with a clear set of AI evaluation solutions. Start with a free pilot, scale as you grow.',
        url: 'https://bigchalkbox.com/pricing',
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
    '@graph': [
        {
            '@type': 'Product',
            name: 'DASES AI Evaluation Platform',
            description:
                'AI-powered handwritten exam evaluation platform with modular pricing for institutions of all sizes.',
            brand: {
                '@type': 'Brand',
                name: 'DASES',
            },
            url: 'https://bigchalkbox.com/pricing',
            offers: [
                {
                    '@type': 'Offer',
                    name: 'Starter Package',
                    description:
                        'Up to 200 sheets per month. Includes Smart Paper Builder, AI Rubric Engine, AI Evaluation, and PDF Reports.',
                    priceCurrency: 'INR',
                    availability: 'https://schema.org/InStock',
                    url: 'https://bigchalkbox.com/pricing',
                },
                {
                    '@type': 'Offer',
                    name: 'Growth Package',
                    description:
                        'Up to 2,000 sheets per month. Includes everything in Starter plus QuickPass™ Paper Analysis, Student Portal, and Analytics Dashboard.',
                    priceCurrency: 'INR',
                    availability: 'https://schema.org/InStock',
                    url: 'https://bigchalkbox.com/pricing',
                },
                {
                    '@type': 'Offer',
                    name: 'Institution Package',
                    description:
                        'Unlimited sheets. Includes everything in Growth plus multi-department management, priority support, and custom integrations.',
                    priceCurrency: 'INR',
                    availability: 'https://schema.org/InStock',
                    url: 'https://bigchalkbox.com/pricing',
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
                    name: 'Pricing',
                    item: 'https://bigchalkbox.com/pricing',
                },
            ],
        },
    ],
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
