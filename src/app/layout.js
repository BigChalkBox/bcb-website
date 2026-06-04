// app/layout.js
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./globals.css";

export const metadata = {
  metadataBase: new URL('https://dasesai.com'),

  title: {
    default: 'DASES | AI-Powered Answer Sheet Checker & Grading Software',
    template: '%s | DASES',
  },

  description:
    'DASES is the ultimate AI answer sheet checking software. Grade handwritten answer sheets with 98% accuracy, process 500 papers in parallel, and get per-question feedback in 15 seconds. Perfect for universities, schools, and coaching institutes.',

  keywords: [
    'AI answer sheet checker',
    'AI paper checking',
    'AI grading software',
    'automated answer sheet evaluation',
    'handwritten exam evaluation software',
    'digital answer sheet evaluation system',
    'AI marking software for schools',
    'teacher grading automation tool',
    'AI grader for coaching institutes',
    'automated rubric grading',
    'fast exam checking AI',
    'AI software for teachers',
    'DASES',
    'DASES evaluation system',
    'Big Chalk Box Pvt. Ltd.',
  ],

  authors: [{ name: 'Big Chalk Box Pvt. Ltd.', url: 'https://dasesai.com' }],
  creator: 'Big Chalk Box Pvt. Ltd.',
  publisher: 'Big Chalk Box Pvt. Ltd.',

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'DASES AI Grading',
    title: 'DASES | AI-Powered Handwritten Answer Sheet Checking',
    description:
      'Grade handwritten answer sheets with AI at 98% rubric accuracy. Automate school & coaching exam checking. 500 sheets in parallel, 15s per sheet.',
    url: 'https://dasesai.com',
    images: [
      {
        url: '/logo/logo.png',
        width: 600,
        height: 600,
        alt: 'DASES — AI-Powered Answer Sheet Checking Software',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'DASES | AI Answer Sheet Evaluation Software',
    description:
      'Evaluate 500 handwritten answer sheets in parallel with 98% accuracy. DASES gives per-question feedback in 15 seconds.',
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
    canonical: 'https://dasesai.com',
  },

  category: 'educational technology',
};

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
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
