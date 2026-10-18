import { NextRequest, NextResponse } from 'next/server'
import { updatePreferences } from '@/lib/newsletter'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Body: { email, token, lists: ('daily'|'weekly')[] }. An empty list unsubscribes. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email : ''
  const token = typeof body?.token === 'string' ? body.token : ''
  const lists = Array.isArray(body?.lists) ? body.lists : []

  if (!email || !token) return NextResponse.json({ error: 'Invalid link' }, { status: 400 })

  const result = await updatePreferences(email, token, lists)
  if (!result.ok) {
    return NextResponse.json({ error: 'That link is invalid, or this address can no longer receive email.' }, { status: 400 })
  }
  return NextResponse.json(result)
}
