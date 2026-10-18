import { NextRequest, NextResponse } from 'next/server'

/**
 * Password prompt in front of the /admin screens (HTTP Basic auth — any
 * username, password = ADMIN_TOKEN). The admin API routes already check the
 * token themselves; this just stops strangers loading the admin UI.
 *
 * Runs on the Edge, so the comparison is a simple constant-time loop rather
 * than Node's crypto.timingSafeEqual.
 */
export const config = { matcher: ['/admin', '/admin/:path*'] }

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function middleware(req: NextRequest) {
  const token = process.env.ADMIN_TOKEN
  if (!token) return new NextResponse('Admin is not configured', { status: 503 })

  const header = req.headers.get('authorization') || ''
  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6))
      const password = decoded.slice(decoded.indexOf(':') + 1)
      if (constantTimeEqual(password, token)) return NextResponse.next()
    } catch {
      /* malformed header — fall through to the prompt */
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="NUR Report admin", charset="UTF-8"' },
  })
}
