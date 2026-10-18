import 'server-only'
import { getRedis, redisReadCached } from './redis'

const VIEWS_ZSET_KEY = 'article:views'
const TOTAL_VIEWS_KEY = 'site:total-views'

/**
 * Records one view for an article. Uses a Redis sorted set keyed by article
 * slug (score = view count), which doubles as the "Most Read" leaderboard —
 * no separate aggregation step needed to answer "what are the top N most
 * viewed articles right now".
 *
 * Analytics should never break the reading experience, so failures here are
 * swallowed rather than thrown — a Redis hiccup shouldn't 500 an article page.
 * If Redis isn't configured at all, this is a silent no-op.
 */
export async function trackArticleView(slug: string): Promise<void> {
  if (!slug) return
  const redis = getRedis()
  if (!redis) return

  try {
    await Promise.all([
      redis.zincrby(VIEWS_ZSET_KEY, 1, slug),
      redis.incr(TOTAL_VIEWS_KEY),
    ])
  } catch (err) {
    console.error('trackArticleView failed:', err)
  }
}

export interface MostViewedEntry {
  slug: string
  views: number
}

/**
 * Top N most-viewed article slugs, most-viewed first. Read through the
 * cached REST path (10 minutes) so ISR pages showing Most Read stay cached.
 */
export async function getMostViewedSlugs(limit = 5): Promise<MostViewedEntry[]> {
  const raw = await redisReadCached(['zrange', VIEWS_ZSET_KEY, 0, limit - 1, 'REV', 'WITHSCORES'], 600)
  if (!Array.isArray(raw)) return []
  const entries: MostViewedEntry[] = []
  for (let i = 0; i < raw.length; i += 2) {
    entries.push({ slug: String(raw[i]), views: Number(raw[i + 1]) })
  }
  return entries
}

/** Total article views recorded site-wide since tracking began. Used for the
 *  honest, real-data stat on the Advertise page — deliberately NOT presented
 *  as "unique monthly visitors" since that's not what this measures. */
export async function getTotalViews(): Promise<number> {
  const redis = getRedis()
  if (!redis) return 0

  try {
    const total = await redis.get<number>(TOTAL_VIEWS_KEY)
    return total ?? 0
  } catch (err) {
    console.error('getTotalViews failed:', err)
    return 0
  }
}
