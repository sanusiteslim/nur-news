'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, Download, Share, X } from 'lucide-react'
import { isIOS, isStandalone, urlBase64ToUint8Array } from '@/lib/pwa'

const INSTALL_DISMISSED_KEY = 'nur-install-dismissed'
const PUSH_DISMISSED_KEY = 'nur-push-dismissed'
const DECISION_DELAY_MS = 3000 // how long we wait for beforeinstallprompt before deciding
const PUSH_DELAY_MS = 2500 // additional pause after the install stage resolves, before offering push

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Stage = 'hidden' | 'install' | 'install-ios' | 'push'

// Runs the install prompt and the push-notification prompt as one sequence,
// with a single decision point, instead of two independent components that
// could both render bottom-fixed banners on top of each other. Install is
// offered first — the more foundational "make this a PWA" step — and push
// is only offered afterward, once install has been resolved one way or another.
export default function InstallAndNotifyPrompt() {
  const [stage, setStage] = useState<Stage>('hidden')
  const [pushStatus, setPushStatus] = useState<'idle' | 'subscribing' | 'error'>('idle')
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (isStandalone()) {
      schedulePush()
      return
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e as BeforeInstallPromptEvent
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    // Wait once for beforeinstallprompt to show up (Chrome/Edge/Android fire
    // it on their own schedule, sometimes not at all in a given session),
    // then make exactly one decision based on whatever we know at that point.
    const decide = setTimeout(() => {
      if (deferredPromptRef.current && !localStorage.getItem(INSTALL_DISMISSED_KEY)) {
        setStage('install')
      } else if (isIOS() && !localStorage.getItem(INSTALL_DISMISSED_KEY)) {
        setStage('install-ios')
      } else {
        schedulePush()
      }
    }, DECISION_DELAY_MS)

    return () => {
      clearTimeout(decide)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function schedulePush() {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window
    if (!supported) return
    if (Notification.permission !== 'default') return
    if (localStorage.getItem(PUSH_DISMISSED_KEY)) return
    setTimeout(() => setStage('push'), PUSH_DELAY_MS)
  }

  const dismissInstall = () => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, '1')
    setStage('hidden')
    schedulePush()
  }

  const runInstall = async () => {
    const prompt = deferredPromptRef.current
    if (!prompt) return
    await prompt.prompt()
    await prompt.userChoice
    deferredPromptRef.current = null
    setStage('hidden')
    schedulePush()
  }

  const dismissPush = () => {
    localStorage.setItem(PUSH_DISMISSED_KEY, '1')
    setStage('hidden')
  }

  const subscribeToPush = async () => {
    setPushStatus('subscribing')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        dismissPush()
        return
      }

      const registration = await navigator.serviceWorker.ready

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!publicKey) throw new Error('Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY')

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      })

      setStage('hidden')
    } catch (err) {
      console.error('Push subscription failed:', err)
      setPushStatus('error')
    }
  }

  if (stage === 'hidden') return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4">
        {stage === 'install' && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Download className="w-4 h-4 text-brand-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary text-sm">Install NUR Report</p>
              <p className="text-sm text-text-secondary mt-0.5">Add it to your home screen for faster access and offline reading.</p>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={runInstall} className="px-3 py-1.5 bg-brand-700 text-white text-sm font-medium rounded-full hover:bg-brand-800 transition-colors">
                  Install
                </button>
                <button onClick={dismissInstall} className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                  Not now
                </button>
              </div>
            </div>
            <button onClick={dismissInstall} aria-label="Dismiss" className="text-text-muted hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {stage === 'install-ios' && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Share className="w-4 h-4 text-brand-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary text-sm">Install NUR Report</p>
              <p className="text-sm text-text-secondary mt-0.5">
                Tap <Share className="inline w-3.5 h-3.5 -mt-0.5" aria-hidden /> Share, then &quot;Add to Home Screen&quot;.
              </p>
              <button onClick={dismissInstall} className="px-3 py-1.5 -ml-3 mt-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                Got it
              </button>
            </div>
            <button onClick={dismissInstall} aria-label="Dismiss" className="text-text-muted hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {stage === 'push' && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-brand-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary text-sm">Stay Informed</p>
              <p className="text-sm text-text-secondary mt-0.5">Get notified the moment we publish breaking news.</p>
              {pushStatus === 'error' && <p className="text-xs text-accent-red mt-1">Something went wrong. Try again later.</p>}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={subscribeToPush}
                  disabled={pushStatus === 'subscribing'}
                  className="px-3 py-1.5 bg-brand-700 text-white text-sm font-medium rounded-full hover:bg-brand-800 transition-colors disabled:opacity-60"
                >
                  {pushStatus === 'subscribing' ? 'Enabling…' : 'Allow Notifications'}
                </button>
                <button onClick={dismissPush} className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                  Not now
                </button>
              </div>
            </div>
            <button onClick={dismissPush} aria-label="Dismiss" className="text-text-muted hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
