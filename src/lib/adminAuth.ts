import 'server-only'
import { timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

/** Constant-time string comparison. False if either side is empty. */
export function safeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/** Pulls the token out of `Authorization: Bearer <token>` (prefix optional). */
export function bearerToken(req: NextRequest): string {
  return (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
}

/**
 * Shared-secret check against the named env var (default ADMIN_TOKEN), using
 * a constant-time comparison. Fails closed: a missing env var is a 500, never
 * an open door. Returns null when authorised, otherwise an { error, status }
 * pair the route can return directly.
 */
export function checkBearer(
  req: NextRequest,
  envName = 'ADMIN_TOKEN'
): { error: string; status: number } | null {
  const expected = process.env[envName]
  if (!expected) return { error: `${envName} is not configured`, status: 500 }
  if (!safeEqual(bearerToken(req), expected)) return { error: 'Unauthorized', status: 401 }
  return null
}

/** Authorization: Bearer <ADMIN_TOKEN>. Kept for existing callers. */
export function checkAdmin(req: NextRequest): { error: string; status: number } | null {
  return checkBearer(req, 'ADMIN_TOKEN')
}

/** Best-effort client IP. On Vercel, x-real-ip is set by the platform. */
export function clientIp(req: NextRequest): string {
  return (
    req.ip ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}
