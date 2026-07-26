'use client'

import { useState, useRef } from 'react'

const categories = [
  { label: 'Not sure', value: 'unsure' },
  { label: 'Nigeria', value: 'nigeria' },
  { label: 'Africa', value: 'africa' },
  { label: 'World', value: 'world' },
  { label: 'Sports', value: 'sports' },
  { label: 'Opinion', value: 'opinion' },
  { label: 'Business', value: 'business' },
]

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function TipPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const formLoadedAt = useRef(Date.now())

  const [tipText, setTipText] = useState('')
  const [category, setCategory] = useState('unsure')
  const [location, setLocation] = useState('')
  const [submitterName, setSubmitterName] = useState('')
  const [submitterContact, setSubmitterContact] = useState('')
  const [website, setWebsite] = useState('') // honeypot — stays empty for real users

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipText.trim()) return

    setStatus('submitting')
    setErrorMessage('')

    try {
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipText,
          category,
          location,
          submitterName,
          submitterContact,
          website, // honeypot
          formLoadedAt: formLoadedAt.current,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMessage(data?.error || 'Something went wrong. Please try again.')
        return
      }

      setStatus('success')
      setTipText('')
      setLocation('')
      setSubmitterName('')
      setSubmitterContact('')
      setCategory('unsure')
    } catch {
      setStatus('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-brand-800 mb-4">Thanks for the tip</h1>
        <p className="text-text-secondary text-lg mb-8">
          Our editorial team will review it. If you left contact details, we may reach out to verify before running anything with it.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="text-brand-700 font-medium hover:text-brand-800 underline underline-offset-2"
        >
          Submit another tip
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">Send Us a Tip</h1>
      <p className="text-text-secondary mb-8">
        Seen or heard something worth reporting? Tell us. You can stay anonymous — name and contact info are optional.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot field — hidden from real users via CSS, bots will fill it in */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="website">Leave this field blank</label>
          <input
            type="text"
            id="website"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="tipText" className="block font-semibold text-text-primary mb-2">
            What's the tip? <span className="text-brand-700">*</span>
          </label>
          <textarea
            id="tipText"
            required
            rows={6}
            maxLength={2000}
            value={tipText}
            onChange={(e) => setTipText(e.target.value)}
            placeholder="What happened, when, and where — as much detail as you can share."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
          />
          <p className="text-xs text-text-muted mt-1">{tipText.length}/2000</p>
        </div>

        <div>
          <label htmlFor="category" className="block font-semibold text-text-primary mb-2">
            Which section does this fit best?
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-700"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block font-semibold text-text-primary mb-2">
            Location <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="State, LGA, or area"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-700"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="submitterName" className="block font-semibold text-text-primary mb-2">
              Your name <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <input
              type="text"
              id="submitterName"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
          </div>
          <div>
            <label htmlFor="submitterContact" className="block font-semibold text-text-primary mb-2">
              Phone or email <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <input
              type="text"
              id="submitterContact"
              value={submitterContact}
              onChange={(e) => setSubmitterContact(e.target.value)}
              placeholder="So we can verify with you, if needed"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
          </div>
        </div>

        {status === 'error' && (
          <p className="text-red-600 text-sm">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting' || !tipText.trim()}
          className="w-full sm:w-auto px-8 py-3 bg-brand-700 text-white font-semibold rounded-lg hover:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? 'Sending…' : 'Send Tip'}
        </button>
      </form>
    </div>
  )
}