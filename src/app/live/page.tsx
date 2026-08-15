'use client'

import { useState, useEffect } from 'react'
import ElectionTracker from '@/components/election/ElectionTracker'
import ElectionUpdateFeed from '@/components/election/ElectionUpdateFeed'
import LGAResults from '@/components/election/LGAResults'

export default function LivePage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/election/results?slug=osun-2026-governorship&lgas=true', {
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error)
        setData(json)
        setError(false)
      })
      .catch(() => setError(true))
  }, [])

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-accent-red font-medium">Unable to load election data.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-brand-700 font-medium hover:underline"
        >
          Retry
        </button>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center gap-2 text-text-muted text-sm">
          <span className="w-2 h-2 rounded-full bg-brand-700 animate-pulse" />
          Loading election data…
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-red text-white uppercase tracking-wide">
            Live
          </span>
          <span className="text-xs text-text-muted">Last updated from INEC</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          Osun Governorship Election 2026
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Real-time results across all 30 local government areas.
        </p>
      </div>

      <ElectionTracker slug="osun-2026-governorship" initialData={data} />

      {data?.updates && data.updates.length > 0 && (
        <div className="mt-6">
          <ElectionUpdateFeed updates={data.updates} />
        </div>
      )}

      {data?.lgas && <LGAResults lgas={data.lgas} />}
    </main>
  )
}