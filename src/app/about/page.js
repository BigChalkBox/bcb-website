import AboutPage from '../../components/about/AboutPage'

export const metadata = {
    title: 'About | Big Chalk Box Pvt. Ltd.',
    description:
        'Big Chalk Box Pvt. Ltd. is an EdTech engineering company solving the hardest, most tedious problems in education so teachers can get back to teaching.',
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: 'https://bigchalkbox.com/about',
        title: 'About | Big Chalk Box Pvt. Ltd.',
        description:
            'An EdTech engineering company building deep-tech solutions for educators. Makers of DASES.',
        siteName: 'Big Chalk Box',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About | Big Chalk Box Pvt. Ltd.',
        description:
            'Solving the hardest problems in education. Makers of DASES.',
    },
    alternates: {
        canonical: 'https://bigchalkbox.com/about',
    },
    authors: [
        {
            name: 'Big Chalk Box Pvt. Ltd.',
            url: 'https://bigchalkbox.com',
            email: 'admin.dasesai@gmail.com',
        },
    ],
    summary:
        'Big Chalk Box Pvt. Ltd. is an EdTech engineering company building deep-tech solutions to automate the most grueling parts of an educator\'s job.',
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            name: 'Big Chalk Box Pvt. Ltd.',
            url: 'https://bigchalkbox.com',
            email: 'admin.dasesai@gmail.com',
            telephone: '+917529836117',
            description:
                'Big Chalk Box Pvt. Ltd. is an EdTech engineering company building deep-tech solutions to automate the most grueling parts of an educator\'s job. Based in India, our flagship product is DASES.',
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
                    item: 'https://bigchalkbox.com',
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'About',
                    item: 'https://bigchalkbox.com/about',
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
