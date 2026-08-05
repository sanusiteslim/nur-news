import { NextRequest, NextResponse } from 'next/server'
import { sendNotificationToAll } from '@/lib/push/vapid'
import { getSiteUrl } from '@/lib/site'

// Called by the Sanity webhook (see setup notes) whenever an article is
// created/updated with isBreaking == true. Configure the webhook's GROQ
// projection to send: { headline, excerpt, "slug": slug.current, category,
// isBreaking, "image": featuredImage.asset->url }
export async function POST(request: NextRequest) {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '')

  if (secret !== process.env.PUSH_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  const article = await request.json().catch(() => null)
  const slug = typeof article?.slug === 'string' ? article.slug : article?.slug?.current

  if (!article?.isBreaking || !article?.headline || !slug) {
    return NextResponse.json({ skipped: true, reason: 'Not a breaking-news article', received: article })
  }

  try {
    const result = await sendNotificationToAll({
      title: article.headline,
      body: article.excerpt || 'Breaking news on NUR Report',
      url: `${getSiteUrl()}/${article.category || 'news'}/${slug}`,
      image: article.image,
    })

    return NextResponse.json({ dispatched: true, ...result })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to send notifications' }, { status: 500 })
  }
}