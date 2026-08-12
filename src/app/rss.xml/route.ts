import { client } from '@/lib/sanity'
import { getSiteUrl } from '@/lib/site'

const RSS_ITEM_COUNT = 40

const RSS_QUERY = `*[
  _type == "article" &&
  status == "published" &&
  defined(slug.current)
] | order(publishedAt desc) [0...${RSS_ITEM_COUNT}] {
  "slug": slug.current,
  category,
  headline,
  excerpt,
  publishedAt,
  "author": author->name
}`

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const baseUrl = getSiteUrl()

  let articles: {
    slug: string
    category: string
    headline: string
    excerpt?: string
    publishedAt: string
    author?: string
  }[] = []

  try {
    articles = await client.fetch(RSS_QUERY)
  } catch (error) {
    console.error('Error building RSS feed:', error)
  }

  const items = articles
    .filter((a) => a.slug && a.category && a.headline)
    .map((a) => {
      const url = `${baseUrl}/${a.category}/${a.slug}`
      return `  <item>
    <title>${escapeXml(a.headline)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
    ${a.author ? `<author>${escapeXml(a.author)}</author>` : ''}
    <category>${escapeXml(a.category)}</category>
    ${a.excerpt ? `<description>${escapeXml(a.excerpt)}</description>` : ''}
  </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NUR Report</title>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Independent news coverage of Nigeria, Africa, and the world.</description>
    <language>en</language>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=1800',
    },
  })
}