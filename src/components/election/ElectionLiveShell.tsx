'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ElectionTracker from './ElectionTracker'
import ElectionUpdateFeed from './ElectionUpdateFeed'
import LGAResultsList from './LGAResultsList'

interface ElectionLiveShellProps {
  slug: string
}

export default function ElectionLiveShell({ slug }: ElectionLiveShellProps) {
  const [data, setData] = useState<any>(null)
  const [pulse, setPulse] = useState(false)
  const [error, setError] = useState(false)
  const pulseTimer = useRef<NodeJS.Timeout | null>(null)

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch(`/api/election/results?slug=${slug}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Fetch failed')
      const json = await res.json()
      setData(json)
      setError(false)
      setPulse(true)
      if (pulseTimer.current) clearTimeout(pulseTimer.current)
      pulseTimer.current = setTimeout(() => setPulse(false), 2000)
    } catch (e) {
      console.error('Live shell poll error:', e)
      setError(true)
    }
  }, [slug])

  useEffect(() => {
    fetchResults()
    const interval = setInterval(fetchResults, 15000)
    return () => {
      clearInterval(interval)
      if (pulseTimer.current) clearTimeout(pulseTimer.current)
    }
  }, [fetchResults])

  if (!data && !error) {
    return (
      <div className="space-y-6">
        <div className="bg-surface-card border border-gray-200 rounded-xl p-6 text-center">
          <div className="inline-flex items-center gap-2 text-text-muted text-sm">
            <span className="w-2 h-2 rounded-full bg-brand-700 animate-pulse" />
            Loading live results…
          </div>
        </div>
      </div>
    )}
 }