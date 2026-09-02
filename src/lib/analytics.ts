import 'server-only'
import { redis } from './redis'

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
 */
export async function trackArticleView(slug: string): Promise<void> {
  if (!slug) return
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

/** Top N most-viewed article slugs, most-viewed first. */
export async function getMostViewedSlugs(limit = 5): Promise<MostViewedEntry[]> {
  try {
    const raw = await redis.zrange<(string | number)[]>(VIEWS_ZSET_KEY, 0, limit - 1, {
      rev: true,
      withScores: true,
    })

    const entries: MostViewedEntry[] = []
    for (let i = 0; i < raw.length; i += 2) {
      entries.push({ slug: String(raw[i]), views: Number(raw[i + 1]) })
    }
    return entries
  } catch (err) {
    console.error('getMostViewedSlugs failed:', err)
    return []
  }
}

/** Total article views recorded site-wide since tracking began. Used for the
 *  honest, real-data stat on the Advertise page — deliberately NOT presented
 *  as "unique monthly visitors" since that's not what this measures. */
export async function getTotalViews(): Promise<number> {
  try {
    const total = await redis.get<number>(TOTAL_VIEWS_KEY)
    return total ?? 0
  } catch (err) {
    console.error('getTotalViews failed:', err)
    return 0
  }
}
