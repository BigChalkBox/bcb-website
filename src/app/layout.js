
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./globals.css";

export const metadata = {
  metadataBase: new URL('https://bigchalkbox.com'),

  title: {
    default: 'BigChalkBox | Comprehensive EdTech Automation Suite',
    template: '%s | BigChalkBox',
  },

  description:
    'BigChalkBox Innovations LLP is an innovative ed-tech company providing AI-powered solutions including DASES answer sheet checking, Question Paper Moderation, Teacher Notes generation, and Exam Preparation content.',

  keywords: [
    'BigChalkBox',
    'BigChalkBox Innovations LLP',
    'EdTech solutions',
    'AI educational software',
    'DASES',
    'question paper moderation',
    'question paper generation',
    'AI teacher notes',
    'exam preparation AI',
  ],

  authors: [{ name: 'BigChalkBox Innovations LLP', url: 'https://bigchalkbox.com' }],
  creator: 'BigChalkBox Innovations LLP',
  publisher: 'BigChalkBox Innovations LLP',

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'BigChalkBox',
    title: 'BigChalkBox | Comprehensive EdTech Automation Suite',
    description:
      'Explore our suite of AI-powered educational tools: DASES Answer Sheet Checking, Question Paper Moderation, QP Generation, Teacher Notes, and Exam Prep.',
    url: 'https://bigchalkbox.com',
    images: [
      {
        url: '/logo/logo.png',
        width: 600,
        height: 600,
        alt: 'BigChalkBox Innovations LLP',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'BigChalkBox | Comprehensive EdTech Automation Suite',
    description:
      'Explore our suite of AI-powered educational tools: DASES Answer Sheet Checking, Question Paper Moderation, QP Generation, Teacher Notes, and Exam Prep.',
    images: ['/logo/logo.png'],
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
  },

  category: 'educational technology',
};

import SmoothScroll from '@/components/shared/SmoothScroll';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="GcYQMhck8ndTHyu3wEaSgEsD08NdCsOUT3vVmDn9EYc" />
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
      </head>
      <body>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
