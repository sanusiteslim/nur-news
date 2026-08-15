'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface LGACandidate {
  partyCode: string
  name: string
  color: string
  votes: number
  percentage: number
}

interface LGAResultCardProps {
  lga: {
    slug: string
    name: string
    totalVotes: number
    reportingPercent: number
    candidates: LGACandidate[]
  }
}

export default function LGAResultCard({ lga }: LGAResultCardProps) {
  const [open, setOpen] = useState(false)
  const leader = lga.candidates[0]

  return (
    <div className="bg-surface-card border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <h3 className="font-semibold text-text-primary text-sm sm:text-base truncate">
              {lga.name}
            </h3>
            {leader && (
              <span
                className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wide shrink-0"
                style={{ backgroundColor: leader.color }}
              >
                {leader.partyCode} {leader.percentage}%
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            {lga.totalVotes.toLocaleString()} votes · {lga.reportingPercent}% reporting
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {leader && (
            <span className="sm:hidden text-xs font-bold" style={{ color: leader.color }}>
              {leader.partyCode}
            </span>
          )}
          <ChevronDown
            className={`w-5 h-5 text-text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100">
          <div className="pt-3 space-y-3">
            {lga.candidates.map((c) => (
              <div key={c.partyCode} className="space-y-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="font-medium text-text-primary">{c.name}</span>
                    <span
                      className="text-[10px] font-bold px-1 py-0.5 rounded text-white"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.partyCode}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-text-primary tabular-nums">
                      {c.votes.toLocaleString()}
                    </span>
                    <span className="text-text-muted ml-1">({c.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}