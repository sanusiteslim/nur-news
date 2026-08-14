'use client'

import { useState, useRef } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const MAX_LENGTH = 1000

interface CommentFormProps {
  articleId: string
  parentId?: string
  onSuccess?: () => void
}

export default function CommentForm({ articleId, parentId, onSuccess }: CommentFormProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const formLoadedAt = useRef(Date.now())

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [website, setWebsite] = useState('')

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
          parentId,
          name,
          email,
          body,
          website,
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
      setEmail('')
      setBody('')
      onSuccess?.()
    } catch {
      setStatus('error')
      setErrorMessage('Network error. Please check your connection.')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-5 sm:py-6 text-center">
        <p className="font-semibold text-green-800 text-sm sm:text-base">
          {parentId ? 'Reply posted!' : 'Thanks for your comment'}
        </p>
        <p className="text-xs sm:text-sm text-green-700 mt-1">
          It will appear once our team reviews it.
        </p>
        {!parentId && (
          <button
            onClick={() => setStatus('idle')}
            className="mt-3 inline-flex items-center text-sm font-medium text-brand-700 hover:text-brand-800 underline underline-offset-2"
          >
            Leave another comment
          </button>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor={`comment-website-${parentId || 'root'}`}>Leave this field blank</label>
        <input
          type="text"
          id={`comment-website-${parentId || 'root'}`}
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <input
          type="text"
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
        />
        <input
          type="email"
          maxLength={120}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional)"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
        />
      </div>

      <textarea
        required
        rows={parentId ? 2 : 3}
        maxLength={MAX_LENGTH}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? 'Write a reply…' : 'Add a comment…'}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent resize-y"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {body.length}/{MAX_LENGTH}
        </span>
        {status === 'error' && (
          <span className="text-xs text-accent-red font-medium">{errorMessage}</span>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full sm:w-auto px-5 py-2.5 bg-brand-700 text-white text-sm font-medium rounded-lg hover:bg-brand-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'submitting'
            ? parentId
              ? 'Posting reply…'
              : 'Posting…'
            : parentId
            ? 'Post Reply'
            : 'Post Comment'}
        </button>
      </div>
    </form>
  )
}