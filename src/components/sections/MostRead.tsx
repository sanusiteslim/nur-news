import Link from 'next/link'
import { client, articlesBySlugsQuery } from '@/lib/sanity'
import { getMostViewedSlugs } from '@/lib/analytics'
import { categoryLabels } from '@/lib/taxonomy'

// Server component: reads the view-count leaderboard from Redis, then
// resolves those slugs into real article data from Sanity. Renders nothing
// if there's no view data yet (new deployment) or fewer than 2 ranked
// articles — a "Most Read" list with one item isn't a useful module.
export default async function MostRead() {
  const ranked = await getMostViewedSlugs(5)
  if (ranked.length < 2) return null

  const slugs = ranked.map((entry) => entry.slug)
  const articles = await client.fetch(articlesBySlugsQuery, { slugs })

  const bySlug = new Map(articles.map((a: any) => [a.slug.current, a]))
  const ordered = ranked.map((entry) => bySlug.get(entry.slug)).filter(Boolean) as any[]

  if (ordered.length < 2) return null

  return (
    <section>
      <h2 className="section-title mb-4">Most Read</h2>
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
