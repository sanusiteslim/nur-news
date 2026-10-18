import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/telegram'
import { checkAdmin } from '@/lib/adminAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type TelegramMessage = {
  message_id?: number
}

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req)
  if (denied) {
    return NextResponse.json({ error: denied.error }, { status: denied.status })
  }

  try {
    const body: unknown = await req.json()

    if (
      typeof body !== 'object' ||
      body === null ||
      !('text' in body)
    ) {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      )
    }

    const text = String(
      (body as { text?: unknown }).text ?? ''
    ).trim()

    if (!text) {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      )
    }

    if (text.length > 4096) {
      return NextResponse.json(
        {
          error:
            'Telegram messages must be 4096 characters or less',
        },
        { status: 400 }
      )
    }

    const result = await sendTelegramMessage(text) as TelegramMessage

    return NextResponse.json({
      ok: true,
      messageId: result?.message_id ?? null,
    })
  } catch (error) {
    console.error('Telegram publish failed:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Telegram publishing failed',
      },
      { status: 500 }
    )
  }
}