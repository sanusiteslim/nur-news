import { client } from '@/lib/sanity'
import { getSiteUrl } from '@/lib/site'

// Google News only wants articles from roughly the last 2 days in this
// sitemap — older articles should already be indexed via the regular
// sitemap.tsx. See: https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
const NEWS_SITEMAP_WINDOW_HOURS = 48

const NEWS_SITEMAP_QUERY = `*[
  _type == "article" &&
  status == "published" &&
  defined(slug.current) &&
  publishedAt > $cutoff
] | order(publishedAt desc) {
  "slug": slug.current,
  category,
  headline,
  publishedAt
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
  const cutoff = new Date(Date.now() - NEWS_SITEMAP_WINDOW_HOURS * 60 * 60 * 1000).toISOString()

  let articles: { slug: string; category: string; headline: string; publishedAt: string }[] = []
  try {
    articles = await client.fetch(NEWS_SITEMAP_QUERY, { cutoff })
  } catch (error) {
    console.error('Error building Google News sitemap:', error)
  }

  const urlEntries = articles
    .filter((a) => a.slug && a.category && a.headline && a.publishedAt)
    .map(
      (a) => `  <url>
    <loc>${baseUrl}/${a.category}/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>NUR Report</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(a.publishedAt).toISOString()}</news:publication_date>
      <news:title>${escapeXml(a.headline)}</news:title>
    </news:news>
  </url>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Short cache — this feed needs to reflect very recent publishes
      'Cache-Control': 'public, max-age=0, s-maxage=300',
    },
  })
}