import 'server-only'
import { client } from './sanity'
import { getRedis, hgetallCached } from './redis'
import { electionProfileQuery, OSUN_LGAS } from './election'

/**
 * Builds the public results payload for one election: Sanity profile
 * (candidates, colours, updates) merged with live tallies from Redis.
 * Shared by /api/election/results and the server-rendered live page.
 * Returns null when the election doesn't exist.
 */
export async function getElectionResults(slug: string, includeLgas: boolean, opts: { cachedSeconds?: number } = {}) {
  const profile = await client.fetch(electionProfileQuery, { slug })
  if (!profile) return null

  const redisKey = `election:${slug}`
  // No Redis (or a Redis hiccup) shows the candidates with zero counts
  // instead of hiding the whole results module.
  // `cachedSeconds` is for server-rendered (ISR) pages, which can't use the
  // SDK's no-store requests; API routes read live.
  const redis = getRedis()
  const read = (key: string): Promise<Record<string, unknown> | null> =>
    opts.cachedSeconds
      ? hgetallCached(key, opts.cachedSeconds)
      : redis
        ? redis.hgetall<Record<string, unknown>>(key).catch(() => null)
        : Promise.resolve(null)
  const raw = await read(redisKey)

  const totalVotes = parseInt((raw?.totalVotes as string) || '0', 10)
  const reportingPercent = parseInt((raw?.reportingPercent as string) || '0', 10)
  const lastUpdated = parseInt((raw?.lastUpdated as string) || '0', 10)

  const candidates = (profile.candidates || []).map((c: any) => {
    const votes = parseInt((raw?.[`votes:${c.partyCode}`] as string) || '0', 10)
    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
    return {
      partyCode: c.partyCode,
      partyName: c.partyName || c.partyCode,
      partyFlagUrl: c.partyFlagUrl,
      name: c.name,
      color: c.color,
      imageUrl: c.imageUrl,
      votes,
      percentage: Number(percentage.toFixed(1)),
    }
  })

  candidates.sort((a: any, b: any) => b.votes - a.votes)

  let lgas: Record<string, any> | undefined = undefined

  if (includeLgas) {
    const lgaRaw = await read(`${redisKey}:lgas`)
    lgas = {}

    for (const lgaName of OSUN_LGAS) {
      const lgaData = lgaRaw?.[lgaName]

      // Skip missing or corrupted entries
      if (!lgaData || lgaName === 'undefined' || lgaName === '') {
        lgas[lgaName] = { votes: {}, totalVotes: 0, reportingPercent: 0, candidates: [] }
        continue
      }

      let parsed: any
      try {
        // Handle both string (from JSON.stringify) and object (from direct hset)
        parsed = typeof lgaData === 'string' ? JSON.parse(lgaData) : lgaData
      } catch {
        lgas[lgaName] = { votes: {}, totalVotes: 0, reportingPercent: 0, candidates: [] }
        continue
      }

      // Enrich with candidate metadata and percentages
      const enrichedCandidates = (profile.candidates || []).map((c: any) => {
        const votes = parsed.votes?.[c.partyCode] || 0
        const pct = parsed.totalVotes > 0 ? (votes / parsed.totalVotes) * 100 : 0
        return {
          partyCode: c.partyCode,
          partyName: c.partyName || c.partyCode,
          partyFlagUrl: c.partyFlagUrl,
          name: c.name,
          color: c.color,
          votes,
          percentage: Number(pct.toFixed(1)),
        }
      }).sort((a: any, b: any) => b.votes - a.votes)

      lgas[lgaName] = {
        votes: parsed.votes || {},
        totalVotes: parsed.totalVotes || 0,
        reportingPercent: parsed.reportingPercent || 0,
        candidates: enrichedCandidates,
      }
    }
  }

  return {
    title: profile.title as string,
    subtitle: profile.subtitle as string | undefined,
    totalVotes,
    reportingPercent,
    lastUpdated,
    candidates,
    updates: profile.updates || [],
    lgas,
  }
}

