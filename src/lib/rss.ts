import { client } from './sanity'
import { getSiteUrl } from './site'
import { urlForImage } from './image'
import { categoryLabels, formatTag } from './taxonomy'

export const RSS_ITEM_COUNT = 40

/**
 * One feed builder for every RSS route (site-wide, per category, per tag).
 * Each item carries its category AND every tag as <category> elements with
 * equal weight, so feed readers and aggregators can file it under either.
 */
const ITEM_PROJECTION = `{
  "slug": slug.current,
  category,
  tags,
  headline,
  excerpt,
  publishedAt,
  _updatedAt,
  featuredImage,
  "author": author->name
}`

export const RSS_QUERIES = {
  all: `*[_type == "article" && status == "published" && defined(slug.current)]
    | order(publishedAt desc) [0...${RSS_ITEM_COUNT}] ${ITEM_PROJECTION}`,
  category: `*[_type == "article" && status == "published" && defined(slug.current) && category == $category]
    | order(publishedAt desc) [0...${RSS_ITEM_COUNT}] ${ITEM_PROJECTION}`,
  tag: `*[_type == "article" && status == "published" && defined(slug.current) && count(tags[lower(@) == $topic]) > 0]
    | order(publishedAt desc) [0...${RSS_ITEM_COUNT}] ${ITEM_PROJECTION}`,
}

type FeedArticle = {
  slug: string
  category: string
  tags?: string[]
  headline: string
  excerpt?: string
  publishedAt: string
  _updatedAt?: string
  featuredImage?: any
  author?: string
}

export function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function fetchFeedArticles(query: string, params: Record<string, unknown> = {}): Promise<FeedArticle[]> {
  try {
    return (await client.fetch<FeedArticle[]>(query, params)) || []
  } catch (error) {
    console.error('RSS: Sanity fetch failed:', error)
    return []
  }
}

export function buildRss(opts: {
  title: string
  description: string
  selfPath: string
  linkPath?: string
  articles: FeedArticle[]
}): string {
  const site = getSiteUrl()
  const articles = opts.articles.filter((a) => a.slug && a.category && a.headline && a.publishedAt)
  const lastBuild = articles[0]?.publishedAt ? new Date(articles[0].publishedAt) : new Date()

  const items = articles
    .map((a) => {
      const url = `${site}/${a.category}/${a.slug}`
      const categories = [
        categoryLabels[a.category] || a.category,
        ...(a.tags || []).map((t) => formatTag(t.toLowerCase())),
      ]
      const uniqueCategories = Array.from(new Set(categories))

      let media = ''
      if (a.featuredImage?.asset) {
        try {
          const src = urlForImage(a.featuredImage).width(1200).height(675).url()
          media = `\n    <media:content url="${escapeXml(src)}" medium="image" width="1200" height="675" />`
        } catch {
          /* image optional */
        }
      }

      return `  <item>
    <title>${escapeXml(a.headline)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>${
      a.author ? `\n    <dc:creator>${escapeXml(a.author)}</dc:creator>` : ''
    }
${uniqueCategories.map((c) => `    <category>${escapeXml(c)}</category>`).join('\n')}${
      a.excerpt ? `\n    <description>${escapeXml(a.excerpt)}</description>` : ''
    }${media}
  </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(opts.title)}</title>
    <link>${site}${opts.linkPath ?? ''}</link>
    <atom:link href="${site}${opts.selfPath}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(opts.description)}</description>
    <language>en-ng</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <image>
      <url>${site}/icon-192.png</url>
      <title>${escapeXml(opts.title)}</title>
      <link>${site}${opts.linkPath ?? ''}</link>
    </image>
${items}
  </channel>
</rss>`
}

export function rssResponse(xml: string, status = 200) {
  return new Response(xml, {
    status,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600',
    },
  })
}
