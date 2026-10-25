import Link from 'next/link'
import { client, categoryPageQuery } from '@/lib/sanity'
import OpinionHero from '@/components/opinion/OpinionHero'
import OpinionFeed from '@/components/opinion/OpinionFeed'
import OpinionListItem from '@/components/opinion/OpinionListItem'
import NewsletterSignup from '@/components/opinion/NewsletterSignup'
import AdSlot from '@/components/ads/AdSlot'
import { categoryLabels } from '@/lib/taxonomy'
import { jsonLdString, collectionPageJsonLd } from '@/lib/jsonld'
import { getSiteUrl } from '@/lib/site'

// Every section page (Nigeria, Africa, World, Sports, Business, Tech,
// Culture, Environment and Opinion) uses the Opinion page layout: lead story
// + 2x4 grid, then a "Show more" feed beside the newsletter/ad sidebar.
// /video and /live have their own pages and don't use this.

export const CATEGORY_PAGE_SIZE = 18
const HERO_COUNT = 9 // 1 lead + 8 grid items
const FEED_PAGE_SIZE = 10

export function categoryPagePath(category: string, page: number) {
  return page <= 1 ? `/${category}` : `/${category}/page/${page}`
}

function categoryIntro(category: string, label: string) {
  if (category === 'opinion') return 'Analysis and opinion from NUR Report contributors.'
  return `Latest ${label} news and analysis from NUR.`
}

/** The section title block (the Nigeria page design), shared by every section. */
export function CategoryHeader({ category, page = 1 }: { category: string; page?: number }) {
  const label = categoryLabels[category] || category
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-800 mb-2">{label}</h1>
        <p className="text-text-secondary">
          {categoryIntro(category, label)}
          {page > 1 && <span className="text-text-muted"> · Page {page}</span>}
        </p>
      </div>
      <a href={`/${category}/rss.xml`} className="text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-brand-700">
        RSS feed
      </a>
    </header>
  )
}

function Sidebar({ category }: { category: string }) {
  return (
    <aside className="space-y-6">
      <NewsletterSignup source={`category-${category}`} />
      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT} />
      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT_2} />
    </aside>
  )
}

function CollectionJsonLd({ category, page, articles }: { category: string; page: number; articles: any[] }) {
  const label = categoryLabels[category] || category
  const site = getSiteUrl()
  const jsonLd = collectionPageJsonLd({
    name: `${label} news`,
    path: categoryPagePath(category, page),
    urls: articles.map((a) => `${site}/${a.category}/${a.slug.current}`),
  })
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
}

/** Page 1 of a section: /nigeria, /opinion, … */
export async function CategoryLanding({ category }: { category: string }) {
  const kicker = categoryLabels[category] || category
  const showQuoteBadge = category === 'opinion'

  // Fetch one extra feed item beyond FEED_PAGE_SIZE to know whether
  // "Show more" should render, without a separate count query.
  const [heroArticles, rawFeed] = await Promise.all([
    client.fetch(categoryPageQuery, { category, start: 0, end: HERO_COUNT }),
    client.fetch(categoryPageQuery, { category, start: HERO_COUNT, end: HERO_COUNT + FEED_PAGE_SIZE + 1 }),
  ])

  if (!heroArticles || heroArticles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryHeader category={category} />
        <p className="text-text-secondary">No stories here yet. Check back soon.</p>
      </div>
    )
  }

  const [featured, ...gridItems] = heroArticles
  const hasMore = rawFeed.length > FEED_PAGE_SIZE
  const initialFeed = rawFeed.slice(0, FEED_PAGE_SIZE)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CollectionJsonLd category={category} page={1} articles={[...heroArticles, ...initialFeed]} />
      <CategoryHeader category={category} />

      <OpinionHero featured={featured} gridItems={gridItems} kicker={kicker} showQuoteBadge={showQuoteBadge} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 mt-2">
        <OpinionFeed
          category={category}
          initialArticles={initialFeed}
          initialHasMore={hasMore}
          initialOffset={HERO_COUNT + initialFeed.length}
          pageSize={FEED_PAGE_SIZE}
          kicker={kicker}
          showQuoteBadge={showQuoteBadge}
        />
        <Sidebar category={category} />
      </div>
    </div>
  )
}

/** Archive pages kept for links and search engines: /nigeria/page/2, … */
export default function CategoryListing({
  category,
  articles,
  page,
  totalPages,
}: {
  category: string
  articles: any[]
  page: number
  totalPages: number
}) {
  const kicker = categoryLabels[category] || category
  const showQuoteBadge = category === 'opinion'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CollectionJsonLd category={category} page={page} articles={articles} />
      <CategoryHeader category={category} page={page} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div>
          {articles.map((article: any) => (
            <OpinionListItem key={article.slug.current} article={article} kicker={kicker} showQuoteBadge={showQuoteBadge} />
          ))}

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6" aria-label="Pagination">
              {page > 1 ? (
                <Link href={categoryPagePath(category, page - 1)} rel="prev" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                  ← Newer stories
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-text-muted">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={categoryPagePath(category, page + 1)} rel="next" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                  Older stories →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
        <Sidebar category={category} />
      </div>
    </div>
  )
}
