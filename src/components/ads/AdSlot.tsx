'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

// In-article AdSense unit. Reads NEXT_PUBLIC_ADSENSE_CLIENT_ID (your AdSense
// publisher id, e.g. "ca-pub-1234567890123456") and takes a per-slot ad unit
// id as a prop. If either is missing, renders a neutral placeholder instead
// of a broken ad — safe to ship before AdSense is fully set up.
export default function AdSlot({ slot }: { slot?: string }) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  const insRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (!clientId || !slot || pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch (err) {
      console.error('AdSense push failed', err)
    }
  }, [clientId, slot])

  if (!clientId || !slot) {
    return (
      <div className="my-8 flex items-center justify-center border border-dashed border-gray-300 bg-surface-offwhite py-10 text-xs uppercase tracking-wider text-text-muted">
        Advertisement
      </div>
    )
  }

  return (
    <div className="my-8">
      <span className="block text-center text-[10px] uppercase tracking-wider text-text-muted mb-1">
        Advertisement
      </span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="fluid"
        data-ad-layout="in-article"
      />
    </div>
  )
}