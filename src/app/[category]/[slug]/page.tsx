import { cache } from 'react'
import { client, articleQuery, relatedArticlesQuery } from '@/lib/sanity'
import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { formatPublishedDate } from '@/lib/formatDate'
import { urlForImage } from '@/lib/image'
import { getEmbedUrl } from '@/lib/video'
import { getSiteUrl } from '@/lib/site'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import ShareButtons from '@/components/article/ShareButtons'
import RelatedArticles from '@/components/article/RelatedArticles'
import ViewTracker from '@/components/article/ViewTracker'
import { CorrectionsNotice, SourcesList } from '@/components/article/SourcesAndCorrections'
import NewsletterSignup from '@/components/opinion/NewsletterSignup'
import { getReadingTime } from '@/lib/readingTime'
import { categoryLabels, formatTag } from '@/lib/taxonomy'
import { withAdBreaks } from '@/lib/adBreaks'
import { jsonLdString, newsArticleJsonLd } from '@/lib/jsonld'
import AdSlot from '@/components/ads/AdSlot'
import type { Metadata } from 'next'

// Refreshed on publish by /api/revalidate; this is only the fallback timer.
export const revalidate = 120

type Params = { params: { category: string; slug: string } }

// Returning [] (and leaving dynamicParams on) makes every article
// incrementally static: rendered on first visit, then served from cache
// until revalidated. Without it each view was a fresh server render.
export function generateStaticParams() {
  return []
}

// One Sanity request per render, shared by generateMetadata and the page.
const getArticle = cache((slug: string) => client.fetch(articleQuery, { slug }))

function shareImage(article: any): string | undefined {
  const source = article.seo?.ogImage?.asset ? article.seo.ogImage : article.featuredImage
  if (!source?.asset) return undefined
  // JPEG keeps the file small enough for WhatsApp link previews.
  return urlForImage(source).width(1200).height(630).fit('crop').format('jpg').quality(80).url()
}

/** Only http(s), mailto and same-site links are rendered as links. */
function safeHref(href?: string): string | null {
  if (!href) return null
  if (href.startsWith('/')) return href
  try {
    const u = new URL(href)
    return ['http:', 'https:', 'mailto:'].includes(u.protocol) ? u.toString() : null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const article = await getArticle(params.slug)
  if (!article) return { title: 'Article not found' }

  const path = `/${article.category}/${article.slug.current}`
  const title = article.seo?.metaTitle || article.headline
  const description = article.seo?.metaDescription || article.excerpt
  const ogImage = shareImage(article)
  const modified = [article._updatedAt, ...(article.corrections || []).map((c: any) => c.date)]
    .filter(Boolean)
    .sort()
    .pop()

  return {
    // The layout template appends " | NUR Report".
    title,
    description,
    alternates: {
      canonical: path,
      types: {
        'application/rss+xml': [
          { url: '/rss.xml', title: 'NUR Report' },
          { url: `/${article.category}/rss.xml`, title: `${categoryLabels[article.category] || article.category} | NUR Report` },
        ],
      },
    },
    robots: article.seo?.noindex ? { index: false, follow: true } : { 'max-image-preview': 'large' },
    openGraph: {
      type: 'article',
      siteName: 'NUR Report',
      locale: 'en_NG',
      title,
      description,
      url: path,
      publishedTime: article.publishedAt,
      modifiedTime: modified,
      section: categoryLabels[article.category] || article.category,
      tags: article.tags,
      authors: article.author?.name ? [article.author.name] : undefined,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: article.featuredImage?.alt || article.headline }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: Params) {
  const article = await getArticle(params.slug)

  if (!article) return notFound()

  // One canonical URL per story: /wrong-section/slug → /right-section/slug.
  if (article.category !== params.category) {
    permanentRedirect(`/${article.category}/${article.slug.current}`)
  }

  const tags: string[] = (article.tags || []).map((t: string) => t.toLowerCase())
  const relatedArticles = await client.fetch(relatedArticlesQuery, {
    category: article.category,
    slug: article.slug.current,
    tags,
  })

  const shareUrl = `${getSiteUrl()}/${article.category}/${article.slug.current}`
  const readingTime = getReadingTime(article.body)
  const categoryLabel = categoryLabels[article.category] || article.category

  const jsonLdImages = article.featuredImage?.asset
    ? [
        urlForImage(article.featuredImage).width(1200).height(1200).fit('crop').url(),
        urlForImage(article.featuredImage).width(1200).height(900).fit('crop').url(),
        urlForImage(article.featuredImage).width(1200).height(675).fit('crop').url(),
      ]
    : []
  const jsonLd = newsArticleJsonLd(article, jsonLdImages, categoryLabel)

  const lastUpdate = [article._updatedAt, ...(article.corrections || []).map((c: any) => c.date)]
    .filter(Boolean)
    .sort()
    .pop()
  // Only call it "Updated" when a correction was logged — routine Studio
  // saves (typo fixes, image swaps) shouldn't look like news changes.
  const showUpdated = (article.corrections || []).length > 0 && lastUpdate

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ViewTracker slug={article.slug.current} />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      {/* Kicker — identical for every section, Opinion included. */}
      <div className="mb-2">
        <span className="text-brand-700 text-base md:text-lg font-bold uppercase tracking-wide">
          {categoryLabel}
        </span>
        {tags.length > 0 && (
          <p className="text-sm md:text-base text-text-muted mt-1">
            {categoryLabel}
            {tags.map((tag) => ` | ${formatTag(tag)}`).join('')}
          </p>
        )}
      </div>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mt-2 mb-4 leading-tight">{article.headline}</h1>
      <p className="text-lg text-text-secondary mb-6">{article.excerpt}</p>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {article.author?.photo && (
            <Image src={urlForImage(article.author.photo).width(96).height(96).url()} alt={article.author.name} width={48} height={48} className="rounded-full" />
          )}
          <div>
            <p className="font-semibold text-text-primary">
              {article.author?.slug?.current ? (
                <Link
                  href={`/author/${article.author.slug.current}`}
                  className="hover:text-brand-700 transition-colors"
                >
                  {article.author.name}
                </Link>
              ) : (
                article.author?.name
              )}
            </p>
            <p className="text-sm text-text-muted">
              <time dateTime={article.publishedAt}>{formatPublishedDate(article.publishedAt)}</time>
              {showUpdated && (
                <>
                  {' · Updated '}
                  <time dateTime={lastUpdate}>{formatPublishedDate(lastUpdate)}</time>
                </>
              )}
              {article.author?.role && ` · ${article.author.role}`}
              {` · ${readingTime} min read`}
            </p>
          </div>
        </div>

        <ShareButtons url={shareUrl} title={article.headline} />
      </div>

      {(() => {
        const embedUrl = article.videoUrl ? getEmbedUrl(article.videoUrl) : null
        const hasImage = article.featuredImage?.asset

        if (embedUrl) {
          return (
            <figure className="mb-8">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={embedUrl}
                  title={article.headline}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              {article.featuredImage?.caption && (
                <figcaption className="text-sm text-text-muted mt-2 text-center">{article.featuredImage.caption}</figcaption>
              )}
            </figure>
          )
        }

        if (hasImage) {
          return (
            <figure className="mb-8">
              <Image
                src={urlForImage(article.featuredImage).width(1200).height(675).url()}
                alt={article.featuredImage.alt || article.headline}
                width={1200}
                height={675}
                sizes="(max-width: 896px) 100vw, 896px"
                className="w-full rounded-lg"
                priority
              />
              {article.featuredImage.caption && (
                <figcaption className="text-sm text-text-muted mt-2 text-center">{article.featuredImage.caption}</figcaption>
              )}
            </figure>
          )
        }

        return (
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-brand-100 flex items-center justify-center mb-8">
            <span className="text-brand-800 font-bold text-4xl">NURR</span>
          </div>
        )
      })()}

      <CorrectionsNotice corrections={article.corrections} />

      <div className="article-body">
        <PortableText
          value={withAdBreaks(article.body)}
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
              link: ({ value, children }: any) => {
                const href = safeHref(value?.href)
                if (!href) return <>{children}</>
                const external = !href.startsWith('/') && !href.startsWith(getSiteUrl())
                return (
                  <a
                    href={href}
                    className="text-brand-700 underline underline-offset-2 hover:text-brand-800"
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {children}
                  </a>
                )
              },
              strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
              em: ({ children }: any) => <em className="italic">{children}</em>,
            },
            types: {
              image: ({ value }: any) => {
                if (!value?.asset) return null
                return (
                  <figure className="my-8">
                    <Image
                      src={urlForImage(value).width(800).height(500).url()}
                      alt={value.alt || ''}
                      width={800}
                      height={500}
                      sizes="(max-width: 896px) 100vw, 800px"
                      className="w-full rounded-lg"
                    />
                    {value.caption && <figcaption className="text-sm text-text-muted mt-2 text-center">{value.caption}</figcaption>}
                  </figure>
                )
              },
              adBreak: () => <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_IN_ARTICLE_SLOT} />,
            },
          }}
        />
      </div>

      <SourcesList sources={article.sources} />

      {/* Topic pills — each links to its tag archive, giving readers a route
          into the wider story thread instead of a dead end at the article's end. */}
      {tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
            Topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag}`}
                className="px-3 py-1.5 bg-brand-50 text-brand-800 text-sm rounded-full hover:bg-brand-100 transition-colors"
              >
                {formatTag(tag)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Opinion disclaimer & author bio — placed after article body per Al Jazeera layout */}
      {article.category === 'opinion' && (
        <div className="mt-10">
          <p className="text-text-primary italic text-lg leading-relaxed">
            The views expressed in this article are the author&apos;s own and do not necessarily reflect NUR Report&apos;s editorial stance.
          </p>

          <div className="border-t-2 border-brand-700 my-6" />

          {article.author && (
            <div className="flex items-start gap-4">
              {article.author.photo && (
                <Image
                  src={urlForImage(article.author.photo).width(128).height(128).url()}
                  alt={article.author.name}
                  width={64}
                  height={64}
                  className="rounded-full flex-shrink-0 object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-text-primary text-lg">
                  {article.author.slug?.current ? (
                    <Link
                      href={`/author/${article.author.slug.current}`}
                      className="hover:text-brand-700 transition-colors"
                    >
                      {article.author.name}
                    </Link>
                  ) : (
                    article.author.name
                  )}
                </p>
                <p className="text-base text-text-secondary leading-relaxed mt-1">
                  {article.author.bio || article.author.role}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

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

      <NewsletterSignup variant="inline" source={`article-${article.category}`} />

      <RelatedArticles articles={relatedArticles} />
    </article>
  )
}
