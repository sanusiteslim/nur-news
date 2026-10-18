import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'
import { bearerToken, safeEqual } from '@/lib/adminAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * On-demand revalidation, called by a Sanity GROQ webhook on publish.
 *
 * Accepts EITHER:
 *   - Authorization: Bearer <REVALIDATE_SECRET>   (custom HTTP header in the webhook)
 *   - a Sanity signature (set the webhook "Secret" to REVALIDATE_SECRET)
 *
 * Fails closed when REVALIDATE_SECRET is missing.
 *
 * Because every page's cache is invalidated the moment content changes, the
 * route-level `revalidate` timers can stay long (cheap on free tiers) while
 * readers still see edits within seconds.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json({ message: 'REVALIDATE_SECRET is not configured' }, { status: 500 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get(SIGNATURE_HEADER_NAME)

  let authorised = safeEqual(bearerToken(request), secret)
  if (!authorised && signature) {
    try {
      authorised = await isValidSignature(rawBody, signature, secret)
    } catch {
      authorised = false
    }
  }
  if (!authorised) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  let body: any = {}
  try {
    body = rawBody ? JSON.parse(rawBody) : {}
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const type: string | undefined = body?._type
  const slug: string | undefined = typeof body?.slug === 'string' ? body.slug : body?.slug?.current
  const category: string | undefined = body?.category

  revalidateTag('sanity')
  if (type) revalidateTag(type)
  if (type && slug) revalidateTag(`${type}:${slug}`)

  // Path-level invalidation covers pages that fetch without tags.
  if (type === 'article') {
    revalidatePath('/')
    if (category) revalidatePath(`/${category}`)
    if (category && slug) revalidatePath(`/${category}/${slug}`)
    revalidatePath('/rss.xml')
    revalidatePath('/news-sitemap.xml')
    revalidatePath('/sitemap.xml')
    revalidatePath('/tag/[tag]', 'page')
    revalidatePath('/topics/[slug]', 'page')
  } else if (type === 'liveEvent') {
    revalidatePath('/live')
    if (slug) revalidatePath(`/live/${slug}`)
    revalidatePath('/', 'layout') // the LIVE strip sits in the layout
  } else {
    // homepage, author, topic, brief, election… — small site, refresh all.
    revalidatePath('/', 'layout')
  }

  return NextResponse.json({ revalidated: true, type: type ?? null, slug: slug ?? null, now: Date.now() })
}
