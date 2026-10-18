import { buildRss, fetchFeedArticles, rssResponse, RSS_QUERIES } from '@/lib/rss'
import { categoryLabels, validCategories } from '@/lib/taxonomy'

export const revalidate = 900
export const dynamicParams = false

export function generateStaticParams() {
  return validCategories.map((category) => ({ category }))
}

export async function GET(_req: Request, { params }: { params: { category: string } }) {
  const category = params.category
  if (!validCategories.includes(category)) return new Response('Not found', { status: 404 })

  const label = categoryLabels[category] || category
  const articles = await fetchFeedArticles(RSS_QUERIES.category, { category })
  return rssResponse(
    buildRss({
      title: `${label} | NUR Report`,
      description: `The latest ${label} news and analysis from NUR Report.`,
      selfPath: `/${category}/rss.xml`,
      linkPath: `/${category}`,
      articles,
    })
  )
}
