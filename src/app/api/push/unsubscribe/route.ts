import { NextRequest, NextResponse } from 'next/server'
import { getSubscriberStore } from '@/lib/push/store'
import { isAllowedPushEndpoint } from '@/lib/push/validate'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!isAllowedPushEndpoint(body?.endpoint)) {
    return NextResponse.json({ message: 'Missing endpoint' }, { status: 400 })
  }

  await getSubscriberStore().remove(body.endpoint)
  return NextResponse.json({ unsubscribed: true })
}
