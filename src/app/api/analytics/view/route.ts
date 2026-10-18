import { NextRequest, NextResponse } from 'next/server'
import { trackArticleView } from '@/lib/analytics'
import { clientIp } from '@/lib/adminAuth'
import { getRedis } from '@/lib/redis'

export const dynamic = 'force-dynamic'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless/i

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const slug = body?.slug

    if (typeof slug !== 'string' || slug.length > 120 || !SLUG_RE.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    // Crawlers and link previews aren't readers.
    if (BOT_RE.test(req.headers.get('user-agent') || '')) {
      return NextResponse.json({ ok: true })
    }

    // These numbers feed Most Read and the Advertise page, so one reader
    // (IP) counts once per article per 30 minutes. A single SET NX keeps this
    // to one extra Redis command per view (Upstash free tier: 500k/month).
    const redis = getRedis()
    if (redis) {
      const first = await redis.set(`view:${clientIp(req)}:${slug}`, 1, { nx: true, ex: 1800 }).catch(() => 'OK')
      if (!first) return NextResponse.json({ ok: true })
    }

    await trackArticleView(slug)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/analytics/view failed:', err)
    // Never surface analytics failures as a hard error to the reader's browser.
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
