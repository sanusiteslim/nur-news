import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { suppressSubscriber } from '@/lib/newsletter'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Resend webhook (free on every plan). In Resend → Webhooks, add
 *   https://www.nurreport.name.ng/api/webhooks/resend
 * with the events email.bounced and email.complained, then copy the
 * signing secret (whsec_…) into RESEND_WEBHOOK_SECRET.
 *
 * Hard bounces and spam complaints stop all further mail to that address —
 * repeatedly mailing them is the fastest way to get a sending domain blocked.
 *
 * Signature check follows the Svix scheme Resend uses, implemented here
 * directly so no extra package is needed.
 */
const TOLERANCE_SECONDS = 5 * 60

function verify(body: string, headers: Headers, secret: string): boolean {
  const id = headers.get('svix-id')
  const timestamp = headers.get('svix-timestamp')
  const signatures = headers.get('svix-signature')
  if (!id || !timestamp || !signatures) return false

  const ts = Number(timestamp)
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SECONDS) return false

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest()

  return signatures.split(' ').some((part) => {
    const [version, sig] = part.split(',')
    if (version !== 'v1' || !sig) return false
    const given = Buffer.from(sig, 'base64')
    return given.length === expected.length && timingSafeEqual(given, expected)
  })
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'RESEND_WEBHOOK_SECRET is not configured' }, { status: 500 })

  const body = await req.text()
  if (!verify(body, req.headers, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const reason =
    event?.type === 'email.bounced'
      ? // Soft bounces (full inbox, temporary) shouldn't unsubscribe anyone.
        event?.data?.bounce?.type && String(event.data.bounce.type).toLowerCase() !== 'permanent'
        ? null
        : 'bounced'
      : event?.type === 'email.complained'
        ? 'complained'
        : null

  if (!reason) return NextResponse.json({ ok: true, ignored: event?.type ?? 'unknown' })

  const recipients: string[] = Array.isArray(event?.data?.to) ? event.data.to : [event?.data?.to].filter(Boolean)
  try {
    await Promise.all(recipients.map((to) => suppressSubscriber(String(to), reason)))
  } catch (err) {
    console.error('Resend webhook: suppress failed', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, suppressed: recipients.length, reason })
}
