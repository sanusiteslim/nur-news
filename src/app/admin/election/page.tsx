'use client'

import { useState, useEffect } from 'react'
import { OSUN_LGAS } from '@/lib/election'

interface Candidate {
  partyCode: string
  name: string
  color: string
  votes: number
}

interface ElectionProfile {
  title: string
  slug: string
  candidates: Candidate[]
}

export default function ElectionAdminPage() {
  const [profiles, setProfiles] = useState<ElectionProfile[]>([])
  const [selectedSlug, setSelectedSlug] = useState('')
  const [token, setToken] = useState('')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [reportingPercent, setReportingPercent] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [selectedLga, setSelectedLga] = useState('')
const [lgaVotes, setLgaVotes] = useState<Record<string, number>>({})
const [lgaReportingPercent, setLgaReportingPercent] = useState(0)
const [lgaStatus, setLgaStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

// Reset LGA votes when LGA changes
useEffect(() => {
  setLgaVotes(Object.fromEntries(candidates.map((c) => [c.partyCode, 0])))
}, [selectedLga, candidates])

const handleLgaSubmit = async () => {
  setLgaStatus('loading')
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
        votes: lgaVotes,
        reportingPercent: lgaReportingPercent,
      }),
    })
    if (!res.ok) throw new Error('Failed')
    setLgaStatus('success')
    setTimeout(() => setLgaStatus('idle'), 3000)
  } catch {
    setLgaStatus('error')
  }
}

  // Fetch election profiles from Sanity
  useEffect(() => {
    fetch('/api/election/profiles')
      .then((r) => r.json())
      .then((data) => {
        setProfiles(data)
        if (data[0]) {
          setSelectedSlug(data[0].slug)
          setCandidates(data[0].candidates.map((c: any) => ({ ...c, votes: 0 })))
        }
      })
      .catch(console.error)
  }, [])

  // When slug changes, reset form
  useEffect(() => {
    const p = profiles.find((x) => x.slug === selectedSlug)
    if (p) {
      setCandidates(p.candidates.map((c) => ({ ...c, votes: 0 })))
    }
  }, [selectedSlug, profiles])

  const handleVoteChange = (partyCode: string, val: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.partyCode === partyCode ? { ...c, votes: parseInt(val || '0', 10) } : c))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    const votes: Record<string, number> = {}
    candidates.forEach((c) => {
      votes[c.partyCode] = c.votes
    })

    try {
      const res = await fetch('/api/election/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slug: selectedSlug, votes, reportingPercent }),
      })

      if (!res.ok) throw new Error('Update failed')
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-surface-offwhite py-10 px-4">
      <div className="max-w-lg mx-auto bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
        <h1 className="text-xl font-bold text-text-primary mb-1">Election Dashboard</h1>
        <p className="text-sm text-text-muted mb-6">Update live vote counts</p>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary">Vote Counts</label>
            {candidates.map((c) => (
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
                  value={c.votes}
                  onChange={(e) => handleVoteChange(c.partyCode, e.target.value)}
                  className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm text-text-primary text-right focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Reporting % (0–100)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={reportingPercent}
              onChange={(e) => setReportingPercent(parseInt(e.target.value || '0', 10))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
          </div>

          {/* LGA Update Section */}
<div className="mt-8 pt-8 border-t border-gray-200">
  <h2 className="text-lg font-bold text-text-primary mb-4">Update LGA Results</h2>
  
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1">Local Government</label>
      <select
        value={selectedLga}
        onChange={(e) => setSelectedLga(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-700"
      >
        <option value="">Select LGA</option>
        {OSUN_LGAS.map((lga) => (
          <option key={lga} value={lga}>{lga}</option>
        ))}
      </select>
    </div>

    {selectedLga && (
      <>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary">LGA Vote Counts</label>
          {candidates.map((c) => (
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
                value={lgaVotes[c.partyCode] || 0}
                onChange={(e) => setLgaVotes((prev: any) => ({
                  ...prev,
                  [c.partyCode]: parseInt(e.target.value || '0', 10)
                }))}
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
            value={lgaReportingPercent}
            onChange={(e) => setLgaReportingPercent(parseInt(e.target.value || '0', 10))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-700"
          />
        </div>

        <button
          onClick={handleLgaSubmit}
          disabled={lgaStatus === 'loading'}
          className="w-full px-5 py-2.5 bg-brand-700 text-white text-sm font-medium rounded-lg hover:bg-brand-800 transition-colors disabled:opacity-60"
        >
          {lgaStatus === 'loading' ? 'Updating LGA…' : `Update ${selectedLga}`}
        </button>

        {lgaStatus === 'success' && (
          <p className="text-sm text-brand-700 font-medium">LGA updated. Statewide totals recalculated automatically.</p>
        )}
        {lgaStatus === 'error' && (
          <p className="text-sm text-accent-red font-medium">LGA update failed.</p>
        )}
      </>
    )}
  </div>
</div>

          {status === 'success' && (
            <p className="text-sm text-brand-700 font-medium">Results updated successfully.</p>
          )}
          {status === 'error' && (
            <p className="text-sm text-accent-red font-medium">Update failed. Check token and try again.</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-5 py-2.5 bg-brand-700 text-white text-sm font-medium rounded-lg hover:bg-brand-800 transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? 'Updating…' : 'Publish Results'}
          </button>
        </form>
      </div>
    </main>
  )
}