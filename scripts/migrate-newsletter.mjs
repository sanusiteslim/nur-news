// One-off: import emails from the old `newsletter:subscribers` SET into the new
// `newsletter:subs` hash as ACTIVE. They opted in via the old form, so they are
// not re-asked. Safe to re-run (existing records are never overwritten).
//
//   node scripts/migrate-newsletter.mjs
import { config } from 'dotenv'
config({ path: '.env.local' })
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const legacy = await redis.smembers('newsletter:subscribers')
let added = 0
for (const raw of legacy) {
  const email = String(raw).trim().toLowerCase()
  if (await redis.hexists('newsletter:subs', email)) continue
  const now = new Date().toISOString()
  await redis.hset('newsletter:subs', {
    [email]: { email, status: 'active', subscribedAt: now, confirmedAt: now, source: 'legacy' },
  })
  added++
}
console.log(`Legacy: ${legacy.length}, imported: ${added}`)
