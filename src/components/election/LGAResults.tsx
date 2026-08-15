'use client'

import { useState, useMemo } from 'react'

interface Candidate {
  partyCode: string
  partyName: string
  partyFlagUrl?: string
  name: string
  color: string
  votes: number
  percentage: number
}

interface LGAResult {
  votes: Record<string, number>
  totalVotes: number
  reportingPercent: number
  candidates: Candidate[]
}

interface LGAResultsProps {
  lgas: Record<string, LGAResult>
}

export default function LGAResults({ lgas }: LGAResultsProps) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'leading-apc' | 'leading-pdp' | 'leading-other'>('all')

  const lgaList = useMemo(() => {
    let list = Object.entries(lgas).map(([name, data]) => ({
      name,
      ...data,
      leader: data.candidates[0]?.partyCode || '',
    }))

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((l) => l.name.toLowerCase().includes(q))
    }

    if (filter === 'leading-apc') list = list.filter((l) => l.leader === 'APC')
    if (filter === 'leading-pdp') list = list.filter((l) => l.leader === 'PDP')
    if (filter === 'leading-other') {
      list = list.filter((l) => l.leader && l.leader !== 'APC' && l.leader !== 'PDP')
    }

    return list
  }, [lgas, search, filter])

  const toggleExpand = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div className="mt-8">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-700" />
          Local Government Results
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search LGAs..."
            className="w-full sm:w-56 border border-gray-300 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-700"
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All LGAs' },
          { key: 'leading-apc', label: 'Leading APC' },
          { key: 'leading-pdp', label: 'Leading PDP' },
          { key: 'leading-other', label: 'Leading Other' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-brand-700 text-white'
                : 'bg-gray-100 text-text-muted hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LGA Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lgaList.map((lga) => {
          const isExpanded = expanded.has(lga.name)
          const topTwo = lga.candidates.slice(0, 2)
          const leader = lga.candidates[0]

          return (
            <div
              key={lga.name}
              className="bg-surface-card border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-text-primary text-sm">{lga.name}</h4>
                <span className="text-[11px] text-text-muted">{lga.reportingPercent}% reporting</span>
              </div>

              {/* Mini bars for top 2 */}
              {topTwo.length > 0 && (
                <div className="space-y-2 mb-3">
                  {topTwo.map((c) => (
                    <div key={c.partyCode} className="flex items-center gap-2">
                      {c.partyFlagUrl ? (
                             <img src={c.partyFlagUrl} alt="" className="w-4 h-4 rounded object-cover shrink-0 bg-white border border-gray-200" />
                          ) : (
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                            )}
                      <div className="flex-1 min-w-0">
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${lga.totalVotes > 0 ? (c.votes / lga.totalVotes) * 100 : 0}%`,
                              backgroundColor: c.color,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-[11px] text-text-muted tabular-nums shrink-0">
                        {c.votes.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Leader badge */}
              {leader && (
                <div className="flex items-center gap-1.5 mb-3">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: leader.color }}
                  />
                  <span className="text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">{leader.name}</span> leading with{' '}
                    {leader.votes.toLocaleString()} votes
                  </span>
                </div>
              )}

              {/* See Details Toggle */}
              <button
                onClick={() => toggleExpand(lga.name)}
                className="w-full text-center text-xs font-medium text-brand-700 hover:text-brand-800 py-2 border-t border-gray-100 transition-colors"
              >
                {isExpanded ? 'Hide details' : 'See details'}
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                  {lga.candidates.map((c) => (
                    <div key={c.partyCode} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">
                          <span className="font-semibold" style={{ color: c.color }}>
                            {c.partyName || c.partyCode}
                          </span>{' '}
                          {c.name}
                        </span>
                        <span className="text-text-primary font-medium tabular-nums">
                          {c.votes.toLocaleString()} ({c.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 text-[11px] text-text-muted text-center">
                    Total votes: {lga.totalVotes.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {lgaList.length === 0 && (
        <div className="text-center py-12 text-text-muted text-sm">
          No LGAs match your search.
        </div>
      )}
    </div>
  )
}