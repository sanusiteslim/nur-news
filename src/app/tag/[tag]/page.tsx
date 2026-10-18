import { client, tagArticlesQuery, tagCountQuery } from '@/lib/sanity'
import { formatTag } from '@/lib/taxonomy'
import ArticleCard from '@/components/ui/ArticleCard'
import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

// Refreshed on publish by /api/revalidate; this is only the fallback timer.
export const revalidate = 300

const TAG_PAGE_SIZE = 50
// Tag pages with fewer stories than this are thin content: still useful to
// readers, but kept out of Google's index until the topic grows.
const MIN_INDEXABLE = 3

/**
 * Tags are free-form-ish and grow over time, so these render on demand and
 * then cache, rather than being pre-built. Matching is case-insensitive, so
 * articles tagged "Sports" and "sports" both appear at /tag/sports.
 */

type Params = { params: { tag: string } }

// Rendered on first visit, then cached until revalidated (ISR), instead of
// a fresh server render on every view.
export function generateStaticParams() {
  return []
}

function normalise(raw: string) {
  return decodeURIComponent(raw).toLowerCase()
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const tag = normalise(params.tag)
  const label = formatTag(tag)
  const count = await client.fetch<number>(tagCountQuery, { topic: tag }).catch(() => 0)
  return {
    title: label,
    description: `The latest news, reporting and analysis on ${label} from NUR Report.`,
    alternates: {
      canonical: `/tag/${tag}`,
      types: { 'application/rss+xml': [{ url: `/tag/${tag}/rss.xml`, title: `${label} | NUR Report` }] },
    },
    robots: count < MIN_INDEXABLE ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      title: `${label} | NUR Report`,
      description: `The latest news, reporting and analysis on ${label}.`,
      url: `/tag/${tag}`,
    },
  }
}

export default async function TagPage({ params }: Params) {
  const tag = normalise(params.tag)
  // One URL per tag: /tag/Sports → /tag/sports.
  if (params.tag !== params.tag.toLowerCase()) permanentRedirect(`/tag/${params.tag.toLowerCase()}`)

  const [articles, total] = await Promise.all([
    client.fetch(tagArticlesQuery, { topic: tag, start: 0, end: TAG_PAGE_SIZE }),
    client.fetch<number>(tagCountQuery, { topic: tag }),
  ])

  // An empty tag page is a soft-404 in Google's eyes and a dead end for
  // readers, so a tag nobody has used returns a real 404 instead.
  if (!articles || articles.length === 0) return notFound()

  const label = formatTag(tag)

  // Related tags: what else do these articles get filed under? Gives readers
  // a sideways path out of the archive instead of a dead end at the bottom.
  const relatedTags = Array.from(
    new Set(
      articles
        .flatMap((a: any) => a.tags || [])
        .map((t: string) => t.toLowerCase())
        .filter((t: string) => t !== tag)
    )
  ).slice(0, 8) as string[]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="pb-6 mb-8 border-b border-gray-200 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-wider text-text-muted mb-1">Topic</p>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">{label}</h1>
          <p className="text-text-secondary mt-2">
            {total} {total === 1 ? 'story' : 'stories'}
            {total > articles.length && ` · showing the latest ${articles.length}`}
          </p>
        </div>
        <a href={`/tag/${tag}/rss.xml`} className="text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-brand-700">
          RSS feed
        </a>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: any) => (
          <ArticleCard key={article.slug.current} article={article} />
        ))}
      </div>

      {relatedTags.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="section-title mb-4">Related Topics</h2>
          <div className="flex flex-wrap gap-2">
            {relatedTags.map((t) => (
              <Link
                key={t}
                href={`/tag/${t}`}
                className="px-3 py-1.5 bg-brand-50 text-brand-800 text-sm rounded-full hover:bg-brand-100 transition-colors"
              >
                {formatTag(t)}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
