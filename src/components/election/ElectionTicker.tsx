'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

interface Candidate {
  partyCode: string
  partyName?: string
  color: string
  votes: number
}

interface LGAData {
  name: string
  totalVotes: number
  reportingPercent: number
  candidates: Candidate[]
}

interface ElectionData {
  title: string
  totalVotes: number
  reportingPercent: number
  lastUpdated: number
  candidates: Candidate[]
  updates?: { timestamp: string; text: string; isBreaking: boolean }[]
  lgas?: Record<string, LGAData>
}

const SLUG = 'osun-2026-governorship'
const POLL_MS = 30000
const ROTATE_MS = 5000

export default function ElectionTicker() {
  const [data, setData] = useState<ElectionData | null>(null)
  const [slide, setSlide] = useState(0)
  const [hidden, setHidden] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const timer = useRef<NodeJS.Timeout | null>(null)

  // Check localStorage dismissal (expires after 1 hour)
  useEffect(() => {
    const raw = localStorage.getItem('election_ticker_dismissed')
    if (raw) {
      const ts = parseInt(raw, 10)
      if (Date.now() - ts < 3600000) setDismissed(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem('election_ticker_dismissed', Date.now().toString())
    setDismissed(true)
  }

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/election/results?slug=${SLUG}&lgas=true`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Fetch failed')
      const json = await res.json()
      setData(json)
    } catch {
      // Silently fail — ticker hides itself if no data
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, POLL_MS)
    return () => clearInterval(interval)
  }, [fetchData])

  // Auto-rotate slides
  useEffect(() => {
    if (!data) return
    timer.current = setInterval(() => {
      setSlide((s) => (s + 1) % 3)
    }, ROTATE_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [data])

  // Reset slide index when data changes
  useEffect(() => {
    setSlide(0)
  }, [data?.lastUpdated])

  if (dismissed || !data || data.reportingPercent === 0) return null

  // Filter LGAs with actual data, sort by total votes
  const activeLgas = Object.entries(data.lgas || {})
    .filter(([, d]) => d.reportingPercent > 0)
    .sort(([, a], [, b]) => b.totalVotes - a.totalVotes)
    .slice(0, 4)

  const topStateCandidates = data.candidates.slice(0, 3)

  return (
    <div className="relative bg-brand-700 text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-12 sm:h-14">
          {/* Live badge */}
          <div className="flex items-center gap-1.5 shrink-0 mr-3 sm:mr-4">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">
              Live
            </span>
          </div>

          {/* Slides */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${slide * 100}%)` }}
            >
              {/* Slide 0: Statewide */}
              <div className="w-full shrink-0 flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar">
                <span className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                  {data.title}
                </span>
                <span className="hidden sm:inline text-brand-200">|</span>
                <div className="flex items-center gap-3 sm:gap-4">
                  {topStateCandidates.map((c) => (
                    <div key={c.partyCode} className="flex items-center gap-1.5 whitespace-nowrap">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/30"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-[11px] sm:text-xs font-medium">
                        {c.partyCode}{' '}
                        <span className="tabular-nums">{c.votes.toLocaleString()}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <span className="hidden sm:inline text-brand-200">|</span>
                <span className="text-[11px] sm:text-xs text-brand-100 whitespace-nowrap">
                  {data.reportingPercent}% reporting
                </span>
              </div>

              {/* Slide 1: Top LGAs */}
              <div className="w-full shrink-0 flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-200 shrink-0">
                  Top LGAs
                </span>
                {activeLgas.map(([name, lga]) => {
                  const leader = lga.candidates[0]
                  return (
                    <div
                      key={name}
                      className="flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span className="text-[11px] sm:text-xs font-medium">{name}:</span>
                      {leader && (
                        <>
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: leader.color }}
                          />
                          <span className="text-[11px] sm:text-xs">
                            {leader.partyCode || leader.partyCode}{' '}
                            <span className="tabular-nums font-semibold">
                              {leader.votes.toLocaleString()}
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Slide 2: Latest update */}
              <div className="w-full shrink-0 flex items-center gap-3 overflow-x-auto no-scrollbar">
                {data.updates && data.updates.length > 0 ? (
                  <>
                    {data.updates[0].isBreaking && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-red text-white uppercase tracking-wide shrink-0">
                        Breaking
                      </span>
                    )}
                    <span className="text-xs sm:text-sm truncate">
                      {data.updates[0].text}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-brand-200">Awaiting updates…</span>
                )}
              </div>
            </div>
          </div>

          {/* CTA + Dismiss */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3 sm:ml-4">
            <Link
              href="/live"
              className="hidden sm:inline-flex items-center text-[11px] font-medium text-white hover:text-brand-100 underline underline-offset-2 transition-colors"
            >
              View Results →
            </Link>
            <button
              onClick={dismiss}
              aria-label="Dismiss ticker"
              className="text-brand-200 hover:text-white transition-colors p-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Slide indicators (mobile only) */}
      <div className="sm:hidden absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-0.5 rounded-full transition-all duration-300 ${
              slide === i ? 'w-3 bg-white' : 'w-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}