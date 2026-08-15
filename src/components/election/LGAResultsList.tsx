'use client'

import { useState, useMemo } from 'react'
import LGAResultCard from './LGAResultCard'

interface LGACandidate {
  partyCode: string
  name: string
  color: string
  votes: number
  percentage: number
}

interface LGA {
  slug: string
  name: string
  totalVotes: number
  reportingPercent: number
  candidates: LGACandidate[]
}

interface LGAResultsListProps {
  lgas: LGA[]
}

type SortOption = 'votes-desc' | 'votes-asc' | 'name' | 'leading'

export default function LGAResultsList({ lgas }: LGAResultsListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('votes-desc')

  const filtered = useMemo(() => {
    let result = lgas.filter((lga) =>
      lga.name.toLowerCase().includes(search.toLowerCase())
    )

    switch (sortBy) {
      case 'votes-desc':
        result.sort((a, b) => b.totalVotes - a.totalVotes)
        break
      case 'votes-asc':
        result.sort((a, b) => a.totalVotes - b.totalVotes)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'leading':
        result.sort((a, b) => {
          const aLead = a.candidates[0]?.partyCode || ''
          const bLead = b.candidates[0]?.partyCode || ''
          return aLead.localeCompare(bLead)
        })
        break
    }

    return result
  }, [lgas, search, sortBy])

  return (
    <div className="mt-8">
      <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-700" />
        Local Government Results
        <span className="text-text-muted font-normal normal-case">
          ({filtered.length} of {lgas.length})
        </span>
      </h3>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search LGAs (e.g., Osogbo, Ife...)"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-700"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-brand-700"
        >
          <option value="votes-desc">Most Votes</option>
          <option value="votes-asc">Fewest Votes</option>
          <option value="name">Alphabetical</option>
          <option value="leading">By Leading Party</option>
        </select>
      </div>

      {/* LGA Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
          <p className="text-sm text-text-muted">No LGAs match "{search}"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lga) => (
            <LGAResultCard key={lga.slug} lga={lga} />
          ))}
        </div>
      )}
    </div>
  )
}