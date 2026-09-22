import Link from 'next/link'
import { client, latestBriefsQuery } from '@/lib/sanity'

export const revalidate = 300

export const metadata = {
  title: 'NUR Report Brief',
  description: 'The most important stories from NUR Report.',
}

type BriefSummary = {
  _id: string
  title: string
  slug: {
    current: string
  }
  date: string
  edition?: string
  intro?: string
}

export default async function BriefIndexPage() {
  const briefs: BriefSummary[] = await client.fetch(
    latestBriefsQuery
  )

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          NUR Report
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          The Brief
        </h1>

        <p className="mt-3 max-w-2xl text-gray-600">
          The most important stories, developments and
          updates from NUR Report, brought together in one
          concise briefing.
        </p>
      </header>

      {briefs.length === 0 ? (
        <div className="rounded-xl border p-8 text-gray-600">
          No briefs have been published yet.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {briefs.map((brief) => (
            <Link
              key={brief._id}
              href={`/brief/${brief.slug.current}`}
              className="rounded-xl border p-6 transition hover:shadow-md"
            >
              <p className="text-sm font-medium text-gray-500">
                {new Date(brief.date).toLocaleDateString(
                  'en-NG',
                  {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
                )}
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {brief.title}
              </h2>

              {brief.intro && (
                <p className="mt-3 line-clamp-3 text-gray-600">
                  {brief.intro}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}