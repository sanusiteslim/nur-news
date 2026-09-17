import { client, allTagsQuery } from '@/lib/sanity'
import { formatTag } from '@/lib/taxonomy'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Topics',
  description: 'Browse every topic NUR Report covers, from Nigerian politics to world sport.',
  alternates: { canonical: '/tag' },
}

export default async function TagsIndexPage() {
  let tags: string[] = []
  try {
    tags = (await client.fetch<string[]>(allTagsQuery)) || []
  } catch (err) {
    console.error('TagsIndexPage fetch failed:', err)
  }

  // Sort by display label so the A–Z reads naturally, rather than by the
  // underlying slug (which would put "us-israel-iran-war" under U, not "US").
  const sorted = [...tags].sort((a, b) => formatTag(a).localeCompare(formatTag(b)))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">Topics</h1>
      <p className="text-text-secondary mb-10 max-w-2xl">
        Every subject we&apos;re actively covering. Follow a topic to catch up on the full thread of
        a story.
      </p>

      {sorted.length === 0 ? (
        <p className="text-text-secondary">No topics yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {sorted.map((tag) => (
            <Link
              key={tag}
              href={`/tag/${tag}`}
              className="px-4 py-2 bg-brand-50 text-brand-800 rounded-full hover:bg-brand-100 transition-colors font-medium"
            >
              {formatTag(tag)}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
