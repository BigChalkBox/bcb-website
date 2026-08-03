
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./globals.css";

export const metadata = {
  metadataBase: new URL('https://bigchalkbox.com'),

  title: {
    default: 'BigChalkBox | AI Examination Suite for Indian Universities',
    template: '%s | BigChalkBox',
  },

  description:
    'BigChalkBox automates answer sheet grading, question paper moderation, and exam content creation for Indian universities. Grade 500 sheets in 15 minutes. Built by BCBX Innovations Private Limited.',

  keywords: [
    'BigChalkBox',
    'BCBX Innovations',
    'AI answer sheet checking India',
    'automated answer evaluation software',
    'question paper moderation software India',
    "Bloom's Taxonomy question paper checker",
    "Bloom's Taxonomy question papers",
    'AI question paper generation India',
    'university exam automation India',
    'Answer Sheet Evaluation answer sheet evaluation',
    'NAAC exam quality improvement',
    'IQAC digital tools India',
    'EdTech for universities India',
    'handwritten answer sheet OCR',
    'descriptive answer grading AI',
    'AI grading software India',
    'exam grading automation',
    'engineering college assessment software',
    'AI examination platform India',
    'education assessment software',
    'university assessment platform',
    'handwritten answer evaluation',
  ],

  authors: [{ name: 'BCBX Innovations Private Limited', url: 'https://bigchalkbox.com' }],
  creator: 'BCBX Innovations Private Limited',
  publisher: 'BCBX Innovations Private Limited',

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'BigChalkBox',
    title: 'BigChalkBox | AI Examination Suite for Indian Universities',
    description:
      'Explore our suite of AI-powered educational tools: Answer Sheet Evaluation Answer Sheet Checking, Question Paper Moderation, Question Paper Generation, Teacher Notes, and Exam Prep.',
    url: 'https://bigchalkbox.com',
    images: [
      {
        url: '/logo/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BigChalkBox — AI Examination Suite for Indian Universities',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'BigChalkBox | AI Examination Suite for Indian Universities',
    description:
      'Explore our suite of AI-powered educational tools: Answer Sheet Evaluation Answer Sheet Checking, Question Paper Moderation, Question Paper Generation, Teacher Notes, and Exam Prep.',
    images: ['/logo/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: 'https://bigchalkbox.com',
    languages: {
      'en-IN': 'https://bigchalkbox.com',
    },
    types: {
      'application/rss+xml': 'https://bigchalkbox.com/rss.xml',
    },
  },

  category: 'educational technology',
};

// SiteLinksSearchBox — enables Google to show a search box for bigchalkbox.com in SERPs
const siteLinksSearchBoxLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BigChalkBox',
  url: 'https://bigchalkbox.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://bigchalkbox.com/blog?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

import SmoothScroll from '@/components/shared/SmoothScroll';

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <meta name="google-site-verification" content="GcYQMhck8ndTHyu3wEaSgEsD08NdCsOUT3vVmDn9EYc" />
        <link rel="alternate" hrefLang="en-IN" href="https://bigchalkbox.com" />
        <link rel="alternate" hrefLang="en" href="https://bigchalkbox.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800;900&family=Amaranth:ital,wght@0,400;0,700;1,400;1,700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLinksSearchBoxLd) }}
        />
      </head>
      <body>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
