'use client'

import { useState } from 'react'

export default function UnsubscribeForm({ email, token }: { email: string; token: string }) {
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle')

  async function unsubscribe() {
    setState('working')
    try {
      const res = await fetch(
        `/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
        { method: 'POST' }
      )
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') return <p className="mt-6 font-medium text-brand-700">You&apos;ve been unsubscribed.</p>

  return (
    <div className="mt-6">
      <button
        onClick={unsubscribe}
        disabled={state === 'working'}
        className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {state === 'working' ? 'Working…' : 'Yes, unsubscribe me'}
      </button>
      {state === 'error' && <p className="mt-3 text-sm text-red-600">That link is invalid or something went wrong.</p>}
    </div>
  )
}
