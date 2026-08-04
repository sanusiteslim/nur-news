'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'

const DISMISSED_KEY = 'nur-push-dismissed'
const PROMPT_DELAY_MS = 4000

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function NotificationPrompt() {
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState<'idle' | 'subscribing' | 'error'>('idle')

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window

    if (!supported) return
    if (Notification.permission !== 'default') return
    if (localStorage.getItem(DISMISSED_KEY)) return

    const timer = setTimeout(() => setVisible(true), PROMPT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  const subscribe = async () => {
    setStatus('subscribing')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        dismiss()
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!publicKey) throw new Error('Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY')

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      })

      setVisible(false)
    } catch (err) {
      console.error('Push subscription failed:', err)
      setStatus('error')
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-40 bg-white border border-gray-200 rounded-lg shadow-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
          <Bell className="w-4 h-4 text-brand-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary text-sm">Stay Informed</p>
          <p className="text-sm text-text-secondary mt-0.5">
            Get notified the moment we publish breaking news.
          </p>
          {status === 'error' && (
            <p className="text-xs text-accent-red mt-1">Something went wrong. Try again later.</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={subscribe}
              disabled={status === 'subscribing'}
              className="px-3 py-1.5 bg-brand-700 text-white text-sm font-medium rounded-full hover:bg-brand-800 transition-colors disabled:opacity-60"
            >
              {status === 'subscribing' ? 'Enabling…' : 'Allow Notifications'}
            </button>
            <button
              onClick={dismiss}
              className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="text-text-muted hover:text-text-primary">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}