import 'server-only'
import { redis } from './redis'

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

  try {
    await redis.sadd(SUBSCRIBERS_KEY, email)
    return { ok: true }
  } catch (err) {
    console.error('addNewsletterSubscriber failed:', err)
    return { ok: false, error: 'Something went wrong' }
  }
}
