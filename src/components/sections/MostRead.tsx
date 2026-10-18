import Link from 'next/link'
import { client, articlesBySlugsQuery } from '@/lib/sanity'
import { getMostViewedSlugs } from '@/lib/analytics'
import { categoryLabels } from '@/lib/taxonomy'

// Server component: reads the view-count leaderboard from Redis, then
// resolves those slugs into real article data from Sanity. Renders nothing
// if there's no view data yet (new deployment) or fewer than 2 ranked
// articles — a "Most Read" list with one item isn't a useful module.
export default async function MostRead() {
  // Ask for a few extra: some ranked slugs may be unpublished or deleted.
  const ranked = (await getMostViewedSlugs(8)).slice(0, 8)
  if (ranked.length < 2) return null

  const slugs = ranked.map((entry) => entry.slug)
  const articles = await client.fetch(articlesBySlugsQuery, { slugs })

  const bySlug = new Map(articles.map((a: any) => [a.slug.current, a]))
  const ordered = (ranked.map((entry) => bySlug.get(entry.slug)).filter(Boolean) as any[]).slice(0, 5)

  if (ordered.length < 2) return null

  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="section-title">Most Read</h2>
        <Link href="/most-read" className="text-sm font-medium text-brand-700 hover:underline">
          More →
        </Link>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {ordered.map((article, i) => (
          <li key={article.slug.current}>
            <Link href={`/${article.category}/${article.slug.current}`} className="group flex gap-3">
              <span className="text-3xl font-bold text-brand-100 leading-none flex-shrink-0" aria-hidden="true">
                {i + 1}
              </span>
              <div className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wider text-brand-700 mb-1">
                  {categoryLabels[article.category] || article.category}
                </span>
                <h3 className="text-sm font-semibold text-text-primary leading-snug group-hover:text-brand-700 transition-colors line-clamp-3">
                  {article.headline}
                </h3>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
