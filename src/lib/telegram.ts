import 'server-only'
import {getRedis } from '@/lib/redis'

const TELEGRAM_API = 'https://api.telegram.org'

type TelegramResponse<T = unknown> = {
  ok: boolean
  result?: T
  description?: string
}

function getConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHANNEL_ID

  if (!token || !chatId) {
    throw new Error(
      'Telegram is not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID.'
    )
  }

  return { token, chatId }
}

export async function sendTelegramMessage(text: string) {
  const { token, chatId } = getConfig()

  const response = await fetch(
    `${TELEGRAM_API}/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: false,
      }),
      cache: 'no-store',
    }
  )

  const data =
    (await response.json()) as TelegramResponse

  if (!response.ok || !data.ok) {
    throw new Error(
      data.description ||
        `Telegram API returned ${response.status}`
    )
  }

  return data.result
}