import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/telegram'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN

  if (!adminToken) {
    return NextResponse.json(
      { error: 'ADMIN_TOKEN is not configured' },
      { status: 500 }
    )
  }

  const auth = req.headers.get('authorization')

  if (auth !== `Bearer ${adminToken}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()

    const text = String(body.text || '').trim()

    if (!text) {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      )
    }

    if (text.length > 4096) {
      return NextResponse.json(
        { error: 'Telegram messages must be 4096 characters or less' },
        { status: 400 }
      )
    }

    const result = await sendTelegramMessage(text)

    return NextResponse.json({
      ok: true,
      messageId: (result as any)?.message_id ?? null,
    })
  } catch (error) {
    console.error('Telegram publish failed:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Telegram publish failed',
      },
      { status: 500 }
    )
  }
}