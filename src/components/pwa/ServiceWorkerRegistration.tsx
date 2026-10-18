'use client'

import { useEffect, useRef, useState } from 'react'
import { clearAppBadge } from '@/lib/pwa'
import UpdateToast from './UpdateToast'

// Registers /sw.js as soon as the app loads, independent of whether the
// reader ever opts into push notifications. Without this, most visitors
// never get an active service worker at all — which meant the site wasn't
// reliably installable, and had zero offline support, for anyone who hadn't
// already said yes to notifications.
export default function ServiceWorkerRegistration() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const updateRequested = useRef(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
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

    // Reload only when the reader asked for the update (tapped Refresh).
    // The first-ever install also fires controllerchange — reloading then
    // threw first-time visitors back to the top and double-counted views.
    let refreshing = false
    const onControllerChange = () => {
      if (refreshing || !updateRequested.current) return
      refreshing = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    const onVisible = () => {
      if (document.visibilityState === 'visible') clearAppBadge()
    }
    document.addEventListener('visibilitychange', onVisible)
    clearAppBadge()

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  const applyUpdate = () => {
    updateRequested.current = true
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' })
    setWaitingWorker(null)
  }

  if (!waitingWorker) return null
  return <UpdateToast onRefresh={applyUpdate} />
}
