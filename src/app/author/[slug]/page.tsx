import { client, authorQuery, authorArticlesQuery, allAuthorSlugsQuery } from '@/lib/sanity'
import { urlForImage } from '@/lib/image'
import { getSiteUrl } from '@/lib/site'
import ArticleCard from '@/components/ui/ArticleCard'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 60

/**
 * Pre-build a page for every author so they're crawlable immediately.
 * Authors are added rarely, so this list is cheap and stays small.
 */
export async function generateStaticParams() {
  try {
    const slugs: string[] = await client.fetch(allAuthorSlugsQuery)
    return (slugs || []).map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const author = await client.fetch(authorQuery, { slug: params.slug })
  if (!author) return { title: 'Author Not Found' }

  const description =
    author.bio || `Articles and reporting by ${author.name}${author.role ? `, ${author.role}` : ''} at NUR Report.`

  return {
    title: author.name,
    description,
    alternates: { canonical: `/author/${params.slug}` },
    openGraph: {
      type: 'profile',
      title: author.name,
      description,
      url: `/author/${params.slug}`,
      images: author.photo
        ? [{ url: urlForImage(author.photo).width(1200).height(630).url() }]
        : undefined,
    },
  }
}

export default async function AuthorPage({ params }: { params: { slug: string } }) {
  const author = await client.fetch(authorQuery, { slug: params.slug })
  if (!author) return notFound()

  const articles = await client.fetch(authorArticlesQuery, { slug: params.slug })

  // Person schema ties every byline on the site back to a real, described
  // human. This is one of the signals Google News weighs when assessing
  // whether a publication has accountable authorship.
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: `${getSiteUrl()}/author/${params.slug}`,
    ...(author.role && { jobTitle: author.role }),
    ...(author.bio && { description: author.bio }),
    ...(author.photo && { image: urlForImage(author.photo).width(400).height(400).url() }),
    ...(author.twitter && { sameAs: [`https://x.com/${author.twitter.replace(/^@/, '')}`] }),
    worksFor: { '@type': 'NewsMediaOrganization', name: 'NUR Report' },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      {/* Profile header */}
      <header className="flex flex-col sm:flex-row gap-6 items-start pb-8 mb-8 border-b border-gray-200">
        {author.photo && (
          <Image
            src={urlForImage(author.photo).width(160).height(160).url()}
            alt={author.name}
            width={120}
            height={120}
            className="rounded-full flex-shrink-0"
          />
        )}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">{author.name}</h1>
          {(author.role || author.state) && (
            <p className="text-brand-700 font-medium mt-1">
              {[author.role, author.state].filter(Boolean).join(' · ')}
            </p>
          )}
          {author.bio && (
            <p className="text-text-secondary mt-4 max-w-2xl leading-relaxed">{author.bio}</p>
          )}

          <div className="flex items-center gap-4 mt-4 text-sm">
            {author.twitter && (
              <a
                href={`https://x.com/${author.twitter.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-700 hover:text-brand-800 font-medium"
              >
                @{author.twitter.replace(/^@/, '')}
              </a>
            )}
            {author.email && (
              <a
                href={`mailto:${author.email}`}
                className="text-brand-700 hover:text-brand-800 font-medium"
              >
                Email
              </a>
            )}
          </div>
        </div>
      </header>

      <h2 className="section-title mb-6">
        {articles.length > 0
          ? `${articles.length} ${articles.length === 1 ? 'Story' : 'Stories'}`
          : 'Stories'}
      </h2>

      {articles.length === 0 ? (
        <p className="text-text-secondary">No published stories yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: any) => (
            <ArticleCard key={article.slug.current} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
