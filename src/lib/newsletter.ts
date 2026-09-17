import 'server-only'
import { getRedis } from './redis'

const SUBSCRIBERS_KEY = 'newsletter:subscribers'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Adds an email to the newsletter subscriber set. This is deliberately a
 * simple capture list, not a full email platform — a Redis set gives free
 * deduplication, and `SMEMBERS newsletter:subscribers` gets you the whole
 * list to import into a real ESP (Mailchimp, Resend, etc.) once you're
 * ready to actually send something. Wiring up real sends is a separate task.
 */
export async function addNewsletterSubscriber(rawEmail: string): Promise<{ ok: boolean; error?: string }> {
  const email = rawEmail.trim().toLowerCase()
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Invalid email address' }

  const redis = getRedis()
  if (!redis) {
    // Storage isn't configured — don't pretend the signup worked.
    console.error('addNewsletterSubscriber: Redis not configured')
    return { ok: false, error: 'Newsletter signup is temporarily unavailable' }
  }

  try {
    await redis.sadd(SUBSCRIBERS_KEY, email)
    return { ok: true }
  } catch (err) {
    console.error('addNewsletterSubscriber failed:', err)
    return { ok: false, error: 'Something went wrong' }
  }
}

/** Current subscriber count — useful for an admin view or a social-proof line. */
export async function getSubscriberCount(): Promise<number> {
  const redis = getRedis()
  if (!redis) return 0

  try {
    return await redis.scard(SUBSCRIBERS_KEY)
  } catch (err) {
    console.error('getSubscriberCount failed:', err)
    return 0
  }
}
