import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import { redis } from '@/lib/redis'
import { electionProfileQuery, OSUN_LGAS } from '@/lib/election'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const includeLgas = searchParams.get('lgas') === 'true'

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    const profile = await client.fetch(electionProfileQuery, { slug })
    if (!profile) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 })
    }

    const redisKey = `election:${slug}`
    const raw = await redis.hgetall(redisKey)

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

    let lgas: Record<string, any> | undefined

    if (includeLgas) {
      const lgaRaw = await redis.hgetall(`${redisKey}:lgas`)
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

    return NextResponse.json({
      title: profile.title,
      subtitle: profile.subtitle,
      totalVotes,
      reportingPercent,
      lastUpdated,
      candidates,
      updates: profile.updates || [],
      lgas,
    })
  } catch (err) {
    console.error('Election results error:', err)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}