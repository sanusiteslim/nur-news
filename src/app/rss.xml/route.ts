import { buildRss, fetchFeedArticles, rssResponse, RSS_QUERIES } from '@/lib/rss'

// Rebuilt at most every 15 minutes (and immediately on publish via
// /api/revalidate). Without this export Next.js froze the feed at build time.
export const revalidate = 900

export async function GET() {
  const articles = await fetchFeedArticles(RSS_QUERIES.all)
  return rssResponse(
    buildRss({
      title: 'NUR Report',
      description: 'Independent news coverage of Nigeria, Africa, and the world.',
      selfPath: '/rss.xml',
      articles,
    })
  )
}
