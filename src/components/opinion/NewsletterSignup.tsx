'use client'

import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot — real users never fill this
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('submitting')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Something went wrong')
      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <div className="bg-surface-offwhite rounded-lg p-6 border border-gray-100">
      <div className="w-10 h-1 bg-accent-orange rounded-full mb-4" />
      <p className="text-sm font-semibold text-text-primary">Sign up for NUR Report</p>
      <h3 className="text-xl font-bold text-text-primary mt-0.5">The NUR Report Brief</h3>
      <p className="text-sm text-text-secondary mt-3 leading-relaxed">
        Get the day's most important stories from Nigeria, Africa, and the world, delivered to your inbox.
      </p>

      {status === 'success' ? (
        <p className="mt-4 text-sm font-medium text-brand-700">Almost done — check your inbox and click the confirmation link.</p>
      ) : (
        <form onSubmit={submit} className="mt-4">
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />
          <label htmlFor="newsletter-email" className="block text-sm font-medium text-text-primary mb-1.5">
            E-mail address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
          />
          {status === 'error' && <p className="text-xs text-accent-red mt-1.5">{errorMsg}</p>}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full mt-3 bg-gray-900 text-white text-sm font-semibold rounded-full py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  )
}
