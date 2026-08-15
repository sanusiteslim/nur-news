import { Metadata } from 'next'
import ElectionTracker from '@/components/election/ElectionTracker'
import ElectionUpdateFeed from '@/components/election/ElectionUpdateFeed'
import LGAResults from '@/components/election/LGAResults'

export const metadata: Metadata = {
  title: 'Live Election Results | Osun 2026 | NURR',
  description: 'Real-time Osun State governorship election results by local government area.',
}

export const dynamic = 'force-dynamic'

export default async function LivePage() {
  const slug = 'osun-2026-governorship'

  // Fetch initial data server-side for SEO/skeleton
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/election/results?slug=${slug}&lgas=true`, {
    cache: 'no-store',
  })

  const data = res.ok ? await res.json() : null

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
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

      {/* Statewide Tracker (Client-side polling) */}
      <ElectionTracker slug={slug} initialData={data} />

      {/* Update Feed */}
      {data?.updates && data.updates.length > 0 && (
        <div className="mt-6">
          <ElectionUpdateFeed updates={data.updates} />
        </div>
      )}

      {/* LGA Breakdown */}
      {data?.lgas && (
        <LGAResults lgas={data.lgas} />
      )}
    </main>
  )
}