'use client'

import { useState } from 'react'

type ListOption = { id: string; name: string; cadence: string; description: string }

export default function PreferencesForm({
  email,
  token,
  initialLists,
  lists,
}: {
  email: string
  token: string
  initialLists: string[]
  lists: ListOption[]
}) {
  const [selected, setSelected] = useState<string[]>(initialLists)
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const toggle = (id: string) => {
    setState('idle')
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  }

  async function save(next: string[]) {
    setState('saving')
    try {
      const res = await fetch('/api/newsletter/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, lists: next }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Something went wrong')
      setSelected(data.lists ?? next)
      setMessage(next.length === 0 ? "You've been unsubscribed from everything." : 'Your preferences are saved.')
      setState('saved')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  return (
    <div className="mt-8">
      <div className="space-y-3">
        {lists.map((l) => {
          const on = selected.includes(l.id)
          return (
            <label
              key={l.id}
              className={`flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${
                on ? 'border-brand-700 bg-brand-50' : 'border-gray-200 bg-white hover:bg-surface-offwhite'
              }`}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggle(l.id)}
                className="mt-1 h-4 w-4 accent-brand-700"
              />
              <span>
                <span className="block font-bold text-text-primary">{l.name}</span>
                <span className="block text-xs font-semibold uppercase tracking-wider text-brand-700 mt-0.5">
                  {l.cadence}
                </span>
                <span className="block text-sm text-text-secondary mt-1">{l.description}</span>
              </span>
            </label>
          )
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => save(selected)}
          disabled={state === 'saving'}
          className="rounded-full bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 transition-colors disabled:opacity-60"
        >
          {state === 'saving' ? 'Saving…' : 'Save preferences'}
        </button>
        <button
          onClick={() => save([])}
          disabled={state === 'saving'}
          className="text-sm text-text-secondary underline underline-offset-2 hover:text-accent-red"
        >
          Unsubscribe from all
        </button>
      </div>

      {state === 'saved' && <p className="mt-4 text-sm font-medium text-brand-700">{message}</p>}
      {state === 'error' && <p className="mt-4 text-sm text-accent-red">{message}</p>}
    </div>
  )
}
