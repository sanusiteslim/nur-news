import { NextRequest, NextResponse } from 'next/server'
import { getSubscriberStore } from '@/lib/push/store'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body?.endpoint) {
    return NextResponse.json({ message: 'Missing endpoint' }, { status: 400 })
  }

  const store = getSubscriberStore()
  await store.remove(body.endpoint)

  return NextResponse.json({ unsubscribed: true })
}