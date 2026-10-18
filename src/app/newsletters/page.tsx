import Link from 'next/link'
import type { Metadata } from 'next'
import { NEWSLETTER_LISTS } from '@/lib/newsletter'
import { client, latestBriefsQuery } from '@/lib/sanity'
import NewsletterSignup from '@/components/opinion/NewsletterSignup'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Newsletters',
  description: 'Free email newsletters from NUR Report: the Daily Brief every weekday evening and the Weekend Digest every Saturday.',
  alternates: { canonical: '/newsletters' },
}

export default async function NewslettersPage() {
  const briefs: any[] = await client.fetch(latestBriefsQuery).catch(() => [])
  const recent = briefs.slice(0, 6)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <header className="max-w-2xl">
        <div className="w-10 h-1 bg-brand-700 rounded-full mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary">Newsletters</h1>
        <p className="text-lg text-text-secondary mt-3">
          Independent reporting on Nigeria, Africa and the world — free, in your inbox. Pick one or both, and change
          your mind any time from the link in every email.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {NEWSLETTER_LISTS.map((l) => (
          <section key={l.id} className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">{l.cadence}</p>
            <h2 className="text-xl font-bold text-text-primary mt-1">{l.name}</h2>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">{l.description}</p>
          </section>
        ))}
      </div>

      <div className="mt-8 max-w-xl">
        <NewsletterSignup source="newsletters-hub" showListChoice />
      </div>

      {recent.length > 0 && (
        <section className="mt-14">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="section-title">Recent issues</h2>
            <Link href="/brief" className="text-sm font-medium text-brand-700 hover:underline">
              All issues →
            </Link>
          </div>
          <ul className="divide-y divide-gray-200 border-y border-gray-200">
            {recent.map((b) => (
              <li key={b._id}>
                <Link href={`/brief/${b.slug.current}`} className="group flex items-baseline justify-between gap-4 py-4">
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                      {b.list === 'weekly' ? 'Weekend Digest' : 'Daily Brief'} ·{' '}
                      {new Date(b.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="block font-semibold text-text-primary group-hover:text-brand-700 transition-colors mt-0.5">
                      {b.title}
                    </span>
                    {b.intro && <span className="block text-sm text-text-secondary mt-1 line-clamp-2">{b.intro}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
