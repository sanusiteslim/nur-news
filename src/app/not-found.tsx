import Link from 'next/link'
import { client } from '@/lib/sanity'
import ArticleCard from '@/components/ui/ArticleCard'

export const revalidate = 60

const latestStoriesQuery = `
  *[_type == "article" && status == "published"] | order(publishedAt desc) [0...3] {
    headline, slug, excerpt, featuredImage, category, publishedAt,
    "author": author->{name, photo}
  }
`

export default async function NotFound() {
  const latestStories = await client.fetch(latestStoriesQuery).catch(() => [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-brand-700 text-sm font-semibold uppercase tracking-wider">Page not found</span>
        <h1 className="text-6xl md:text-8xl font-bold text-text-primary mt-3">404</h1>
        <p className="text-lg text-text-secondary mt-4">
          This story may have been moved, renamed, or never existed. Let&apos;s get you back to the news.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link
            href="/"
            className="px-5 py-2.5 bg-brand-700 text-white text-sm font-medium rounded-full hover:bg-brand-800 transition-colors"
          >
            Back to Homepage
          </Link>
          <Link
            href="/search"
            className="px-5 py-2.5 border border-gray-300 text-text-primary text-sm font-medium rounded-full hover:border-brand-700 hover:text-brand-700 transition-colors"
          >
            Search Articles
          </Link>
        </div>
      </div>

      {latestStories && latestStories.length > 0 && (
        <div className="mt-20">
          <h2 className="section-title mb-4">Today&apos;s Top Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestStories.map((article: any) => (
              <ArticleCard key={article.slug.current} article={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}