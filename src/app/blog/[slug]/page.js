import BlogArticle from '../../../components/blog/BlogArticle'
import { articles, getArticleBySlug, getAllSlugs } from '../articles'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
    return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }) {
    const { slug } = await params
    const article = getArticleBySlug(slug)
    if (!article) return {}

    return {
        title: article.title,
        description: article.description,
        alternates: {
            canonical: `https://dasesai.com/blog/${article.slug}`,
        },
        openGraph: {
            title: article.title,
            description: article.description,
            url: `https://dasesai.com/blog/${article.slug}`,
            type: 'article',
            publishedTime: article.publishedAt,
            modifiedTime: article.updatedAt,
            authors: ['eSun Smart Solutions Pvt. Ltd.'],
            tags: article.tags,
        },
        twitter: {
            title: article.title,
            description: article.description,
        },
    }
}

export default async function BlogArticlePage({ params }) {
    const { slug } = await params
    const article = getArticleBySlug(slug)

    if (!article) {
        notFound()
    }

    // Speakable — tells AI crawlers, voice assistants, and answer engines
    // exactly which CSS regions contain the highest-value, citable content.
    // h1 = article title; .hero-answer-text = the direct factual answer.
    const speakableSpec = {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', '.hero-answer-text'],
    }

    // HowTo schema — generated automatically for Tutorial-category articles.
    // Each section maps to a HowToStep, enabling rich results in Google,
    // Siri, Google Assistant, and AI answer engines for procedural queries.
    const howToSchema =
        article.category === 'Tutorial' && article.sections && article.sections.length > 0
            ? {
                  '@type': 'HowTo',
                  name: article.title,
                  description: article.description,
                  totalTime: article.readTime ? `PT${parseInt(article.readTime)}M` : undefined,
                  step: article.sections.map((section, index) => ({
                      '@type': 'HowToStep',
                      position: index + 1,
                      name: section.heading,
                      text: section.content,
                      url: `https://dasesai.com/blog/${article.slug}#step-${index + 1}`,
                  })),
              }
            : null

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Article',
                headline: article.title,
                description: article.description,
                datePublished: article.publishedAt,
                dateModified: article.updatedAt,
                url: `https://dasesai.com/blog/${article.slug}`,
                // speakable — points AI engines at .hero-answer-text for citation
                speakable: speakableSpec,
                // abstract maps heroAnswer — the direct, AI-citable factual summary
                abstract: article.heroAnswer,
                author: {
                    '@type': 'Organization',
                    name: 'eSun Smart Solutions Pvt. Ltd.',
                    url: 'https://dasesai.com',
                },
                publisher: {
                    '@type': 'Organization',
                    name: 'DASES',
                    url: 'https://dasesai.com',
                    logo: {
                        '@type': 'ImageObject',
                        url: 'https://dasesai.com/logo/logo.png',
                    },
                },
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': `https://dasesai.com/blog/${article.slug}`,
                },
                keywords: article.tags.join(', '),
                articleSection: article.category,
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: 'https://dasesai.com',
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Blog',
                        item: 'https://dasesai.com/blog',
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: article.title,
                        item: `https://dasesai.com/blog/${article.slug}`,
                    },
                ],
            },
            // FAQPage — inline Q&A for rich result eligibility and AI answer extraction
            ...(article.faqItems && article.faqItems.length > 0
                ? [
                      {
                          '@type': 'FAQPage',
                          mainEntity: article.faqItems.map(faq => ({
                              '@type': 'Question',
                              name: faq.question,
                              acceptedAnswer: {
                                  '@type': 'Answer',
                                  text: faq.answer,
                              },
                          })),
                      },
                  ]
                : []),
            // HowTo — conditional on Tutorial category
            ...(howToSchema ? [howToSchema] : []),
        ],
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BlogArticle article={article} allArticles={articles} />
        </>
    )
}
