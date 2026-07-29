import PricingPage from '../../components/pricing/PricingPage'

export const metadata = {
    title: 'Pricing | BigChalkBox Assessment Suite',
    description:
        'Transparent pricing for Question Paper Generation, Moderation, and AI Evaluation. Start generating papers at ₹400 + GST.',
    alternates: {
        canonical: 'https://bigchalkbox.com/pricing',
    },
    openGraph: {
        title: 'BigChalkBox Pricing | AI Evaluation Packages for Every Institution',
        description:
            'Modular pricing for question paper generation, moderation, and automated evaluation.',
        url: 'https://bigchalkbox.com/pricing',
        type: 'website',
    },
    twitter: {
        title: 'BigChalkBox Pricing | AI Assessment Suite',
        description:
            'Transparent pricing for question paper generation, moderation, and AI evaluation.',
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Product',
            name: 'BigChalkBox AI Assessment Suite',
            description:
                'AI-powered handwritten exam evaluation platform and question paper generation suite.',
            brand: {
                '@type': 'Brand',
                name: 'BigChalkBox',
            },
            url: 'https://bigchalkbox.com/pricing',
            offers: [
                {
                    '@type': 'Offer',
                    name: 'Question Paper Moderation',
                    description:
                        'Automated quality audits for your question papers before sign-off.',
                    priceCurrency: 'INR',
                    price: '400',
                    availability: 'https://schema.org/InStock',
                    url: 'https://bigchalkbox.com/pricing',
                },
                {
                    '@type': 'Offer',
                    name: 'Question Paper Generation',
                    description:
                        'Instantly create curriculum-aligned question papers.',
                    priceCurrency: 'INR',
                    price: '400',
                    availability: 'https://schema.org/InStock',
                    url: 'https://bigchalkbox.com/pricing',
                },
                {
                    '@type': 'Offer',
                    name: 'Evaluation Module',
                    description:
                        'Automated AI evaluation for handwritten assessments.',
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
