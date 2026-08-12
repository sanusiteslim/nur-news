'use client'

import { useState, useRef } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const MAX_LENGTH = 1000

export default function CommentForm({ articleId }: { articleId: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const formLoadedAt = useRef(Date.now())

  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [website, setWebsite] = useState('') // honeypot — stays empty for real users

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !body.trim()) return

    setStatus('submitting')
    setErrorMessage('')

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          name,
          body,
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
      setName('')
      setBody('')
    } catch {
      setStatus('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-gray-200 rounded-lg px-4 py-6 text-center">
        <p className="font-semibold text-text-primary">Thanks for your comment</p>
        <p className="text-sm text-text-secondary mt-1">
          It'll appear here once our team reviews it.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="text-brand-700 text-sm font-medium hover:text-brand-800 underline underline-offset-2 mt-3"
        >
          Leave another comment
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Honeypot field — hidden from real users via CSS, bots will fill it in */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="comment-website">Leave this field blank</label>
        <input
          type="text"
          id="comment-website"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <input
        type="text"
        required
        maxLength={80}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
      />

      <textarea
        required
        rows={3}
        maxLength={MAX_LENGTH}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment…"
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
      />
      <p className="text-xs text-text-muted -mt-1">{body.length}/{MAX_LENGTH}</p>

      {status === 'error' && <p className="text-sm text-accent-red">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="px-5 py-2 bg-brand-700 text-white text-sm font-medium rounded-full hover:bg-brand-800 transition-colors disabled:opacity-60"
      >
        {status === 'submitting' ? 'Posting…' : 'Post Comment'}
      </button>
    </form>
  )
}