import { NextRequest, NextResponse } from 'next/server'
import { trackArticleView } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const slug = body?.slug

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    await trackArticleView(slug)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/analytics/view failed:', err)
    // Never surface analytics failures as a hard error to the reader's browser.
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
