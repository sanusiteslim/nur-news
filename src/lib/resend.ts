import 'server-only'

/**
 * Minimal Resend client over the REST API (no SDK dependency).
 * Docs: https://resend.com/docs/api-reference
 *
 * Env:
 *   RESEND_API_KEY       re_xxx  (Resend dashboard -> API Keys, "Sending access")
 *   NEWSLETTER_FROM      "NUR Report <brief@nurreport.name.ng>"  (domain must be verified in Resend)
 *   NEWSLETTER_REPLY_TO  optional, e.g. news@nurreport.name.ng
 */

const API = 'https://api.resend.com'

export type EmailPayload = {
  to: string | string[]
  subject: string
  html: string
  text?: string
  headers?: Record<string, string>
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM)
}

function config() {
  const key = process.env.RESEND_API_KEY
  const from = process.env.NEWSLETTER_FROM
  if (!key || !from) {
    throw new Error('Resend is not configured. Set RESEND_API_KEY and NEWSLETTER_FROM.')
  }
  return { key, from, replyTo: process.env.NEWSLETTER_REPLY_TO || undefined }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function post(path: string, body: unknown, idempotencyKey?: string): Promise<any> {
  const { key } = config()

  // Resend's default limit is 2 requests/second; retry politely on 429.
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    if (res.status === 429 && attempt < 3) {
      const retryAfter = Number(res.headers.get('retry-after')) || 1
      await sleep(retryAfter * 1000 + 250)
      continue
    }

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(`Resend ${res.status}: ${data?.message || data?.name || 'request failed'}`)
    }
    return data
  }
  throw new Error('Resend: rate limited')
}

function toResend(p: EmailPayload) {
  const { from, replyTo } = config()
  return {
    from,
    to: Array.isArray(p.to) ? p.to : [p.to],
    subject: p.subject,
    html: p.html,
    ...(p.text ? { text: p.text } : {}),
    ...(replyTo ? { reply_to: replyTo } : {}),
    ...(p.headers ? { headers: p.headers } : {}),
  }
}

/** Send a single email. */
export async function sendEmail(p: EmailPayload, idempotencyKey?: string): Promise<{ id: string }> {
  return post('/emails', toResend(p), idempotencyKey)
}

/** Send up to 100 individually-addressed emails in one API call. */
export async function sendBatch(payloads: EmailPayload[], idempotencyKey?: string): Promise<void> {
  if (payloads.length === 0) return
  if (payloads.length > 100) throw new Error('Resend batch limit is 100 emails per call')
  await post('/emails/batch', payloads.map(toResend), idempotencyKey)
}
