import { client, tagArticlesQuery, allTagsQuery } from '@/lib/sanity'
import { formatTag } from '@/lib/taxonomy'
import ArticleCard from '@/components/ui/ArticleCard'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 60

/**
 * Tags are free-form-ish and grow over time, so these render on demand and
 * then cache, rather than being pre-built. `generateStaticParams` is
 * deliberately omitted — a new tag shouldn't need a redeploy to become live.
 */

export async function generateMetadata({
  params,
}: {
  params: { tag: string }
}): Promise<Metadata> {
  const label = formatTag(params.tag)
  return {
    title: label,
    description: `The latest news, reporting and analysis on ${label} from NUR Report.`,
    alternates: { canonical: `/tag/${params.tag}` },
    openGraph: {
      type: 'website',
      title: `${label} | NUR Report`,
      description: `The latest news, reporting and analysis on ${label}.`,
      url: `/tag/${params.tag}`,
    },
  }
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag = params.tag.toLowerCase()
  const articles = await client.fetch(tagArticlesQuery, { topic: tag })

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
        .filter((t: string) => t !== tag)
    )
  ).slice(0, 8) as string[]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="pb-6 mb-8 border-b border-gray-200">
        <p className="text-sm uppercase tracking-wider text-text-muted mb-1">Topic</p>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary">{label}</h1>
        <p className="text-text-secondary mt-2">
          {articles.length} {articles.length === 1 ? 'story' : 'stories'}
        </p>
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
