import type { Metadata } from 'next'
import { client, categoryPageQuery } from '@/lib/sanity'
import OpinionHero from '@/components/opinion/OpinionHero'
import OpinionFeed from '@/components/opinion/OpinionFeed'
import NewsletterSignup from '@/components/opinion/NewsletterSignup'
import AdSlot from '@/components/ads/AdSlot'

export const revalidate = 5

export const metadata: Metadata = {
  title: 'Opinion',
  description: 'Analysis and opinion on Nigeria, Africa, and world affairs from NUR Report contributors.',
}

const HERO_COUNT = 9 // 1 featured + 8 grid items
const PAGE_SIZE = 10

export default async function OpinionPage() {
  const heroArticles = await client.fetch(categoryPageQuery, {
    category: 'opinion',
    start: 0,
    end: HERO_COUNT,
  })

  if (!heroArticles || heroArticles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-8 bg-brand-700 rounded-full" />
          <h1 className="text-3xl font-bold text-text-primary">Opinion</h1>
        </div>
        <p className="text-text-secondary">No opinion pieces yet. Add some in Sanity CMS.</p>
      </div>
    )
  }

  const [featured, ...gridItems] = heroArticles

  // Fetch one extra beyond PAGE_SIZE to know whether "Show more" should
  // render, without a separate count query.
  const rawFeed = await client.fetch(categoryPageQuery, {
    category: 'opinion',
    start: HERO_COUNT,
    end: HERO_COUNT + PAGE_SIZE + 1,
  })
  const hasMore = rawFeed.length > PAGE_SIZE
  const initialFeed = rawFeed.slice(0, PAGE_SIZE)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 bg-brand-700 rounded-full" />
        <h1 className="text-3xl font-bold text-text-primary">Opinion</h1>
      </div>

      <OpinionHero featured={featured} gridItems={gridItems} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 mt-2">
        <OpinionFeed
          category="opinion"
          initialArticles={initialFeed}
          initialHasMore={hasMore}
          initialOffset={HERO_COUNT + initialFeed.length}
        />

        <aside className="space-y-6">
          <NewsletterSignup />
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT} />
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT_2} />
        </aside>
      </div>
    </div>
  )
}
