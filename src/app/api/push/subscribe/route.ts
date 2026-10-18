import { NextRequest, NextResponse } from 'next/server'
import { getSubscriberStore } from '@/lib/push/store'
import { parseSubscription } from '@/lib/push/validate'
import { rateLimit } from '@/lib/newsletter'
import { clientIp } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!(await rateLimit(`push-sub:${clientIp(request)}`, 10, 3600))) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  const record = parseSubscription(body)
  if (!record) {
    return NextResponse.json({ message: 'Invalid subscription payload' }, { status: 400 })
  }

  await getSubscriberStore().add(record)
  return NextResponse.json({ subscribed: true })
}
