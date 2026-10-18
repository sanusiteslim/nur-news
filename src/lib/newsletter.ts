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

/**
 * Lists a reader can choose between. Kept to two so a growing list stays
 * inside Resend's free tier (100 emails/day, 3,000/month): breaking news goes
 * out through push + Telegram instead, which cost nothing per message.
 */
export const NEWSLETTER_LISTS = [
  {
    id: 'daily',
    name: 'The NUR Report Brief',
    cadence: 'Weekday evenings',
    description: "The day's most important stories from Nigeria, Africa and the world, in one short email.",
  },
  {
    id: 'weekly',
    name: 'The Weekend Digest',
    cadence: 'Saturday mornings',
    description: 'The week in five minutes: the stories that mattered, the best opinion, and what to watch next week.',
  },
] as const

export type NewsletterList = (typeof NEWSLETTER_LISTS)[number]['id']
export const ALL_LISTS: NewsletterList[] = NEWSLETTER_LISTS.map((l) => l.id)

export function isNewsletterList(v: unknown): v is NewsletterList {
  return typeof v === 'string' && (ALL_LISTS as string[]).includes(v)
}

export type Subscriber = {
  email: string
  status: SubscriberStatus
  subscribedAt: string
  confirmedAt?: string
  unsubscribedAt?: string
  lastConfirmationSentAt?: string
  source?: string
  /** Lists this reader receives. Missing (older records) = every list. */
  lists?: NewsletterList[]
  /** Why the address stopped receiving mail, when it wasn't the reader's choice. */
  suppressedReason?: 'bounced' | 'complained'
}

/** Lists a subscriber receives, treating older records as subscribed to all. */
export function subscriberLists(s: Pick<Subscriber, 'lists'>): NewsletterList[] {
  return Array.isArray(s.lists) ? s.lists.filter(isNewsletterList) : [...ALL_LISTS]
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

/** Manage-preferences page. Uses the unsubscribe token: same capability. */
export function preferencesUrl(email: string): string {
  return `${getSiteUrl()}/newsletter/preferences?email=${encodeURIComponent(email)}&token=${signToken(email, 'unsubscribe')}`
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
  source = 'website',
  requestedLists: NewsletterList[] = ALL_LISTS
): Promise<{ ok: boolean; error?: string }> {
  const lists = requestedLists.filter(isNewsletterList)
  if (lists.length === 0) return { ok: false, error: 'Choose at least one newsletter' }
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

    if (existing?.status === 'active') {
      // Already confirmed: quietly add any newly ticked lists. Still returns
      // the same response, so the form can't be used to probe who subscribes.
      const merged = Array.from(new Set([...subscriberLists(existing), ...lists]))
      if (merged.length !== subscriberLists(existing).length) {
        await redis.hset(SUBS_KEY, { [email]: { ...existing, lists: merged } satisfies Subscriber })
      }
      return { ok: true }
    }

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
      lists,
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

/** Reads a subscriber for the preferences page (token-checked). */
export async function getSubscriberForPreferences(
  rawEmail: string,
  token: string
): Promise<{ email: string; status: SubscriberStatus; lists: NewsletterList[] } | null> {
  const email = normaliseEmail(rawEmail)
  if (!verifyToken(email, 'unsubscribe', token)) return null
  const redis = getRedis()
  if (!redis) return null
  try {
    const existing = await redis.hget<Subscriber>(SUBS_KEY, email)
    if (!existing) return null
    return {
      email,
      status: existing.status,
      lists: existing.status === 'active' ? subscriberLists(existing) : [],
    }
  } catch (err) {
    console.error('getSubscriberForPreferences failed:', err)
    return null
  }
}

/**
 * Saves the lists a reader wants. An empty selection unsubscribes them;
 * choosing lists again re-activates a previously confirmed address (the
 * token proves they own the inbox, so no fresh opt-in is needed).
 */
export async function updatePreferences(
  rawEmail: string,
  token: string,
  requested: unknown[]
): Promise<{ ok: boolean; status?: SubscriberStatus; lists?: NewsletterList[] }> {
  const email = normaliseEmail(rawEmail)
  if (!verifyToken(email, 'unsubscribe', token)) return { ok: false }
  const redis = getRedis()
  if (!redis) return { ok: false }

  const lists = Array.from(new Set(requested.filter(isNewsletterList)))
  try {
    const existing = await redis.hget<Subscriber>(SUBS_KEY, email)
    if (!existing) return { ok: false }
    // Never silently re-mail an address that bounced or reported spam.
    if (existing.suppressedReason && lists.length > 0) return { ok: false }

    const now = new Date().toISOString()
    const next: Subscriber =
      lists.length === 0
        ? { ...existing, status: 'unsubscribed', unsubscribedAt: now }
        : {
            ...existing,
            lists,
            status: existing.confirmedAt || existing.status === 'active' ? 'active' : existing.status,
            unsubscribedAt: undefined,
          }
    await redis.hset(SUBS_KEY, { [email]: next })
    return { ok: true, status: next.status, lists: next.status === 'active' ? lists : [] }
  } catch (err) {
    console.error('updatePreferences failed:', err)
    return { ok: false }
  }
}

/** Stops all mail to an address after a hard bounce or spam complaint. */
export async function suppressSubscriber(rawEmail: string, reason: 'bounced' | 'complained'): Promise<void> {
  const email = normaliseEmail(rawEmail)
  const redis = getRedis()
  if (!redis) return
  const existing = await redis.hget<Subscriber>(SUBS_KEY, email)
  if (!existing) return
  await redis.hset(SUBS_KEY, {
    [email]: {
      ...existing,
      status: 'unsubscribed',
      unsubscribedAt: new Date().toISOString(),
      suppressedReason: reason,
    } satisfies Subscriber,
  })
}

/* --------------------------------- reading ---------------------------------- */

async function allSubscribers(): Promise<Subscriber[]> {
  const redis = getRedis()
  if (!redis) return []
  const all = await redis.hgetall<Record<string, Subscriber>>(SUBS_KEY)
  return all ? Object.values(all) : []
}

/** Every confirmed subscriber's address — the send list, optionally for one list. */
export async function getActiveEmails(list?: NewsletterList): Promise<string[]> {
  try {
    return (await allSubscribers())
      .filter((s) => s.status === 'active' && (!list || subscriberLists(s).includes(list)))
      .map((s) => s.email)
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

/** Active subscribers per list — for the admin screen. */
export async function getListCounts(): Promise<Record<NewsletterList, number>> {
  const counts = Object.fromEntries(ALL_LISTS.map((l) => [l, 0])) as Record<NewsletterList, number>
  try {
    for (const s of await allSubscribers()) {
      if (s.status !== 'active') continue
      for (const l of subscriberLists(s)) counts[l]++
    }
  } catch (err) {
    console.error('getListCounts failed:', err)
  }
  return counts
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
