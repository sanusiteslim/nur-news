import { Redis } from '@upstash/redis'

/**
 * Upstash Redis client — lazily created, and NEVER throws at import time.
 *
 * Why this isn't just `Redis.fromEnv()`:
 * `fromEnv()` throws immediately if UPSTASH_REDIS_REST_URL / _TOKEN are
 * missing. Because that ran at module scope, merely *importing* this file
 * crashed the process — which meant one missing env var took down the
 * homepage (via MostRead -> analytics), the newsletter signup, and the
 * election routes, all before any of their own try/catch blocks could run.
 *
 * Now a missing config is reported, not thrown. Callers that use `getRedis()`
 * get null and degrade gracefully; callers that use the `redis` proxy below
 * get a descriptive error only when they actually touch it, inside their own
 * try/catch — never at import.
 */

let cached: Redis | null | undefined

export function getRedis(): Redis | null {
  if (cached !== undefined) return cached

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn(
      '[redis] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — ' +
        'view tracking, Most Read, newsletter signup and live election results are disabled.'
    )
    cached = null
    return cached
  }

  try {
    cached = new Redis({ url, token })
  } catch (err) {
    console.error('[redis] Failed to initialise client:', err)
    cached = null
  }

  return cached
}

/** True when Redis is configured and usable. */
export function isRedisConfigured(): boolean {
  return getRedis() !== null
}

/**
 * Backwards-compatible client for code that does `import { redis }` and calls
 * methods directly (the election routes). Resolution is deferred to first
 * property access, so an unconfigured deployment fails at call time with a
 * clear message — caught by the caller's existing try/catch — instead of
 * crashing the whole module graph on import.
 */
export const redis: Redis = new Proxy({} as Redis, {
  get(_target, prop, receiver) {
    const client = getRedis()
    if (!client) {
      throw new Error(
        'Redis is not configured. Set UPSTASH_REDIS_REST_URL and ' +
          'UPSTASH_REDIS_REST_TOKEN in your environment variables.'
      )
    }
    const value = Reflect.get(client as object, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

/**
 * Read-only Redis command for cached (ISR) pages.
 *
 * The Upstash SDK sends every request with `cache: 'no-store'`, which
 * Next.js 14 refuses inside a statically cached page ("Page changed from
 * static to dynamic"). This issues the same command over Upstash's plain
 * REST GET form instead, cached by Next for `revalidate` seconds, so pages
 * like the homepage and live results stay cheap ISR pages.
 *
 * Returns the raw `result` (strings, as Redis stores them), or null.
 */
export async function redisReadCached(command: (string | number)[], revalidate: number): Promise<any> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  try {
    const path = command.map((part) => encodeURIComponent(String(part))).join('/')
    const res = await fetch(`${url.replace(/\/$/, '')}/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.result ?? null
  } catch (err) {
    console.error('[redis] cached read failed:', err)
    return null
  }
}

/** HGETALL via redisReadCached, as an object. */
export async function hgetallCached(key: string, revalidate: number): Promise<Record<string, string> | null> {
  const flat = await redisReadCached(['hgetall', key], revalidate)
  if (!Array.isArray(flat) || flat.length === 0) return null
  const out: Record<string, string> = {}
  for (let i = 0; i < flat.length; i += 2) out[flat[i]] = flat[i + 1]
  return out
}
