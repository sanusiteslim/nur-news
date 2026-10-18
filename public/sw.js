// NUR Report service worker
//
// Bump CACHE_VERSION whenever the caching strategy or precache list changes.
// Old versioned caches are swept on activate, so this is the one thing you
// need to touch to force every installed client onto fresh caches.
const CACHE_VERSION = 'v2'
const STATIC_CACHE = `nur-static-${CACHE_VERSION}`
const PAGES_CACHE = `nur-pages-${CACHE_VERSION}`
const IMAGE_CACHE = `nur-images-${CACHE_VERSION}`
// Caps keep the cache from growing without limit on readers' phones.
const MAX_PAGES = 40
const MAX_IMAGES = 120
const OFFLINE_URL = '/offline'

const PRECACHE_URLS = [OFFLINE_URL, '/icon-192.png', '/icon-512.png', '/favicon.ico']

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
    // No skipWaiting() here: a new worker waits until the reader taps
    // "Refresh" on the update toast (SKIP_WAITING message below). Calling it
    // on install made pages reload under readers mid-article.
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('nur-') && ![STATIC_CACHE, PAGES_CACHE, IMAGE_CACHE].includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// Lets the client force this worker to activate immediately (used by the
// "Refresh to update" toast instead of waiting for all tabs to close).
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// ---------------------------------------------------------------------------
// Fetch — three strategies depending on what's being requested
// ---------------------------------------------------------------------------

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Never intercept non-GET requests (push subscribe, view tracking, tips,
  // ad breaks, etc.) — those need to hit the network every time.
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Leave cross-origin requests alone (analytics, ads, fonts CDNs, etc.)
  // except Sanity's asset CDN, which we're happy to cache for offline reading.
  if (url.origin !== self.location.origin && url.hostname !== 'cdn.sanity.io') return

  // Admin screens and API responses must always be live.
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/')) return

  // Next.js build assets are content-hashed — safe to cache forever.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Optimized images (same-origin proxy for both local and Sanity-hosted
  // images) and the Sanity CDN directly — show the cached version instantly
  // if we have one, then refresh it in the background.
  if (url.pathname.startsWith('/_next/image') || url.hostname === 'cdn.sanity.io') {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE, MAX_IMAGES))
    return
  }

  // Page navigations — freshness matters most for a news site, so always
  // try the network first. Fall back to a cached copy, then the offline page.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request))
    return
  }

  // Everything else static (icons, manifest, fonts, styles/scripts not under
  // _next/static): cache-first.
  if (['style', 'script', 'font', 'image'].includes(request.destination)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  }
})

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return cached || Response.error()
  }
}

// Deletes the oldest entries once a cache holds more than `max` items.
async function trimCache(cacheName, max) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length <= max) return
  await Promise.all(keys.slice(0, keys.length - max).map((key) => cache.delete(key)))
}

async function staleWhileRevalidate(request, cacheName, max) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((response) => {
      // Opaque (no-cors) responses report ok=false but are still cacheable.
      if (response.ok || response.type === 'opaque') {
        cache.put(request, response.clone()).then(() => max && trimCache(cacheName, max))
      }
      return response
    })
    .catch(() => cached)
  return cached || network
}

async function networkFirstNavigation(request) {
  const pagesCache = await caches.open(PAGES_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) {
      pagesCache.put(request, response.clone()).then(() => trimCache(PAGES_CACHE, MAX_PAGES))
    }
    return response
  } catch {
    return (await pagesCache.match(request)) || (await caches.match(OFFLINE_URL)) || Response.error()
  }
}

// ---------------------------------------------------------------------------
// Push notifications
// ---------------------------------------------------------------------------

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'NUR Report', body: event.data.text(), url: '/' }
  }

  const options = {
    body: payload.body,
    icon: '/icon-512.png',
    badge: '/badge.png',
    image: payload.image,
    data: { url: payload.url || '/' },
    tag: payload.url, // replaces older notifications for the same article
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(payload.title || 'NUR Report', options),
      // Best-effort app icon badge, mirrors native news apps. Cleared client-side
      // (see clearAppBadge in src/lib/pwa.ts) once the reader opens the app.
      'setAppBadge' in self.navigator ? self.navigator.setAppBadge(1).catch(() => {}) : Promise.resolve(),
    ])
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl)
    })
  )
})
