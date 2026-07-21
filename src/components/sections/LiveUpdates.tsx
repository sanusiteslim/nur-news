'use client'

import { formatDistanceToNow } from 'date-fns'

export default function LiveUpdates({ source }: { source: any }) {
  if (!source?.liveUpdates?.length) return null

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="live-dot" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Live Updates</h3>
        <span className="text-xs text-text-muted ml-auto truncate max-w-[200px]">{source.headline}</span>
      </div>
      <div className="space-y-0">
        {source.liveUpdates.map((update: any, i: number) => (
          <div key={i} className="flex gap-4 pb-4 last:pb-0">
            <div className="flex flex-col items-center">
              <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-brand-700' : 'bg-gray-300'}`} />
              {i < source.liveUpdates.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
            </div>
            <div className="pb-4 flex-1">
              <p className="text-xs text-text-muted font-medium">{update.timestamp ? formatDistanceToNow(new Date(update.timestamp), { addSuffix: true }) : 'Recently'}</p>
              <p className="text-sm text-text-primary mt-1 leading-relaxed">{update.updateText}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}