'use client'

import { useEffect, useState } from 'react'
import { clearAppBadge } from '@/lib/pwa'
import UpdateToast from './UpdateToast'

// Registers /sw.js as soon as the app loads, independent of whether the
// reader ever opts into push notifications. Without this, most visitors
// never get an active service worker at all — which meant the site wasn't
// reliably installable, and had zero offline support, for anyone who hadn't
// already said yes to notifications.
export default function ServiceWorkerRegistration() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let registration: ServiceWorkerRegistration | undefined

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        registration = reg

        // A version already finished installing before this tab opened.
        if (reg.waiting) setWaitingWorker(reg.waiting)

        reg.addEventListener('updatefound', () => {
          const installing = reg.installing
          if (!installing) return
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(installing)
            }
          })
        })
      })
      .catch((err) => console.error('Service worker registration failed:', err))

    // Reload once the new worker actually takes control, so the update
    // toast's "Refresh" button reflects real state instead of a stale page.
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })

    const onVisible = () => {
      if (document.visibilityState === 'visible') clearAppBadge()
    }
    document.addEventListener('visibilitychange', onVisible)
    clearAppBadge()

    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  const applyUpdate = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' })
    setWaitingWorker(null)
  }

  if (!waitingWorker) return null
  return <UpdateToast onRefresh={applyUpdate} />
}
