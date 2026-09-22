import { NextRequest, NextResponse } from 'next/server'
import { createArticleDistributionText } from '@/lib/distribution'
import { sendTelegramMessage } from '@/lib/telegram'
import { getRedis } from '@/lib/redis'

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

  const incomingSecret =
    req.headers.get('x-sanity-webhook-secret') ||
    req.nextUrl.searchParams.get('secret')

  if (incomingSecret !== webhookSecret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const document =
      (await req.json()) as SanityDocument

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

    if (redis) {
      const alreadyPublished = await redis.get(dedupeKey)

      if (alreadyPublished) {
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

    await sendTelegramMessage(text)

    if (redis) {
      await redis.set(
        dedupeKey,
        new Date().toISOString()
      )
    }

    return NextResponse.json({
      ok: true,
      published: true,
    })
  } catch (error) {
    console.error('Sanity Telegram webhook failed:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Webhook failed',
      },
      { status: 500 }
    )
  }
}