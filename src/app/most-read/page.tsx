import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { client } from '@/lib/sanity'
import { getMostViewedSlugs } from '@/lib/analytics'
import { categoryLabels } from '@/lib/taxonomy'
import { urlForImage } from '@/lib/image'
import { formatPublishedDate } from '@/lib/formatDate'

export const revalidate = 900

export const metadata: Metadata = {
  title: 'Most Read',
  description: 'The NUR Report stories readers are reading most.',
  alternates: { canonical: '/most-read' },
}

const mostReadQuery = `*[_type == "article" && status == "published" && slug.current in $slugs] {
  headline, slug, category, publishedAt, excerpt, featuredImage
}`

export default async function MostReadPage() {
  const ranked = await getMostViewedSlugs(30)
  const articles: any[] = ranked.length
    ? await client.fetch(mostReadQuery, { slugs: ranked.map((r) => r.slug) }).catch(() => [])
    : []
  const bySlug = new Map(articles.map((a) => [a.slug.current, a]))
  const ordered = ranked.map((r) => bySlug.get(r.slug)).filter(Boolean).slice(0, 20) as any[]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-text-primary">Most Read</h1>
      <p className="text-text-secondary mt-2 mb-8">The stories NUR Report readers are reading most.</p>

      {ordered.length === 0 ? (
        <p className="text-text-secondary">
          Nothing to show yet. <Link href="/" className="text-brand-700 hover:underline">Back to the homepage</Link>.
        </p>
      ) : (
        <ol className="divide-y divide-gray-200 border-y border-gray-200">
          {ordered.map((a, i) => (
            <li key={a.slug.current}>
              <Link href={`/${a.category}/${a.slug.current}`} className="group flex items-start gap-4 py-5">
                <span className="w-8 flex-shrink-0 text-3xl font-bold leading-none text-brand-100" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-brand-700">
                    {categoryLabels[a.category] || a.category}
                  </span>
                  <h2 className="text-lg font-semibold text-text-primary leading-snug mt-1 group-hover:text-brand-700 transition-colors">
                    {a.headline}
                  </h2>
                  <p className="text-xs text-text-muted mt-1">{formatPublishedDate(a.publishedAt)}</p>
                </div>
                {a.featuredImage?.asset && (
                  <div className="relative hidden sm:block w-28 h-20 flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={urlForImage(a.featuredImage).width(224).height(160).url()}
                      alt={a.featuredImage.alt || a.headline}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
