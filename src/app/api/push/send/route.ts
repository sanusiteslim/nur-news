import { NextRequest, NextResponse } from 'next/server'
import { sendNotificationToAll } from '@/lib/push/vapid'
import { getSiteUrl } from '@/lib/site'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'
import { Redis } from '@upstash/redis'

// Initialize Upstash Redis instance (automatically uses env variables)
const redis = Redis.fromEnv()
const webhookSecret = process.env.SANITY_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    // 1. Read raw body as text (Required for Sanity signature validation)
    const rawBody = await request.text()
    const signature = request.headers.get(SIGNATURE_HEADER_NAME) || ''

    // 2. Validate the request signature securely
    const isValid = await isValidSignature(rawBody, signature, webhookSecret)
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid token signature' }, { status: 401 })
    }

    // 3. Parse the verified payload content
    const article = JSON.parse(rawBody)
    const slug = typeof article?.slug === 'string' ? article.slug : article?.slug?.current

    // 4. Validate requirements for breaking news notifications
    if (!article?.isBreaking || !article?.headline || !slug) {
      return NextResponse.json({ 
        skipped: true, 
        reason: 'Not a breaking-news article or missing required fields', 
        received: article 
      })
    }

    // 5. Optional: Log notification broadcast history to Upstash Redis
    await redis.rpush('notifications-history', JSON.stringify({
      headline: article.headline,
      slug: slug,
      timestamp: Date.now()
    }))

    // 6. Execute your existing browser notification broadcast logic
    const result = await sendNotificationToAll({
      title: article.headline,
      body: article.excerpt || 'Breaking news on NUR Report',
      url: `${getSiteUrl()}/${article.category || 'news'}/${slug}`,
      image: article.image,
    })

    return NextResponse.json({ dispatched: true, ...result })
  } catch (err: any) {
    console.error('Webhook execution failed:', err)
    return NextResponse.json({ message: err.message || 'Failed to send notifications' }, { status: 500 })
  }
}
