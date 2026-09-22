'use client'

import { useState } from 'react'

export default function DistributionPage() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState('')
  const [adminToken, setAdminToken] = useState('')

  async function copyWhatsApp() {
    await navigator.clipboard.writeText(text)
    setStatus('WhatsApp copy copied to clipboard.')
  }

  async function publishTelegram() {
    setStatus('Publishing to Telegram...')

    try {
      const response = await fetch('/api/admin/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          text,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Telegram publishing failed')
      }

      setStatus('Published to Telegram successfully.')
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Telegram publishing failed'
      )
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">
        Distribution
      </h1>

      <p className="mt-2 text-gray-600">
        Prepare a post for WhatsApp or publish it directly to Telegram.
      </p>

      <div className="mt-8">
        <label className="mb-2 block text-sm font-semibold">
          Admin token
        </label>

        <input
          type="password"
          value={adminToken}
          onChange={(e) => setAdminToken(e.target.value)}
          placeholder="ADMIN_TOKEN"
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-semibold">
          Message
        </label>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          placeholder="Paste or generate your distribution message..."
          className="w-full rounded-xl border p-4"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copyWhatsApp}
          className="rounded-lg border px-5 py-3 font-semibold"
        >
          Copy for WhatsApp
        </button>

        <button
          type="button"
          onClick={publishTelegram}
          className="rounded-lg bg-black px-5 py-3 font-semibold text-white"
        >
          Publish to Telegram
        </button>
      </div>

      {status && (
        <p className="mt-5 rounded-lg bg-gray-100 p-4 text-sm">
          {status}
        </p>
      )}
    </main>
  )
}