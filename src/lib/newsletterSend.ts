import 'server-only'
import { createClient } from 'next-sanity'
import { getRedis } from './redis'
import { briefBySlugQuery } from './sanity'
import { sendBatch, sendEmail, isResendConfigured } from './resend'
import { getActiveEmails, oneClickUnsubscribeUrl, unsubscribeUrl } from './newsletter'
import { briefEmail, type BriefForEmail } from './newsletterEmail'

// Fresh (non-CDN) reads: an editor who just hit Publish must not mail yesterday's copy.
const freshClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-07-17',
  useCdn: false,
})

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const sentKey = (briefId: string) => `newsletter:sent:${briefId}`

export async function wasBriefSent(briefId: string): Promise<boolean> {
  const redis = getRedis()
  return redis ? Boolean(await redis.get(sentKey(briefId))) : false
}

export type SendResult =
  | { ok: true; mode: 'test' | 'broadcast'; sent: number }
  | { ok: false; error: string; status: number }

export async function sendBrief(
  slug: string,
  opts: { testTo?: string; force?: boolean } = {}
): Promise<SendResult> {
  if (!isResendConfigured() || !process.env.NEWSLETTER_SECRET) {
    return { ok: false, status: 500, error: 'Set RESEND_API_KEY, NEWSLETTER_FROM and NEWSLETTER_SECRET first' }
  }

  const brief = (await freshClient.fetch(briefBySlugQuery, { slug })) as (BriefForEmail & { _id: string }) | null
  if (!brief) return { ok: false, status: 404, error: 'Published brief not found for that slug' }

  // ---- test send: one email to one address, never recorded as "sent" ----
  if (opts.testTo) {
    const mail = briefEmail(brief, unsubscribeUrl(opts.testTo))
    await sendEmail({ to: opts.testTo, ...mail, subject: `[TEST] ${mail.subject}` })
    return { ok: true, mode: 'test', sent: 1 }
  }

  // ---- broadcast ----
  if (!opts.force && (await wasBriefSent(brief._id))) {
    return { ok: false, status: 409, error: 'This brief was already sent. Pass force to send again.' }
  }

  const emails = await getActiveEmails()
  if (emails.length === 0) return { ok: false, status: 400, error: 'No confirmed subscribers' }

  let sent = 0
  const CHUNK = 100 // Resend batch maximum
  for (let i = 0; i < emails.length; i += CHUNK) {
    const chunk = emails.slice(i, i + CHUNK)
    const payloads = chunk.map((to) => {
      const mail = briefEmail(brief, unsubscribeUrl(to))
      return {
        to,
        ...mail,
        headers: {
          // Gmail/Yahoo bulk-sender requirement: one-click unsubscribe (RFC 8058).
          'List-Unsubscribe': `<${oneClickUnsubscribeUrl(to)}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }
    })
    // Idempotency key => a retried request after a timeout can't double-send a chunk.
    await sendBatch(payloads, `brief-${brief._id}-${opts.force ? Date.now() : 'v1'}-${i / CHUNK}`)
    sent += chunk.length
    if (i + CHUNK < emails.length) await sleep(600) // stay under 2 req/s
  }

  const redis = getRedis()
  if (redis) await redis.set(sentKey(brief._id), JSON.stringify({ at: new Date().toISOString(), sent }))
  return { ok: true, mode: 'broadcast', sent }
}
