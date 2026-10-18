import { buildRss, fetchFeedArticles, rssResponse, RSS_QUERIES } from '@/lib/rss'
import { formatTag } from '@/lib/taxonomy'

export const revalidate = 900

// Rendered on first visit, then cached until revalidated (ISR), instead of
// a fresh server render on every view.
export function generateStaticParams() {
  return []
}

export async function GET(_req: Request, { params }: { params: { tag: string } }) {
  const topic = decodeURIComponent(params.tag).toLowerCase()
  if (!/^[a-z0-9-]{1,60}$/.test(topic)) return new Response('Not found', { status: 404 })

  const articles = await fetchFeedArticles(RSS_QUERIES.tag, { topic })
  if (articles.length === 0) return new Response('Not found', { status: 404 })

  const label = formatTag(topic)
  return rssResponse(
    buildRss({
      title: `${label} | NUR Report`,
      description: `The latest news, reporting and analysis on ${label} from NUR Report.`,
      selfPath: `/tag/${topic}/rss.xml`,
      linkPath: `/tag/${topic}`,
      articles,
    })
  )
}
