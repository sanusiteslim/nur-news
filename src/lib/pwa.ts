// Shared helpers for the PWA layer (install prompt, push notifications,
// service worker registration). Kept dependency-free and framework-agnostic
// so they're safe to call from any client component.

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari's legacy standalone flag — not covered by matchMedia there
    (window.navigator as any).standalone === true
  )
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isAppleMobile = /iPad|iPhone|iPod/.test(ua)
  // iPadOS 13+ reports as "Macintosh" but exposes touch support, unlike real Macs
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return isAppleMobile || isIPadOS
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function clearAppBadge(): Promise<void> {
  try {
    if ('clearAppBadge' in navigator) {
      await (navigator as any).clearAppBadge()
    }
  } catch {
    // Badging API is best-effort; unsupported browsers just no-op.
  }
}
