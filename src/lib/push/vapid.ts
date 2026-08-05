import 'server-only'
import webPush from 'web-push'
import { getSubscriberStore } from './store'
import type { NotificationPayload } from './types'

let configured = false

function ensureConfigured() {
  if (configured) return

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:news@nurreport.name.ng'

  if (!publicKey || !privateKey) {
    throw new Error(
      'Push notifications are not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY (run `npx web-push generate-vapid-keys`).'
    )
  }

  webPush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
}

/**
 * Sends a notification to every stored subscriber. Subscriptions that the
 * push service reports as gone (404/410 — the user uninstalled, cleared
 * data, or revoked permission) are removed from the store automatically.
 */
export async function sendNotificationToAll(payload: NotificationPayload) {
  ensureConfigured()

  const store = getSubscriberStore()
  const subscribers = await store.all()

  const results = await Promise.allSettled(
    subscribers.map((sub) =>
      webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        JSON.stringify(payload)
      )
    )
  )

  let sent = 0
  let pruned = 0
  const failures: { endpoint: string; statusCode?: number; message?: string }[] = []

  await Promise.all(
    results.map(async (result, i) => {
      if (result.status === 'fulfilled') {
        sent++
        return
      }
      const statusCode = (result.reason as any)?.statusCode
      const endpoint = subscribers[i].endpoint

      if (statusCode === 404 || statusCode === 410) {
        await store.remove(endpoint)
        pruned++
        return
      }

      failures.push({
        endpoint: endpoint.slice(0, 60) + '…',
        statusCode,
        message: (result.reason as any)?.body || (result.reason as any)?.message,
      })
    })
  )

  if (failures.length > 0) {
    console.error('[push] send failures:', JSON.stringify(failures, null, 2))
  }

  return { total: subscribers.length, sent, pruned, failed: failures.length, failures }
}