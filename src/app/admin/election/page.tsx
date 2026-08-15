'use client'

import { useState, useEffect } from 'react'
import { OSUN_LGAS } from '@/lib/election'

interface CandidateProfile {
  partyCode: string
  partyName?: string
  name: string
  color: string
}

interface ElectionProfile {
  title: string
  slug: string
  candidates: CandidateProfile[]
}

export default function ElectionAdminPage() {
  const [profiles, setProfiles] = useState<ElectionProfile[]>([])
  const [selectedSlug, setSelectedSlug] = useState('')
  const [token, setToken] = useState('')

  const [selectedLga, setSelectedLga] = useState('')
  const [lgaCandidates, setLgaCandidates] = useState<Record<string, number>>({})
  const [lgaReporting, setLgaReporting] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // Load election profiles
  useEffect(() => {
    fetch('/api/election/profiles')
      .then((r) => r.json())
      .then((data: ElectionProfile[]) => {
        setProfiles(data)
        if (data[0]) {
          setSelectedSlug(data[0].slug)
          const emptyVotes = Object.fromEntries(data[0].candidates.map((c) => [c.partyCode, 0]))
          setLgaCandidates(emptyVotes)
        }
      })
      .catch(console.error)
  }, [])

  // Reset LGA form when election changes
  useEffect(() => {
    const p = profiles.find((x) => x.slug === selectedSlug)
    if (p) {
      setLgaCandidates(Object.fromEntries(p.candidates.map((c) => [c.partyCode, 0])))
      setLgaReporting(0)
      setSelectedLga('')
      setStatus('idle')
    }
  }, [selectedSlug, profiles])

  const currentProfile = profiles.find((p) => p.slug === selectedSlug)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlug || !selectedLga || !token) {
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/election/lgas/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: selectedSlug,
          lga: selectedLga,
          votes: lgaCandidates,
          reportingPercent: lgaReporting,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('LGA update error:', err)
        throw new Error(err.error || 'Failed')
      }

      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-surface-offwhite py-10 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-text-primary mb-1">Election Dashboard</h1>
          <p className="text-sm text-text-muted">
            Update LGA results. Statewide totals are calculated automatically.
          </p>
        </div>

        {/* Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Election</label>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-700"
            >
              {profiles.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Secret Token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste ELECTION_SECRET_TOKEN"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
          </div>
        </div>

        {/* LGA Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-6 space-y-5"
        >
          <h2 className="text-lg font-bold text-text-primary">Update LGA Results</h2>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Local Government
            </label>
            <select
              value={selectedLga}
              onChange={(e) => setSelectedLga(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-700"
            >
              <option value="">Select LGA</option>
              {OSUN_LGAS.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {currentProfile?.candidates.map((c) => (
              <div key={c.partyCode} className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-full text-[10px] font-bold text-white flex items-center justify-center shrink-0"
                  style={{ backgroundColor: c.color }}
                >
                  {c.partyCode}
                </span>
                <span className="text-sm text-text-secondary flex-1">{c.name}</span>
                <input
                  type="number"
                  min={0}
                  value={lgaCandidates[c.partyCode] || 0}
                  onChange={(e) =>
                    setLgaCandidates((prev) => ({
                      ...prev,
                      [c.partyCode]: parseInt(e.target.value || '0', 10),
                    }))
                  }
                  className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm text-text-primary text-right focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              LGA Reporting % (0–100)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={lgaReporting}
              onChange={(e) => setLgaReporting(parseInt(e.target.value || '0', 10))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
          </div>

          {status === 'success' && (
            <p className="text-sm text-brand-700 font-medium">
              {selectedLga} updated. Statewide totals recalculated.
            </p>
          )}
          {status === 'error' && (
            <p className="text-sm text-accent-red font-medium">
              Update failed. Check token, LGA selection, and values.
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || !token || !selectedSlug || !selectedLga}
            className="w-full px-5 py-2.5 bg-brand-700 text-white text-sm font-medium rounded-lg hover:bg-brand-800 transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? 'Updating…' : `Update ${selectedLga || 'LGA'}`}
          </button>
        </form>
      </div>
    </main>
  )
}