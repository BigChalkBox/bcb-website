import AboutPage from '../../components/about/AboutPage'

export const metadata = {
    title: 'About | BCBX Innovations Private Limited — BigChalkBox',
    description:
        'BCBX Innovations Private Limited is an EdTech engineering company solving the hardest, most tedious problems in education so teachers can get back to teaching. Makers of BigChalkBox — AI examination suite for Indian universities.',
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: 'https://bigchalkbox.com/about',
        title: 'About | BCBX Innovations Private Limited',
        description:
            'An EdTech engineering company building deep-tech solutions for educators across India. Makers of BigChalkBox.',
        siteName: 'BigChalkBox',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About | BCBX Innovations Private Limited',
        description:
            'Solving the hardest problems in Indian education. Makers of BigChalkBox.',
    },
    alternates: {
        canonical: 'https://bigchalkbox.com/about',
    },
    authors: [
        {
            name: 'BCBX Innovations Private Limited',
            url: 'https://bigchalkbox.com',
            email: 'admin.dasesai@gmail.com',
        },
    ],
    summary:
        'BCBX Innovations Private Limited is an EdTech engineering company building deep-tech solutions to automate the most grueling parts of an educator\'s job.',
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            name: 'BCBX Innovations Private Limited',
            alternateName: 'BigChalkBox',
            url: 'https://bigchalkbox.com',
            email: 'admin.dasesai@gmail.com',
            telephone: '+917529836117',
            description:
                'BCBX Innovations Private Limited is an EdTech engineering company building deep-tech solutions to automate the most grueling parts of an educator\'s job. Based in India, our flagship product is BigChalkBox — an AI examination suite for Indian universities.',
            address: {
                '@type': 'PostalAddress',
                addressCountry: 'IN',
            },
            foundingDate: '2024',
            areaServed: {
                '@type': 'Country',
                name: 'India',
            },
            sameAs: [
                'https://linkedin.com/company/bigchalkbox',
                'https://youtube.com/@bigchalkbox_ai',
            ],
            makesOffer: {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'SoftwareApplication',
                    name: 'BigChalkBox Academic Suite',
                    alternateName: [
                        'DASES',
                        'Digital Academic Student Evaluation System',
                        'QP Moderation',
                        'QP Generation',
                    ],
                    applicationCategory: 'EducationalApplication',
                    operatingSystem: 'Web',
                    description:
                        'AI-powered handwritten exam evaluation platform with 98% rubric accuracy. Processes 500 sheets in parallel with per-question feedback. Includes QP Moderation and QP Generation tools.',
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
