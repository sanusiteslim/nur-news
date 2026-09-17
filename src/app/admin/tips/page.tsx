'use client'

import { useState } from 'react'
import { formatTag } from '@/lib/taxonomy'

interface Tip {
  _id: string
  tipText: string
  category?: string
  location?: string
  submitterName?: string
  submitterContact?: string
  status: 'new' | 'reviewing' | 'actioned' | 'dismissed'
  editorNotes?: string
  submittedAt?: string
  source?: string
}

const STATUSES: Tip['status'][] = ['new', 'reviewing', 'actioned', 'dismissed']

const STATUS_STYLES: Record<Tip['status'], string> = {
  new: 'bg-brand-700 text-white',
  reviewing: 'bg-amber-500 text-white',
  actioned: 'bg-green-700 text-white',
  dismissed: 'bg-gray-400 text-white',
}

export default function TipsAdminPage() {
  const [token, setToken] = useState('')
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | Tip['status']>('all')
  const [savingId, setSavingId] = useState<string | null>(null)

  const loadTips = async () => {
    if (!token.trim()) {
      setError('Enter the admin token first.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/tips/list', {
        headers: { Authorization: `Bearer ${token.trim()}` },
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : null

      if (!res.ok) {
        setError(data?.error || `Failed to load (error ${res.status}).`)
        setTips([])
        return
      }

      setTips(data.tips || [])
    } catch {
      setError('Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  const updateTip = async (id: string, patch: { status?: Tip['status']; editorNotes?: string }) => {
    setSavingId(id)
    // Optimistic update — the list re-renders immediately, and we roll back
    // to a reload if the server rejects it.
    setTips((prev) => prev.map((t) => (t._id === id ? { ...t, ...patch } : t)))

    try {
      const res = await fetch('/api/tips/list', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({ id, ...patch }),
      })
      if (!res.ok) {
        setError('Update failed — reloading.')
        await loadTips()
      }
    } catch {
      setError('Update failed — reloading.')
      await loadTips()
    } finally {
      setSavingId(null)
    }
  }

  const visible = filter === 'all' ? tips : tips.filter((t) => t.status === filter)
  const countFor = (s: Tip['status']) => tips.filter((t) => t.status === s).length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Tips Inbox</h1>
      <p className="text-text-secondary mb-8">
        Reader-submitted tips, newest first. Nothing here is published — triage, verify, then
        write the story separately.
      </p>

      {/* Auth */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Admin token"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-700"
        />
        <button
          onClick={loadTips}
          disabled={loading}
          className="px-6 py-2.5 bg-brand-700 text-white font-semibold rounded-lg hover:bg-brand-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Load Tips'}
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-6" role="alert">
          {error}
        </p>
      )}

      {tips.length > 0 && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                filter === 'all' ? 'bg-text-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              All ({tips.length})
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-sm rounded-full capitalize transition-colors ${
                  filter === s ? 'bg-text-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                {s} ({countFor(s)})
              </button>
            ))}
          </div>

          {/* Tip list */}
          <div className="space-y-4">
            {visible.length === 0 && (
              <p className="text-text-secondary">No tips with this status.</p>
            )}

            {visible.map((tip) => (
              <article
                key={tip._id}
                className="border border-gray-200 rounded-lg p-5 bg-white"
              >
                <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${STATUS_STYLES[tip.status]}`}
                    >
                      {tip.status}
                    </span>
                    {tip.category && tip.category !== 'unsure' && (
                      <span className="px-2 py-0.5 bg-brand-50 text-brand-800 rounded-full">
                        {formatTag(tip.category)}
                      </span>
                    )}
                    {tip.location && (
                      <span className="text-text-muted">📍 {tip.location}</span>
                    )}
                  </div>
                  {tip.submittedAt && (
                    <time className="text-xs text-text-muted">
                      {new Date(tip.submittedAt).toLocaleString('en-NG', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </time>
                  )}
                </div>

                <p className="text-text-primary whitespace-pre-wrap leading-relaxed mb-3">
                  {tip.tipText}
                </p>

                {(tip.submitterName || tip.submitterContact) && (
                  <p className="text-sm text-text-secondary mb-3">
                    <span className="font-semibold">From:</span>{' '}
                    {tip.submitterName || 'Anonymous'}
                    {tip.submitterContact && (
                      <>
                        {' · '}
                        <span className="font-mono text-xs">{tip.submitterContact}</span>
                      </>
                    )}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                  {STATUSES.filter((s) => s !== tip.status).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateTip(tip._id, { status: s })}
                      disabled={savingId === tip._id}
                      className="px-3 py-1 text-xs border border-gray-300 rounded-full capitalize hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Mark {s}
                    </button>
                  ))}
                </div>

                <textarea
                  defaultValue={tip.editorNotes || ''}
                  onBlur={(e) => {
                    if (e.target.value !== (tip.editorNotes || '')) {
                      updateTip(tip._id, { editorNotes: e.target.value })
                    }
                  }}
                  rows={2}
                  placeholder="Editor notes (saved when you click away)…"
                  className="w-full mt-3 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
