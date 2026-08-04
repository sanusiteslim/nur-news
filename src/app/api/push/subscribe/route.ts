import { NextRequest, NextResponse } from 'next/server'
import { getSubscriberStore } from '@/lib/push/store'
import type { PushSubscriptionRecord } from '@/lib/push/types'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
    return NextResponse.json({ message: 'Invalid subscription payload' }, { status: 400 })
  }

  const record: PushSubscriptionRecord = {
    endpoint: body.endpoint,
    keys: { p256dh: body.keys.p256dh, auth: body.keys.auth },
    createdAt: new Date().toISOString(),
  }

  const store = getSubscriberStore()
  await store.add(record)

  return NextResponse.json({ subscribed: true })
}