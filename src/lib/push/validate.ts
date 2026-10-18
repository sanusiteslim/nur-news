import type { PushSubscriptionRecord } from './types'

// Browser push services. Anything else is refused, so the broadcast loop can
// never be pointed at an arbitrary URL (SSRF) by a forged subscription.
const PUSH_HOST_SUFFIXES = [
  'fcm.googleapis.com',
  'android.googleapis.com',
  'push.services.mozilla.com',
  'notify.windows.com',
  'push.apple.com',
]

const B64URL = /^[A-Za-z0-9_-]+={0,2}$/

export function isAllowedPushEndpoint(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== 'string' || endpoint.length > 1024) return false
  try {
    const url = new URL(endpoint)
    if (url.protocol !== 'https:') return false
    const host = url.hostname.toLowerCase()
    return PUSH_HOST_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`))
  } catch {
    return false
  }
}

/** Validates an incoming PushSubscription JSON. Returns null if unusable. */
export function parseSubscription(body: any): PushSubscriptionRecord | null {
  const endpoint = body?.endpoint
  const p256dh = body?.keys?.p256dh
  const auth = body?.keys?.auth
  if (!isAllowedPushEndpoint(endpoint)) return null
  if (typeof p256dh !== 'string' || p256dh.length < 60 || p256dh.length > 120 || !B64URL.test(p256dh)) return null
  if (typeof auth !== 'string' || auth.length < 16 || auth.length > 40 || !B64URL.test(auth)) return null
  return { endpoint, keys: { p256dh, auth }, createdAt: new Date().toISOString() }
}
