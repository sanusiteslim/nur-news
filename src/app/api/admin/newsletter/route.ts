import { NextRequest, NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/adminAuth'
import { client, latestBriefsQuery } from '@/lib/sanity'
import { getSubscriberStats } from '@/lib/newsletter'
import { sendBrief, wasBriefSent } from '@/lib/newsletterSend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // large lists are sent in rate-limited batches

/** Subscriber counts + recent briefs (with a "sent" flag). */
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req)
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status })

  const [stats, briefs] = await Promise.all([getSubscriberStats(), client.fetch(latestBriefsQuery)])
  const withSent = await Promise.all(
    (briefs as any[]).map(async (b) => ({
      slug: b.slug.current,
      title: b.title,
      date: b.date,
      edition: b.edition,
      sent: await wasBriefSent(b._id),
    }))
  )
  return NextResponse.json({ stats, briefs: withSent })
}

/** Body: { slug, testTo? , force? }. With testTo, sends one test email; otherwise broadcasts. */
export async function POST(req: NextRequest) {
  const denied = checkAdmin(req)
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status })

  const body = await req.json().catch(() => null)
  const slug = typeof body?.slug === 'string' ? body.slug : ''
  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 })

  const testTo = typeof body?.testTo === 'string' && body.testTo.trim() ? body.testTo.trim() : undefined
  try {
    const result = await sendBrief(slug, { testTo, force: body?.force === true })
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
    return NextResponse.json(result)
  } catch (err) {
    console.error('newsletter send failed:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Send failed' }, { status: 500 })
  }
}
