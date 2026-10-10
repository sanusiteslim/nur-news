import 'server-only'
import { timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

/**
 * Shared-secret admin check (Authorization: Bearer <ADMIN_TOKEN>), using a
 * constant-time comparison. Returns null when authorised, otherwise an
 * { error, status } pair the route can return directly.
 */
export function checkAdmin(req: NextRequest): { error: string; status: number } | null {
  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken) return { error: 'ADMIN_TOKEN is not configured', status: 500 }

  const given = Buffer.from(req.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${adminToken}`)
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { error: 'Unauthorized', status: 401 }
  }
  return null
}
