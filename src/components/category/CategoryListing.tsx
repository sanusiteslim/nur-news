import Link from 'next/link'
import Image from 'next/image'
import ArticleCard from '@/components/ui/ArticleCard'
import { urlForImage } from '@/lib/image'
import { formatPublishedDate } from '@/lib/formatDate'
import { categoryLabels } from '@/lib/taxonomy'
import { jsonLdString, collectionPageJsonLd } from '@/lib/jsonld'
import { getSiteUrl } from '@/lib/site'

export const CATEGORY_PAGE_SIZE = 18

export function categoryPagePath(category: string, page: number) {
  return page <= 1 ? `/${category}` : `/${category}/page/${page}`
}

/** Shared body for /[category] and /[category]/page/[n]. */
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
  const label = categoryLabels[category] || category
  const lead = page === 1 ? articles[0] : null
  const rest = lead ? articles.slice(1) : articles
  const site = getSiteUrl()

  const jsonLd = collectionPageJsonLd({
    name: `${label} news`,
    path: categoryPagePath(category, page),
    urls: articles.map((a) => `${site}/${a.category}/${a.slug.current}`),
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />

      <header className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-800 mb-2">{label}</h1>
          <p className="text-text-secondary">
            Latest {label.toLowerCase()} news and analysis from NUR.
            {page > 1 && <span className="text-text-muted"> · Page {page}</span>}
          </p>
        </div>
        <a href={`/${category}/rss.xml`} className="text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-brand-700">
          RSS feed
        </a>
      </header>

      {lead && (
        <Link href={`/${lead.category}/${lead.slug.current}`} className="group grid grid-cols-1 md:grid-cols-5 gap-6 pb-8 mb-8 border-b border-gray-200">
          <div className="relative md:col-span-3 aspect-[16/9] rounded-lg overflow-hidden">
            {lead.featuredImage?.asset ? (
              <Image
                src={urlForImage(lead.featuredImage).width(1000).height(563).url()}
                alt={lead.featuredImage.alt || lead.headline}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="w-full h-full bg-brand-100 flex items-center justify-center">
                <span className="text-brand-800 font-bold text-3xl">NURR</span>
              </div>
            )}
          </div>
          <div className="md:col-span-2 flex flex-col justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">{label}</span>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-2 leading-tight group-hover:text-brand-700 transition-colors">
              {lead.headline}
            </h2>
            {lead.excerpt && <p className="text-text-secondary mt-3 leading-relaxed line-clamp-3">{lead.excerpt}</p>}
            <p className="text-xs text-text-muted mt-3">
              {lead.author?.name || 'NUR Staff'} · {formatPublishedDate(lead.publishedAt)}
            </p>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rest.map((article: any) => (
          <ArticleCard key={article.slug.current} article={article} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6" aria-label="Pagination">
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
  )
}
