// app/layout.js
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./globals.css";

export const metadata = {
  metadataBase: new URL('https://dases.in'),

  title: {
    default: 'DASES | AI-Powered Handwritten Exam Grading',
    template: '%s | DASES',
  },

  description:
    'Grade handwritten answer sheets with AI at 98% rubric accuracy. 500 sheets in parallel, 15 seconds per sheet. Detailed per-question feedback for universities and coaching institutes.',

  keywords: [
    'AI Grading',
    'Exam Evaluation Software',
    'Handwritten Answer Checker',
    'Automated Rubric Grading',
    'DASES',
    'eSun Smart Solutions Pvt. Ltd.',
  ],

  authors: [{ name: 'eSun Smart Solutions Pvt. Ltd.', url: 'https://dases.in' }],
  creator: 'eSun Smart Solutions Pvt. Ltd.',
  publisher: 'eSun Smart Solutions Pvt. Ltd.',

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'DASES',
    title: 'DASES | AI-Powered Handwritten Exam Grading',
    description:
      'Grade handwritten answer sheets with AI at 98% rubric accuracy. 500 sheets in parallel, 15s per sheet.',
    url: 'https://dases.in',
    images: [
      {
        url: '/logo/logo.png',
        width: 600,
        height: 600,
        alt: 'DASES — AI-Powered Exam Grading',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'DASES | AI-Powered Handwritten Exam Grading',
    description:
      'Grade 500 handwritten answer sheets in parallel with 98% accuracy. Per-question feedback in 15 seconds.',
    images: ['/logo/logo.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },

  alternates: {
    canonical: 'https://dases.in',
  },

  category: 'technology',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
