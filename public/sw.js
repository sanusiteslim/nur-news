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
    icon: '/icon.svg',
    badge: '/icon.svg',
    image: payload.image,
    data: { url: payload.url || '/' },
    tag: payload.url, // replaces older notifications for the same article
  }

  event.waitUntil(self.registration.showNotification(payload.title || 'NUR Report', options))
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