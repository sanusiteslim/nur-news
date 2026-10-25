'use client'

import { useState } from 'react'
import OpinionListItem from './OpinionListItem'

export default function OpinionFeed({
  category,
  initialArticles,
  initialHasMore,
  initialOffset,
  pageSize = 10,
  kicker = 'Opinion',
  showQuoteBadge = true,
}: {
  category: string
  initialArticles: any[]
  initialHasMore: boolean
  initialOffset: number
  pageSize?: number
  kicker?: string
  showQuoteBadge?: boolean
}) {
  const [articles, setArticles] = useState(initialArticles)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [offset, setOffset] = useState(initialOffset)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const loadMore = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/category/${category}?offset=${offset}&limit=${pageSize}`)
      if (!res.ok) throw new Error('Failed to load more')
      const data = await res.json()
      setArticles((prev) => [...prev, ...data.articles])
      setOffset((prev) => prev + data.articles.length)
      setHasMore(data.hasMore)
    } catch (err) {
      console.error(`Failed to load more ${category} articles:`, err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {articles.map((article) => (
        <OpinionListItem key={article.slug.current} article={article} kicker={kicker} showQuoteBadge={showQuoteBadge} />
      ))}

      {error && <p className="text-sm text-accent-red text-center mt-6">Couldn&apos;t load more. Try again.</p>}

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Show more'}
          </button>
        </div>
      )}
    </div>
  )
}
