import { NextRequest, NextResponse } from 'next/server'
import { createArticleDistributionText } from '@/lib/distribution'
import { sendTelegramMessage } from '@/lib/telegram'
import { getRedis } from '@/lib/redis'
import { safeEqual } from '@/lib/adminAuth'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type SanityDocument = {
  _id?: string
  _type?: string
  headline?: string
  excerpt?: string
  slug?: {
    current?: string
  }
  category?: string
  status?: string
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.SANITY_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    )
  }

  // Preferred: Sanity's signed webhook (set the webhook "Secret" field).
  // Still accepted for existing setups: the x-sanity-webhook-secret header,
  // or ?secret= in the URL — move off the query param when convenient, as
  // URLs end up in logs.
  const rawBody = await req.text()
  const signature = req.headers.get(SIGNATURE_HEADER_NAME)
  let authorised = safeEqual(
    req.headers.get('x-sanity-webhook-secret') || req.nextUrl.searchParams.get('secret'),
    webhookSecret
  )
  if (!authorised && signature) {
    try {
      authorised = await isValidSignature(rawBody, signature, webhookSecret)
    } catch {
      authorised = false
    }
  }

  if (!authorised) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const document = JSON.parse(rawBody) as SanityDocument

    if (document._type !== 'article') {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: 'Not an article',
      })
    }

    if (document.status !== 'published') {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: 'Article is not published',
      })
    }

    if (
      !document._id ||
      !document.headline ||
      !document.slug?.current
    ) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: 'Missing article data',
      })
    }

    const redis = getRedis()

    /*
     * Prevent duplicate Telegram posts.
     *
     * If Redis isn't configured, we still publish once.
     * Redis is only used as a duplicate guard.
     */
    const dedupeKey = `telegram:published:${document._id}`

    // Claim the slot atomically BEFORE sending, so two concurrent webhook
    // deliveries (Sanity retries) can't both post.
    if (redis) {
      const claimed = await redis.set(dedupeKey, new Date().toISOString(), { nx: true })
      if (!claimed) {
        return NextResponse.json({
          ok: true,
          skipped: true,
          reason: 'Already published to Telegram',
        })
      }
    }

    const text = createArticleDistributionText({
      headline: document.headline,
      excerpt: document.excerpt,
      slug: {
        current: document.slug.current,
      },
      category: document.category,
    })

    try {
      await sendTelegramMessage(text)
    } catch (err) {
      // Release the claim so a retry can post.
      if (redis) await redis.del(dedupeKey)
      throw err
    }

    return NextResponse.json({
      ok: true,
      published: true,
    })
  } catch (error) {
    console.error('Sanity Telegram webhook failed:', error)

    return NextResponse.json(
      { error: 'Webhook failed' },
      { status: 500 }
    )
  }
}