import { client, articleQuery, relatedArticlesQuery, commentsQuery } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { urlForImage } from '@/lib/image'
import { getEmbedUrl } from '@/lib/video'
import { getSiteUrl } from '@/lib/site'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import ShareButtons from '@/components/article/ShareButtons'
import RelatedArticles from '@/components/article/RelatedArticles'
import Comments from '@/components/article/Comments'
import ArticleWrapper from './loading'
import { getReadingTime } from '@/lib/readingTime'
import { categoryLabels, formatTag } from '@/lib/taxonomy'
import { withAdBreaks } from '@/lib/adBreaks'
import AdSlot from '@/components/ads/AdSlot'
import type { Metadata } from 'next'

export const revalidate = 5

export async function generateMetadata({ params }: { params: { category: string; slug: string } }): Promise<Metadata> {
  const article = await client.fetch(articleQuery, { slug: params.slug })
  if (!article) return { title: 'Article Not Found | NURR' }

  const path = `/${params.category}/${params.slug}`
  const ogImage = article.featuredImage
    ? urlForImage(article.featuredImage).width(1200).height(630).url()
    : undefined

  return {
    title: `${article.headline} | NURR`,
    description: article.excerpt,
    alternates: {
      canonical: path,
      types: {
        'application/rss+xml': [{ url: '/rss.xml', title: 'NUR Report RSS Feed' }],
      },
    },
    openGraph: {
      type: 'article',
      title: article.headline,
      description: article.excerpt,
      url: path,
      publishedTime: article.publishedAt,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: article.featuredImage?.alt || article.headline }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.headline,
      description: article.excerpt,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: { params: { category: string; slug: string } }) {
  const article = await client.fetch(articleQuery, { slug: params.slug })

  if (!article) return notFound()

  const relatedArticles = await client.fetch(relatedArticlesQuery, {
    category: article.category,
    slug: params.slug,
  })

  const comments = await client.fetch(commentsQuery, { articleId: article._id })

  const shareUrl = `${getSiteUrl()}/${params.category}/${params.slug}`
  const readingTime = getReadingTime(article.body)

  const articleImage = article.featuredImage
    ? urlForImage(article.featuredImage).width(1200).height(630).url()
    : undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.headline,
    description: article.excerpt,
    image: articleImage ? [articleImage] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': shareUrl },
    author: article.author?.name
      ? { '@type': 'Person', name: article.author.name }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'NUR Report',
      logo: { '@type': 'ImageObject', url: `${getSiteUrl()}/icon.svg` },
    },
  }

  return (
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="mb-2">
          <span className="text-brand-700 text-base md:text-lg font-bold uppercase tracking-wide">
            {categoryLabels[article.category] || article.category}
          </span>
          {article.tags && article.tags.length > 0 && (
            <p className="text-sm md:text-base text-text-muted mt-1">
              {categoryLabels[article.category] || article.category}
              {article.tags.map((tag: string) => ` | ${formatTag(tag)}`).join('')}
            </p>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mt-2 mb-4 leading-tight">{article.headline}</h1>
        <p className="text-lg text-text-secondary mb-6">{article.excerpt}</p>


        <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {article.author?.photo && (
              <Image src={urlForImage(article.author.photo).width(48).height(48).url()} alt={article.author.name} width={48} height={48} className="rounded-full" />
            )}
            <div>
              <p className="font-semibold text-text-primary">{article.author?.name}</p>
              <p className="text-sm text-text-muted">
                {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                {article.author?.role && ` · ${article.author.role}`}
                {` · ${readingTime} min read`}
              </p>
            </div>
          </div>

          <ShareButtons url={shareUrl} title={article.headline} />
        </div>

        {(() => {
          const embedUrl = article.videoUrl ? getEmbedUrl(article.videoUrl) : null

          if (embedUrl) {
            return (
              <figure className="mb-8">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={embedUrl}
                    title={article.headline}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                {article.featuredImage?.caption && (
                  <figcaption className="text-sm text-text-muted mt-2 text-center">{article.featuredImage.caption}</figcaption>
                )}
              </figure>
            )
          }

          if (article.featuredImage) {
            return (
              <figure className="mb-8">
                <Image src={urlForImage(article.featuredImage).width(1200).height(675).url()} alt={article.featuredImage.alt || article.headline} width={1200} height={675} className="w-full rounded-lg" priority />
                {article.featuredImage.caption && <figcaption className="text-sm text-text-muted mt-2 text-center">{article.featuredImage.caption}</figcaption>}
              </figure>
            )
          }

          return null
        })()}

        <div className="article-body">
  <PortableText 
    value={withAdBreaks(article.body, 2)} 
    components={{
      block: {
        normal: ({ children }: any) => <p className="mb-6 text-lg leading-relaxed text-text-primary">{children}</p>,
        h2: ({ children }: any) => <h2 className="text-2xl font-bold mt-10 mb-4 text-text-primary">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-xl font-semibold mt-8 mb-3 text-text-primary">{children}</h3>,
        blockquote: ({ children }: any) => (
          <blockquote className="border-l-4 border-brand-700 pl-6 italic text-text-secondary my-8 bg-surface-offwhite py-4 pr-4">
            {children}
          </blockquote>
        ),
      },
      list: {
        bullet: ({ children }: any) => <ul className="list-disc pl-6 mb-6 space-y-2 text-text-primary">{children}</ul>,
        number: ({ children }: any) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-text-primary">{children}</ol>,
      },
      marks: {
        link: ({ value, children }: any) => (
          <a href={value?.href} className="text-brand-700 underline underline-offset-2 hover:text-brand-800" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
        em: ({ children }: any) => <em className="italic">{children}</em>,
      },
      types: {
        image: ({ value }: any) => (
          <figure className="my-8">
            <Image
              src={urlForImage(value).width(800).height(500).url()}
              alt={value.alt || ''}
              width={800}
              height={500}
              className="w-full rounded-lg"
            />
            {value.caption && <figcaption className="text-sm text-text-muted mt-2 text-center">{value.caption}</figcaption>}
          </figure>
        ),
        adBreak: () => <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_IN_ARTICLE_SLOT} />,
      },
    }}
  />
</div>

        {article.hasLiveUpdates && article.liveUpdates && article.liveUpdates.length > 0 && (
          <div className="mt-12 bg-surface-offwhite rounded-lg p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
              <span className="live-dot" />
              LIVE UPDATES
            </h3>
            <div className="space-y-4">
              {article.liveUpdates.map((update: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-brand-700' : 'bg-gray-300'}`} />
                    {i < article.liveUpdates.length - 1 && <div className="w-0.5 flex-1 bg-gray-300 mt-1" />}
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">{formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}</p>
                    <p className="text-text-primary">{update.updateText}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <RelatedArticles articles={relatedArticles} />
        <Comments articleId={article._id} comments={comments || []} />
      </article>
  )
}