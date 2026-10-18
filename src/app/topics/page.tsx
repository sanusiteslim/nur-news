import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { client, topicsIndexQuery } from '@/lib/sanity'
import { urlForImage } from '@/lib/image'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'Topics',
  description: 'Explainers, timelines and every story on the subjects NUR Report follows most closely.',
  alternates: { canonical: '/topics' },
}

export default async function TopicsPage() {
  const topics: any[] = await client.fetch(topicsIndexQuery).catch(() => [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-text-primary">Topics</h1>
      <p className="text-text-secondary mt-2 mb-10 max-w-2xl">
        The running stories we follow most closely — each with an explainer, a timeline and every report in one place.
        Looking for something else? <Link href="/tag" className="text-brand-700 hover:underline">Browse all tags</Link>.
      </p>

      {topics.length === 0 ? (
        <p className="text-text-secondary">No topic hubs yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((t) => (
            <Link key={t.slug.current} href={`/topics/${t.slug.current}`} className="group block">
              <article className="h-full bg-surface-card rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                <div className="relative aspect-[16/9] bg-brand-100">
                  {t.heroImage?.asset ? (
                    <Image
                      src={urlForImage(t.heroImage).width(600).height(338).url()}
                      alt={t.heroImage.alt || t.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                      <span className="text-brand-800 font-bold text-2xl">{t.title}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-bold text-text-primary group-hover:text-brand-700 transition-colors">{t.title}</h2>
                  {t.summary && <p className="text-sm text-text-secondary mt-1 line-clamp-2">{t.summary}</p>}
                  <p className="text-xs text-text-muted mt-3">
                    {t.count} {t.count === 1 ? 'story' : 'stories'}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
