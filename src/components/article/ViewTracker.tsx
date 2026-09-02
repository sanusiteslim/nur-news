'use client'

import { useEffect } from 'react'

const SESSION_KEY_PREFIX = 'nur-viewed:'

/**
 * Fires a single "article viewed" beacon per slug per browser session
 * (deduped via sessionStorage so back/forward navigation, re-renders, and a
 * revisit within the same tab session don't inflate the count). Renders
 * nothing — this is a tracking-only side effect, mounted once on the
 * article page.
 */
export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return

    const key = `${SESSION_KEY_PREFIX}${slug}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')

    const payload = JSON.stringify({ slug })

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/view', blob)
    } else {
      fetch('/api/analytics/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Best-effort — a failed view ping shouldn't affect the reader.
      })
    }
  }, [slug])

  return null
}
