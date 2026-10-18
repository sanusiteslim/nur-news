import { NextRequest, NextResponse } from 'next/server'
import { sendNotificationToAll } from '@/lib/push/vapid'
import { getSiteUrl } from '@/lib/site'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'
import { getRedis } from '@/lib/redis'
import { validCategories } from '@/lib/taxonomy'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const HISTORY_KEY = 'notifications-history'
const HISTORY_MAX = 200
// Sanity signs `t=<ms>,v1=<sig>`; anything older than this is a replay.
const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000

function signatureTimestamp(signature: string): number | null {
  const m = signature.match(/t=(\d+)/)
  return m ? Number(m[1]) : null
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.SANITY_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ message: 'SANITY_WEBHOOK_SECRET is not configured' }, { status: 500 })
  }

  try {
    const rawBody = await request.text()
    const signature = request.headers.get(SIGNATURE_HEADER_NAME) || ''

    const isValid = await isValidSignature(rawBody, signature, webhookSecret).catch(() => false)
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid token signature' }, { status: 401 })
    }
    const ts = signatureTimestamp(signature)
    if (ts && Math.abs(Date.now() - ts) > MAX_SIGNATURE_AGE_MS) {
      return NextResponse.json({ message: 'Stale signature' }, { status: 401 })
    }

    const article = JSON.parse(rawBody)
    const slug: string | undefined = typeof article?.slug === 'string' ? article.slug : article?.slug?.current

    if (!article?.headline || !slug) {
      return NextResponse.json({ skipped: true, reason: 'Missing headline or slug' })
    }

    // Only published articles notify. Edits to drafts / scheduled pieces
    // must never ping every subscriber.
    if (article.status && article.status !== 'published') {
      return NextResponse.json({ skipped: true, reason: 'Not published' })
    }

    // One notification per article, ever — Sanity retries and later edits
    // are ignored. If Redis is down we still send (once per delivery).
    const redis = getRedis()
    const id = article._id || slug
    if (redis) {
      const claimed = await redis.set(`push:sent:${id}`, Date.now(), { nx: true, ex: 60 * 60 * 24 * 30 })
      if (!claimed) return NextResponse.json({ skipped: true, reason: 'Already notified' })
    }

    const category = validCategories.includes(article.category) ? article.category : null
    if (!category) {
      return NextResponse.json({ skipped: true, reason: 'Unknown category' })
    }

    const result = await sendNotificationToAll({
      title: article.headline,
      body: article.excerpt || (article.isBreaking ? 'Breaking news on NUR Report' : 'New on NUR Report'),
      url: `${getSiteUrl()}/${category}/${slug}`,
      image: typeof article.image === 'string' && article.image.startsWith('https://cdn.sanity.io/') ? article.image : undefined,
    })

    if (redis) {
      await redis.rpush(HISTORY_KEY, JSON.stringify({ headline: article.headline, slug, timestamp: Date.now() }))
      await redis.ltrim(HISTORY_KEY, -HISTORY_MAX, -1)
    }

    return NextResponse.json({ dispatched: true, total: result.total, sent: result.sent, pruned: result.pruned, failed: result.failed })
  } catch (err) {
    console.error('Push webhook failed:', err)
    return NextResponse.json({ message: 'Failed to send notifications' }, { status: 500 })
  }
}
