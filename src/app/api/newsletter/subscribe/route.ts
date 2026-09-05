import { NextRequest, NextResponse } from 'next/server'
import { addNewsletterSubscriber } from '@/lib/newsletter'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email = body?.email

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  const result = await addNewsletterSubscriber(email)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
