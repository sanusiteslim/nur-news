import { cache } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { format } from 'date-fns'
import { client, topicQuery, topicArticlesQuery } from '@/lib/sanity'
import { urlForImage } from '@/lib/image'
import { getSiteUrl } from '@/lib/site'
import { formatTag } from '@/lib/taxonomy'
import { jsonLdString, collectionPageJsonLd } from '@/lib/jsonld'
import ArticleCard from '@/components/ui/ArticleCard'
import NewsletterSignup from '@/components/opinion/NewsletterSignup'

export const revalidate = 300

type Params = { params: { slug: string } }

// Rendered on first visit, then cached until revalidated (ISR), instead of
// a fresh server render on every view.
export function generateStaticParams() {
  return []
}

const getTopic = cache((slug: string) => client.fetch(topicQuery, { slug }))

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const topic = await getTopic(params.slug)
  if (!topic) return { title: 'Topic not found' }
  const description = topic.seo?.metaDescription || topic.summary || `Everything NUR Report has published on ${topic.title}.`
  const image = topic.seo?.ogImage?.asset ? topic.seo.ogImage : topic.heroImage
  const og = image?.asset ? urlForImage(image).width(1200).height(630).fit('crop').format('jpg').quality(80).url() : undefined
  return {
    title: topic.seo?.metaTitle || `${topic.title}: latest news and explainer`,
    description,
    alternates: { canonical: `/topics/${topic.slug.current}` },
    robots: topic.seo?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      title: topic.title,
      description,
      url: `/topics/${topic.slug.current}`,
      images: og ? [{ url: og, width: 1200, height: 630 }] : undefined,
    },
  }
}

export default async function TopicPage({ params }: Params) {
  const topic = await getTopic(params.slug)
  if (!topic) return notFound()

  const tags: string[] = (topic.tags || []).map((t: string) => t.toLowerCase())
  const articles: any[] = tags.length ? await client.fetch(topicArticlesQuery, { tags }) : []

  const pinnedSlugs = new Set((topic.pinned || []).map((a: any) => a.slug.current))
  const latest = articles.filter((a) => !pinnedSlugs.has(a.slug.current))
  const site = getSiteUrl()

  const graph: any[] = [
    collectionPageJsonLd({
      name: topic.title,
      description: topic.summary,
      path: `/topics/${topic.slug.current}`,
      urls: articles.map((a) => `${site}/${a.category}/${a.slug.current}`),
    }),
  ]
  if (topic.faq?.length) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: topic.faq.map((f: any) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {graph.map((g, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(g) }} />
      ))}

      <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8 mb-8 border-b border-gray-200">
        <div className="lg:col-span-7">
          <p className="text-sm uppercase tracking-wider text-brand-700 font-semibold mb-2">Topic</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary leading-tight">{topic.title}</h1>
          {topic.summary && <p className="text-lg text-text-secondary mt-4">{topic.summary}</p>}
          {topic.intro?.length > 0 && (
            <div className="mt-6 text-text-primary leading-relaxed">
              <PortableText
                value={topic.intro}
                components={{
                  block: {
                    normal: ({ children }: any) => <p className="mb-4">{children}</p>,
                    h3: ({ children }: any) => <h3 className="text-lg font-bold mt-6 mb-2">{children}</h3>,
                  },
                }}
              />
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-6">
            {tags.map((t) => (
              <Link key={t} href={`/tag/${t}`} className="px-3 py-1.5 bg-brand-50 text-brand-800 text-sm rounded-full hover:bg-brand-100 transition-colors">
                {formatTag(t)}
              </Link>
            ))}
          </div>
        </div>
        {topic.heroImage?.asset && (
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src={urlForImage(topic.heroImage).width(800).height(600).url()}
                alt={topic.heroImage.alt || topic.title}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}
      </header>

      {topic.pinned?.length > 0 && (
        <section className="mb-12">
          <h2 className="section-title mb-4">Start here</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topic.pinned.map((a: any) => (
              <ArticleCard key={a.slug.current} article={a} />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <section className="lg:col-span-8">
          <h2 className="section-title mb-4">Latest</h2>
          {latest.length === 0 ? (
            <p className="text-text-secondary">No stories yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {latest.map((a) => (
                <ArticleCard key={a.slug.current} article={a} />
              ))}
            </div>
          )}
        </section>

        <aside className="lg:col-span-4 space-y-10">
          {topic.timeline?.length > 0 && (
            <section>
              <h2 className="section-title mb-4">Timeline</h2>
              <ol className="relative border-l-2 border-brand-100 ml-1.5 space-y-5">
                {topic.timeline.map((e: any, i: number) => (
                  <li key={i} className="pl-5 relative">
                    <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-brand-700" aria-hidden="true" />
                    <time className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                      {format(new Date(e.date), 'd MMM yyyy')}
                    </time>
                    {e.article?.slug?.current ? (
                      <Link href={`/${e.article.category}/${e.article.slug.current}`} className="text-sm text-text-primary hover:text-brand-700">
                        {e.text}
                      </Link>
                    ) : (
                      <p className="text-sm text-text-primary">{e.text}</p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {topic.faq?.length > 0 && (
            <section>
              <h2 className="section-title mb-4">Questions</h2>
              <div className="divide-y divide-gray-200 border-y border-gray-200">
                {topic.faq.map((f: any, i: number) => (
                  <details key={i} className="group py-3">
                    <summary className="cursor-pointer list-none font-semibold text-text-primary flex justify-between gap-3">
                      {f.question}
                      <span className="text-brand-700 group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                    </summary>
                    <p className="text-sm text-text-secondary mt-2 leading-relaxed">{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <NewsletterSignup source={`topic-${topic.slug.current}`} />
        </aside>
      </div>
    </div>
  )
}
