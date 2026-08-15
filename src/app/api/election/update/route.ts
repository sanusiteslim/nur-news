import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { OSUN_LGAS } from '@/lib/election'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization')
    const expected = `Bearer ${process.env.ELECTION_SECRET_TOKEN}`

    if (!process.env.ELECTION_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    if (auth !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { slug, lga, votes, reportingPercent } = body

    if (!slug || !lga || !votes || typeof reportingPercent !== 'number') {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (!OSUN_LGAS.includes(lga)) {
      return NextResponse.json({ error: 'Invalid LGA' }, { status: 400 })
    }

    const redisKey = `election:${slug}:lgas`
    let totalVotes = 0
    const cleanVotes: Record<string, number> = {}

    Object.entries(votes).forEach(([party, count]) => {
      const val = Math.max(0, Number(count) || 0)
      cleanVotes[party] = val
      totalVotes += val
    })

    const payload = {
      votes: cleanVotes,
      totalVotes,
      reportingPercent: Math.min(100, Math.max(0, Math.round(reportingPercent))),
    }

    await redis.hset(redisKey, { [lga]: JSON.stringify(payload) })

    // Also update statewide totals automatically by aggregating all LGAs
    const allLgas = await redis.hgetall(redisKey)
    let statewideTotal = 0
    const statewideVotes: Record<string, number> = {}

    Object.values(allLgas || {}).forEach((lgaData: any) => {
      try {
        const parsed = typeof lgaData === 'string' ? JSON.parse(lgaData) : lgaData
        statewideTotal += parsed.totalVotes || 0
        Object.entries(parsed.votes || {}).forEach(([party, count]) => {
          statewideVotes[party] = (statewideVotes[party] || 0) + (count as number)
        })
      } catch { /* skip corrupt data */ }
    })

    const stateKey = `election:${slug}`
    const statePayload: Record<string, number> = {
      totalVotes: statewideTotal,
      reportingPercent: payload.reportingPercent, // Use latest or calculate average
      lastUpdated: Math.floor(Date.now() / 1000),
    }

    Object.entries(statewideVotes).forEach(([party, count]) => {
      statePayload[`votes:${party}`] = count
    })

    await redis.hset(stateKey, statePayload)

    return NextResponse.json({
      success: true,
      lga: payload,
      statewide: { totalVotes: statewideTotal, votes: statewideVotes },
    })
  } catch (err) {
    console.error('LGA update error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}