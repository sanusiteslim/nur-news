'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Candidate {
  partyCode: string
  name: string
  color: string
  imageUrl?: string
  votes: number
  percentage: number
}

interface ElectionData {
  title: string
  subtitle?: string
  totalVotes: number
  reportingPercent: number
  lastUpdated: number
  candidates: Candidate[]
}

export default function ElectionTracker({ slug }: { slug: string }) {
  const [data, setData] = useState<ElectionData | null>(null)
  const [pulse, setPulse] = useState(false)
  const [stale, setStale] = useState(false)
  const [error, setError] = useState(false)
  const pulseTimer = useRef<NodeJS.Timeout | null>(null)
  const staleTimer = useRef<NodeJS.Timeout | null>(null)

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch(`/api/election/results?slug=${slug}`, {
        cache: 'no-store',
      })

      if (!res.ok) throw new Error('Fetch failed')

      const json = await res.json()
      setData(json)
      setError(false)
      setStale(false)

      // Visual pulse
      setPulse(true)
      if (pulseTimer.current) clearTimeout(pulseTimer.current)
      pulseTimer.current = setTimeout(() => setPulse(false), 2000)

      // Stale detection: if no fetch in 45s, mark stale
      if (staleTimer.current) clearTimeout(staleTimer.current)
      staleTimer.current = setTimeout(() => setStale(true), 45000)
    } catch (e) {
      console.error('Election poll error:', e)
      setError(true)
    }
  }, [slug])

  useEffect(() => {
    fetchResults()
    const interval = setInterval(fetchResults, 15000)
    return () => {
      clearInterval(interval)
      if (pulseTimer.current) clearTimeout(pulseTimer.current)
      if (staleTimer.current) clearTimeout(staleTimer.current)
    }
  }, [fetchResults])

  if (!data && !error) {
    return (
      <div className="bg-surface-card border border-gray-200 rounded-xl p-6 text-center">
        <div className="inline-flex items-center gap-2 text-text-muted text-sm">
          <span className="w-2 h-2 rounded-full bg-brand-700 animate-pulse" />
          Loading live results…
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="bg-surface-card border border-gray-200 rounded-xl p-6 text-center">
        <p className="text-sm text-accent-red font-medium">Unable to load results.</p>
        <button
          onClick={fetchResults}
          className="mt-2 text-sm text-brand-700 font-medium hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  const leader = data.candidates[0]

  return (
    <div className="bg-surface-card border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
              {data.title}
            </h2>
            {data.subtitle && (
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">{data.subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`h-2 w-2 rounded-full ${
                pulse ? 'bg-brand-700 animate-ping' : 'bg-brand-700'
              }`}
            />
            <span className="text-xs font-medium text-text-secondary">LIVE</span>
          </div>
        </div>
        {stale && (
          <p className="mt-2 text-xs text-accent-red">
            Connection unstable. Results may be delayed.
          </p>
        )}
      </div>

      {/* Candidates */}
      <div className="px-5 py-5 sm:px-6 space-y-5">
        {data.candidates.map((c, i) => (
          <div key={c.partyCode} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                {c.imageUrl && (
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                  />
                )}
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-bold text-white shrink-0"
                  style={{ backgroundColor: c.color }}
                >
                  {c.partyCode}
                </span>
                <span className="font-semibold text-text-primary truncate">
                  {c.name}
                </span>
                {i === 0 && (
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700 uppercase tracking-wide">
                    Leading
                  </span>
                )}
              </div>
              <div className="text-right shrink-0 ml-3">
                <span className="block font-bold text-text-primary tabular-nums">
                  {c.votes.toLocaleString()}
                </span>
                <span className="block text-xs text-text-muted tabular-nums">
                  {c.percentage}%
                </span>
              </div>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 sm:px-6 bg-surface-offwhite border-t border-gray-100 flex items-center justify-between text-[11px] sm:text-xs text-text-muted">
        <span>
          {data.totalVotes.toLocaleString()} votes · {data.reportingPercent}% PU reporting
        </span>
        <span>
          {data.lastUpdated
            ? new Date(data.lastUpdated * 1000).toLocaleTimeString('en-NG', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '--:--'}
        </span>
      </div>
    </div>
  )
}