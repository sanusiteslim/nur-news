'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type Candidate = {
  partyCode: string
  partyName?: string
  partyFlagUrl?: string
  name: string
  color: string
  imageUrl?: string
  votes: number
  percentage: number
}

type LGA = { votes: Record<string, number>; totalVotes: number; reportingPercent: number; candidates: Candidate[] }

export type ElectionResultsData = {
  title: string
  subtitle?: string
  totalVotes: number
  reportingPercent: number
  lastUpdated: number
  candidates: Candidate[]
  lgas?: Record<string, LGA>
}

const POLL_MS = 20_000
const nf = new Intl.NumberFormat('en-NG')

type SortKey = 'name' | 'reporting' | 'total' | 'margin'

/**
 * Election results module for a live page: statewide totals, a tile grid of
 * every LGA coloured by who leads, and a sortable results table. One poll of
 * the CDN-cached results endpoint feeds all three.
 */
export default function ElectionLive({
  slug,
  initial,
  isLive,
}: {
  slug: string
  initial: ElectionResultsData
  isLive: boolean
}) {
  const [data, setData] = useState<ElectionResultsData>(initial)
  const [selected, setSelected] = useState<string | null>(null)
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'name', dir: 1 })
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)

  const poll = useCallback(async () => {
    if (document.visibilityState !== 'visible') return
    try {
      const res = await fetch(`/api/election/results?slug=${encodeURIComponent(slug)}&lgas=true`)
      if (res.ok) setData(await res.json())
    } catch {
      /* keep last good data */
    }
  }, [slug])

  useEffect(() => {
    if (!isLive) return
    const id = setInterval(poll, POLL_MS)
    return () => clearInterval(id)
  }, [poll, isLive])

  const lgas = useMemo(
    () =>
      Object.entries(data.lgas || {}).map(([name, l]) => {
        const [first, second] = l.candidates || []
        const reported = l.reportingPercent > 0 && l.totalVotes > 0
        return {
          name,
          ...l,
          reported,
          leader: reported ? first : undefined,
          margin: reported && first ? first.percentage - (second?.percentage || 0) : 0,
        }
      }),
    [data.lgas]
  )

  const reportedCount = lgas.filter((l) => l.reported).length
  const leader = data.candidates[0]
  const selectedLga = lgas.find((l) => l.name === selected)

  const table = useMemo(() => {
    const q = search.trim().toLowerCase()
    const rows = lgas.filter((l) => !q || l.name.toLowerCase().includes(q))
    const val = (l: (typeof rows)[number]) =>
      sort.key === 'name' ? l.name : sort.key === 'reporting' ? l.reportingPercent : sort.key === 'total' ? l.totalVotes : l.margin
    return [...rows].sort((a, b) => {
      // Declared LGAs always come before ones still awaiting results.
      if (a.reported !== b.reported) return a.reported ? -1 : 1
      const x = val(a)
      const y = val(b)
      return (typeof x === 'string' ? x.localeCompare(y as string) : (x as number) - (y as number)) * sort.dir
    })
  }, [lgas, search, sort])

  const sortBy = (key: SortKey) =>
    setSort((cur) => (cur.key === key ? { key, dir: (cur.dir * -1) as 1 | -1 } : { key, dir: key === 'name' ? 1 : -1 }))

  const SortHeader = ({ k, label, className = '' }: { k: SortKey; label: string; className?: string }) => (
    <th scope="col" className={`py-2 px-3 font-semibold ${className}`}>
      <button onClick={() => sortBy(k)} className="inline-flex items-center gap-1 hover:text-brand-700">
        {label}
        <span className="text-[10px] text-text-muted" aria-hidden="true">
          {sort.key === k ? (sort.dir === 1 ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  )

  return (
    <section className="mb-10 rounded-xl border border-gray-200 bg-white p-4 sm:p-6" aria-label="Election results">
      {/* Statewide summary */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-text-primary">{data.title}</h2>
          {data.subtitle && <p className="text-sm text-text-secondary">{data.subtitle}</p>}
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="block text-2xl font-bold text-text-primary">
              {reportedCount}
              <span className="text-base text-text-muted">/{lgas.length || 30}</span>
            </span>
            <span className="text-xs uppercase tracking-wider text-text-muted">LGAs reported</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-text-primary">{nf.format(data.totalVotes)}</span>
            <span className="text-xs uppercase tracking-wider text-text-muted">Votes counted</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.candidates.map((c, i) => (
          <div key={c.partyCode} className="flex items-center gap-3">
            {c.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.imageUrl} alt="" className="h-10 w-10 flex-shrink-0 rounded-full object-cover bg-gray-100" />
            ) : (
              <span className="h-10 w-10 flex-shrink-0 rounded-full" style={{ backgroundColor: c.color }} aria-hidden="true" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-semibold text-text-primary">
                  {c.name} <span className="font-normal text-text-muted">· {c.partyCode}</span>
                  {i === 0 && data.totalVotes > 0 && (
                    <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-800">Leading</span>
                  )}
                </span>
                <span className="text-sm font-bold tabular-nums text-text-primary">{c.percentage.toFixed(1)}%</span>
              </div>
              <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, c.percentage)}%`, backgroundColor: c.color }} />
              </div>
              <span className="text-xs text-text-muted tabular-nums">{nf.format(c.votes)} votes</span>
            </div>
          </div>
        ))}
      </div>

      {lgas.length > 0 && (
        <>
          {/* LGA tile grid */}
          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-800">By local government</h3>
              <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
                {data.candidates.slice(0, 4).map((c) => (
                  <span key={c.partyCode} className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: c.color }} aria-hidden="true" />
                    {c.partyCode}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm border border-gray-300 bg-gray-100" aria-hidden="true" />
                  Awaiting
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-1.5">
              {lgas.map((l) => (
                <button
                  key={l.name}
                  onClick={() => setSelected((cur) => (cur === l.name ? null : l.name))}
                  aria-pressed={selected === l.name}
                  className={`relative rounded-md px-1.5 py-2 text-left text-[11px] leading-tight font-semibold transition-shadow ${
                    selected === l.name ? 'ring-2 ring-offset-1 ring-text-primary' : ''
                  } ${l.leader ? 'text-white' : 'border border-gray-200 bg-gray-100 text-text-muted'}`}
                  style={l.leader ? { backgroundColor: l.leader.color, opacity: 0.55 + Math.min(0.45, l.margin / 60) } : undefined}
                  title={l.leader ? `${l.name}: ${l.leader.partyCode} leads by ${l.margin.toFixed(1)} pts` : `${l.name}: awaiting results`}
                >
                  <span className="block truncate">{l.name}</span>
                  <span className="block font-normal opacity-90">{l.leader ? l.leader.partyCode : '—'}</span>
                </button>
              ))}
            </div>

            {selectedLga && (
              <div className="mt-3 rounded-lg border border-gray-200 bg-surface-offwhite p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-text-primary">{selectedLga.name}</h4>
                  <span className="text-xs text-text-muted">{selectedLga.reportingPercent}% reporting</span>
                </div>
                {selectedLga.reported ? (
                  <ul className="space-y-1.5">
                    {selectedLga.candidates.map((c) => (
                      <li key={c.partyCode} className="flex items-center gap-2 text-sm">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} aria-hidden="true" />
                        <span className="w-14 font-semibold">{c.partyCode}</span>
                        <span className="flex-1 tabular-nums text-text-secondary">{nf.format(c.votes)}</span>
                        <span className="tabular-nums font-semibold">{c.percentage.toFixed(1)}%</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-secondary">No results declared here yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Sortable table */}
          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-800">Results table</h3>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find an LGA…"
                aria-label="Find an LGA"
                className="w-full sm:w-56 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="bg-surface-offwhite text-left text-xs uppercase tracking-wider text-text-secondary">
                  <tr>
                    <SortHeader k="name" label="LGA" />
                    <th scope="col" className="py-2 px-3 font-semibold">Leader</th>
                    <SortHeader k="margin" label="Margin" className="text-right" />
                    <SortHeader k="total" label="Votes" className="text-right" />
                    <SortHeader k="reporting" label="Reporting" className="text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(showAll || search ? table : table.slice(0, 10)).map((l) => (
                    <tr key={l.name} className="hover:bg-surface-offwhite">
                      <td className="py-2 px-3 font-medium text-text-primary">{l.name}</td>
                      <td className="py-2 px-3">
                        {l.leader ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.leader.color }} aria-hidden="true" />
                            {l.leader.partyCode}
                          </span>
                        ) : (
                          <span className="text-text-muted">Awaiting</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums">{l.reported ? `${l.margin.toFixed(1)} pts` : '—'}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{l.reported ? nf.format(l.totalVotes) : '—'}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{l.reportingPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!search && table.length > 10 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="mt-3 text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                {showAll ? 'Show fewer' : `Show all ${table.length} LGAs`}
              </button>
            )}
          </div>
        </>
      )}

      <p className="mt-4 text-xs text-text-muted" suppressHydrationWarning>
        {leader && data.totalVotes > 0 ? 'Figures are collated by NUR Report from declared results and may change. ' : ''}
        {data.lastUpdated ? `Last updated ${new Date(data.lastUpdated * 1000).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })}.` : ''}
      </p>
    </section>
  )
}
