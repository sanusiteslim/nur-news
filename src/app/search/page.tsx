import { client, searchQuery } from '@/lib/sanity'
import ArticleCard from '@/components/ui/ArticleCard'
import type { Metadata } from 'next'

export const revalidate = 5

type SearchParams = { q?: string | string[] }

function getQuery(searchParams: SearchParams): string {
  const raw = searchParams.q
  const value = Array.isArray(raw) ? raw[0] : raw
  return value?.trim() || ''
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const q = getQuery(searchParams)
  return {
    title: q ? `Search: ${q} | NUR Report` : 'Search | NUR Report',
    description: 'Search NUR Report for news, sports, opinion, and analysis.',
    robots: { index: false, follow: true }, // search results pages shouldn't be indexed
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const q = getQuery(searchParams)

  const articles = q
    ? await client.fetch(searchQuery, { term: `${q}*` })
    : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-brand-800 mb-2">
        {q ? `Results for "${q}"` : 'Search'}
      </h1>

      {!q && (
        <p className="text-text-secondary">
          Use the search icon in the navigation bar to look for articles.
        </p>
      )}

      {q && articles.length === 0 && (
        <p className="text-text-secondary">
          No articles found for &ldquo;{q}&rdquo;. Try a different search term.
        </p>
      )}

      {articles.length > 0 && (
        <>
          <p className="text-text-secondary mb-8">
            {articles.length} result{articles.length === 1 ? '' : 's'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <ArticleCard key={article.slug.current} article={article} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}