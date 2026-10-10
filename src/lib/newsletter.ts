import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'
import { getRedis } from './redis'
import { getSiteUrl } from './site'
import { isResendConfigured, sendEmail } from './resend'
import { confirmationEmail } from './newsletterEmail'

/**
 * Newsletter subscribers — double opt-in, stored in an Upstash Redis hash.
 *
 *   newsletter:subs   hash   email -> Subscriber (JSON)
 *
 * (The old `newsletter:subscribers` SET is left untouched; import it with
 *  scripts/migrate-newsletter.mjs.)
 *
 * Confirm / unsubscribe links are stateless: an HMAC of the email signed with
 * NEWSLETTER_SECRET, so nothing extra needs storing and links never expire.
 */

export type SubscriberStatus = 'pending' | 'active' | 'unsubscribed'

export type Subscriber = {
  email: string
  status: SubscriberStatus
  subscribedAt: string
  confirmedAt?: string
  unsubscribedAt?: string
  lastConfirmationSentAt?: string
  source?: string
}

export const SUBS_KEY = 'newsletter:subs'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RESEND_CONFIRMATION_COOLDOWN_MS = 5 * 60 * 1000

/* ---------------------------------- tokens --------------------------------- */

function secret(): string {
  const s = process.env.NEWSLETTER_SECRET
  if (!s) throw new Error('NEWSLETTER_SECRET is not set')
  return s
}

export function signToken(email: string, purpose: 'confirm' | 'unsubscribe'): string {
  return createHmac('sha256', secret()).update(`${purpose}:${email}`).digest('base64url')
}

export function verifyToken(email: string, purpose: 'confirm' | 'unsubscribe', token: string): boolean {
  try {
    const a = Buffer.from(signToken(email, purpose))
    const b = Buffer.from(token)
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function confirmUrl(email: string): string {
  return `${getSiteUrl()}/api/newsletter/confirm?email=${encodeURIComponent(email)}&token=${signToken(email, 'confirm')}`
}

export function unsubscribeUrl(email: string): string {
  return `${getSiteUrl()}/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${signToken(email, 'unsubscribe')}`
}

/** Direct POST endpoint used by the RFC 8058 one-click List-Unsubscribe header. */
export function oneClickUnsubscribeUrl(email: string): string {
  return `${getSiteUrl()}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${signToken(email, 'unsubscribe')}`
}

/* -------------------------------- operations -------------------------------- */

export function normaliseEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

/**
 * Step 1 of double opt-in: record the address as `pending` and email a
 * confirmation link. Already-active addresses return ok without sending
 * anything (so the form can't be used to probe who is subscribed).
 */
export async function addNewsletterSubscriber(
  rawEmail: string,
  source = 'website'
): Promise<{ ok: boolean; error?: string }> {
  const email = normaliseEmail(rawEmail)
  if (email.length > 254 || !EMAIL_RE.test(email)) return { ok: false, error: 'Invalid email address' }

  const redis = getRedis()
  if (!redis || !isResendConfigured() || !process.env.NEWSLETTER_SECRET) {
    console.error('addNewsletterSubscriber: Redis, Resend or NEWSLETTER_SECRET not configured')
    return { ok: false, error: 'Newsletter signup is temporarily unavailable' }
  }

  try {
    const existing = await redis.hget<Subscriber>(SUBS_KEY, email)
    const now = new Date()

    if (existing?.status === 'active') return { ok: true }

    if (
      existing?.status === 'pending' &&
      existing.lastConfirmationSentAt &&
      now.getTime() - new Date(existing.lastConfirmationSentAt).getTime() < RESEND_CONFIRMATION_COOLDOWN_MS
    ) {
      return { ok: true } // confirmation already sent moments ago
    }

    const record: Subscriber = {
      email,
      status: 'pending',
      subscribedAt: existing?.subscribedAt ?? now.toISOString(),
      lastConfirmationSentAt: now.toISOString(),
      source: existing?.source ?? source,
    }
    await redis.hset(SUBS_KEY, { [email]: record })

    const mail = confirmationEmail(confirmUrl(email))
    try {
      await sendEmail({ to: email, ...mail })
    } catch (err) {
      console.error('addNewsletterSubscriber: confirmation email failed:', err)
      if (!existing) await redis.hdel(SUBS_KEY, email)
      return { ok: false, error: 'We could not send the confirmation email. Please try again.' }
    }
    return { ok: true }
  } catch (err) {
    console.error('addNewsletterSubscriber failed:', err)
    return { ok: false, error: 'Something went wrong' }
  }
}

/** Step 2: the person clicked the link in the confirmation email. */
export async function confirmSubscriber(rawEmail: string, token: string): Promise<boolean> {
  const email = normaliseEmail(rawEmail)
  if (!verifyToken(email, 'confirm', token)) return false

  const redis = getRedis()
  if (!redis) return false

  try {
    const existing = await redis.hget<Subscriber>(SUBS_KEY, email)
    if (!existing) return false
    if (existing.status === 'active') return true
    await redis.hset(SUBS_KEY, {
      [email]: { ...existing, status: 'active', confirmedAt: new Date().toISOString() } satisfies Subscriber,
    })
    return true
  } catch (err) {
    console.error('confirmSubscriber failed:', err)
    return false
  }
}

export async function unsubscribeSubscriber(rawEmail: string, token: string): Promise<boolean> {
  const email = normaliseEmail(rawEmail)
  if (!verifyToken(email, 'unsubscribe', token)) return false

  const redis = getRedis()
  if (!redis) return false

  try {
    const existing = await redis.hget<Subscriber>(SUBS_KEY, email)
    if (!existing) return true // nothing to remove
    await redis.hset(SUBS_KEY, {
      [email]: { ...existing, status: 'unsubscribed', unsubscribedAt: new Date().toISOString() } satisfies Subscriber,
    })
    return true
  } catch (err) {
    console.error('unsubscribeSubscriber failed:', err)
    return false
  }
}

/* --------------------------------- reading ---------------------------------- */

async function allSubscribers(): Promise<Subscriber[]> {
  const redis = getRedis()
  if (!redis) return []
  const all = await redis.hgetall<Record<string, Subscriber>>(SUBS_KEY)
  return all ? Object.values(all) : []
}

/** Every confirmed subscriber's address — the send list. */
export async function getActiveEmails(): Promise<string[]> {
  try {
    return (await allSubscribers()).filter((s) => s.status === 'active').map((s) => s.email)
  } catch (err) {
    console.error('getActiveEmails failed:', err)
    return []
  }
}

export async function getSubscriberStats(): Promise<Record<SubscriberStatus, number>> {
  const stats = { pending: 0, active: 0, unsubscribed: 0 }
  try {
    for (const s of await allSubscribers()) stats[s.status]++
  } catch (err) {
    console.error('getSubscriberStats failed:', err)
  }
  return stats
}

/** Confirmed subscribers — useful for a social-proof line. */
export async function getSubscriberCount(): Promise<number> {
  return (await getSubscriberStats()).active
}

/* ------------------------------- rate limiting ------------------------------ */

/** Fixed-window limiter. Fails open if Redis is unavailable. */
export async function rateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return true
  try {
    const k = `ratelimit:${key}`
    const n = await redis.incr(k)
    if (n === 1) await redis.expire(k, windowSeconds)
    return n <= max
  } catch {
    return true
  }
}
