import { NextRequest, NextResponse } from 'next/server'
import { addNewsletterSubscriber, rateLimit, isNewsletterList, ALL_LISTS, normaliseEmail } from '@/lib/newsletter'
import { clientIp } from '@/lib/adminAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email = body?.email

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  // Honeypot: real users never see or fill this field. Pretend success to bots.
  if (typeof body?.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  // Per-IP and per-address limits: the second stops anyone using the form to
  // flood one inbox with confirmation emails (which also burns the Resend quota).
  const [ipOk, emailOk] = await Promise.all([
    rateLimit(`newsletter:${clientIp(req)}`, 5, 3600),
    rateLimit(`newsletter-email:${normaliseEmail(email)}`, 3, 86400),
  ])
  if (!ipOk || !emailOk) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
  }

  const lists = Array.isArray(body?.lists) ? body.lists.filter(isNewsletterList) : ALL_LISTS
  const source = typeof body?.source === 'string' ? body.source.slice(0, 40) : 'website'

  const result = await addNewsletterSubscriber(email, source, lists)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ ok: true, pending: true })
}
