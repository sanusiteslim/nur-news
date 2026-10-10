import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeSubscriber } from '@/lib/newsletter'
import { getSiteUrl } from '@/lib/site'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST handles both the on-page "Unsubscribe" button (fetch) and the mail
 * client's one-click List-Unsubscribe (RFC 8058) request. Params come from the
 * query string in both cases.
 */
export async function POST(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email') ?? ''
  const token = req.nextUrl.searchParams.get('token') ?? ''
  const ok = email && token ? await unsubscribeSubscriber(email, token) : false
  return NextResponse.json({ ok }, { status: ok ? 200 : 400 })
}

/** A bare GET (link previews, scanners) must not unsubscribe anyone — send to the confirm page. */
export async function GET(req: NextRequest) {
  const url = new URL(`${getSiteUrl()}/newsletter/unsubscribe`)
  url.search = req.nextUrl.search
  return NextResponse.redirect(url)
}
