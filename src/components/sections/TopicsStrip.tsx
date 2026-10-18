import Link from 'next/link'
import { client, topicsIndexQuery } from '@/lib/sanity'

/** "In focus" row of topic hubs. Renders nothing until hubs exist in Sanity. */
export default async function TopicsStrip() {
  const topics: any[] = await client.fetch(topicsIndexQuery).catch(() => [])
  const shown = topics.filter((t) => t.count > 0).slice(0, 8)
  if (shown.length === 0) return null

  return (
    <div className="border-y border-gray-200 py-4">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        <span className="section-title flex-shrink-0">In focus</span>
        {shown.map((t) => (
          <Link
            key={t.slug.current}
            href={`/topics/${t.slug.current}`}
            className="flex-shrink-0 px-3 py-1.5 bg-brand-50 text-brand-800 text-sm font-medium rounded-full hover:bg-brand-100 transition-colors"
          >
            {t.title}
          </Link>
        ))}
        <Link href="/topics" className="flex-shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-800 ml-auto pl-2">
          All topics →
        </Link>
      </div>
    </div>
  )
}
