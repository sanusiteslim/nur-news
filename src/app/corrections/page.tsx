import Link from 'next/link'
import type { Metadata } from 'next'
import { format } from 'date-fns'
import { client, correctionsQuery } from '@/lib/sanity'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'Corrections',
  description: 'Corrections and clarifications to NUR Report stories, and how to report an error.',
  alternates: { canonical: '/corrections' },
}

export default async function CorrectionsPage() {
  const items: any[] = await client.fetch(correctionsQuery).catch(() => [])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-10 h-1 bg-brand-700 rounded-full mb-4" />
      <h1 className="text-3xl md:text-4xl font-bold text-brand-800 mb-4">Corrections</h1>
      <p className="text-lg text-text-secondary leading-relaxed">
        We correct errors promptly and transparently. Every correction is noted on the story itself and listed here.
        Spotted a mistake? Tell us via our{' '}
        <Link href="/contact" className="text-brand-700 underline underline-offset-2">contact page</Link>. Read more in
        our <Link href="/editorial-standards" className="text-brand-700 underline underline-offset-2">editorial standards</Link>.
      </p>

      <section className="mt-10">
        <h2 className="section-title mb-4">Recent corrections</h2>
        {items.length === 0 ? (
          <p className="text-text-secondary">No corrections have been logged yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 border-y border-gray-200">
            {items.map((a) => (
              <li key={a.slug.current} className="py-4">
                <Link href={`/${a.category}/${a.slug.current}`} className="font-semibold text-text-primary hover:text-brand-700">
                  {a.headline}
                </Link>
                {a.latest && (
                  <p className="text-sm text-text-secondary mt-1">
                    <time dateTime={a.latest.date} className="font-medium text-text-muted">
                      {format(new Date(a.latest.date), 'd MMM yyyy')}:
                    </time>{' '}
                    {a.latest.text}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
