import { NextRequest, NextResponse } from 'next/server'
import { confirmSubscriber } from '@/lib/newsletter'
import { getSiteUrl } from '@/lib/site'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email') ?? ''
  const token = req.nextUrl.searchParams.get('token') ?? ''
  const ok = email && token ? await confirmSubscriber(email, token) : false
  return NextResponse.redirect(`${getSiteUrl()}/newsletter/status?s=${ok ? 'confirmed' : 'invalid'}`)
}
