'use client'

import { useState } from 'react'

type BriefRow = { slug: string; title: string; date: string; edition?: string; sent: boolean }
type Stats = { pending: number; active: number; unsubscribed: number }

export default function AdminNewsletterPage() {
  const [token, setToken] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [briefs, setBriefs] = useState<BriefRow[]>([])
  const [slug, setSlug] = useState('')
  const [testTo, setTestTo] = useState('')
  const [status, setStatus] = useState('')

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  async function load() {
    setStatus('Loading…')
    const res = await fetch('/api/admin/newsletter', { headers })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return setStatus(data.error || 'Failed to load')
    setStats(data.stats)
    setBriefs(data.briefs)
    if (!slug && data.briefs[0]) setSlug(data.briefs[0].slug)
    setStatus('')
  }

  async function send(mode: 'test' | 'all', force = false) {
    if (!slug) return setStatus('Pick a brief first.')
    if (mode === 'test' && !testTo) return setStatus('Enter a test email address.')
    if (mode === 'all' && !confirm(`Send "${slug}" to ${stats?.active ?? 'all'} confirmed subscribers?`)) return
    setStatus(mode === 'test' ? 'Sending test…' : 'Sending to subscribers…')
    const res = await fetch('/api/admin/newsletter', {
      method: 'POST',
      headers,
      body: JSON.stringify({ slug, force, ...(mode === 'test' ? { testTo } : {}) }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return setStatus(data.error || 'Send failed')
    setStatus(mode === 'test' ? `Test sent to ${testTo}.` : `Sent to ${data.sent} subscribers.`)
    if (mode === 'all') load()
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Newsletter</h1>
      <p className="mt-2 text-gray-600">Send a published NUR Report Brief to confirmed subscribers.</p>

      <div className="mt-8 flex gap-3">
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ADMIN_TOKEN"
          className="w-full rounded-lg border px-4 py-3"
        />
        <button onClick={load} className="rounded-lg bg-gray-900 px-5 font-semibold text-white">Load</button>
      </div>

      {stats && (
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {(['active', 'pending', 'unsubscribed'] as const).map((k) => (
            <div key={k} className="rounded-xl border p-4">
              <div className="text-2xl font-bold">{stats[k]}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500">{k}</div>
            </div>
          ))}
        </div>
      )}

      <label className="mt-8 mb-2 block text-sm font-semibold">Brief</label>
      <select value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full rounded-lg border px-4 py-3">
        {briefs.length === 0 && <option value="">Load to see published briefs</option>}
        {briefs.map((b) => (
          <option key={b.slug} value={b.slug}>
            {b.date} · {b.edition ?? 'evening'} · {b.title}
            {b.sent ? ' (sent)' : ''}
          </option>
        ))}
      </select>

      <div className="mt-6 flex gap-3">
        <input
          type="email"
          value={testTo}
          onChange={(e) => setTestTo(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded-lg border px-4 py-3"
        />
        <button onClick={() => send('test')} className="whitespace-nowrap rounded-lg border px-5 font-semibold">
          Send test
        </button>
      </div>

      <div className="mt-4 flex gap-3">
        <button onClick={() => send('all')} className="rounded-lg bg-brand-700 px-5 py-3 font-semibold text-white">
          Send to all subscribers
        </button>
        <button onClick={() => send('all', true)} className="rounded-lg border px-5 py-3 text-sm text-gray-600">
          Resend (force)
        </button>
      </div>

      {status && <p className="mt-6 text-sm text-gray-700">{status}</p>}
    </main>
  )
}
