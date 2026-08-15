'use client'

import { formatDistanceToNow } from 'date-fns'

interface Update {
  timestamp: string
  text: string
  isBreaking: boolean
}

export default function ElectionUpdateFeed({ updates }: { updates: Update[] }) {
  if (!updates || updates.length === 0) return null

  return (
    <div className="mt-6 bg-surface-card border border-gray-200 rounded-xl p-5 sm:p-6">
      <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-700" />
        Live Updates
      </h3>

      <div className="space-y-4">
        {updates.map((u, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  u.isBreaking ? 'bg-accent-red' : 'bg-gray-300'
                }`}
              />
              {i < updates.length - 1 && (
                <div className="w-px flex-1 bg-gray-200 mt-1" />
              )}
            </div>
            <div className="pb-4">
              <p className="text-xs text-text-muted mb-0.5">
                {u.timestamp
                  ? formatDistanceToNow(new Date(u.timestamp), { addSuffix: true })
                  : ''}
              </p>
              <p className={`text-sm ${u.isBreaking ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                {u.isBreaking && (
                  <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-red text-white uppercase tracking-wide">
                    Breaking
                  </span>
                )}
                {u.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}