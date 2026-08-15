import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

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
    const { slug, votes, reportingPercent } = body

    if (!slug || !votes || typeof reportingPercent !== 'number') {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const redisKey = `election:${slug}`
    const payload: Record<string, number> = {}
    let calculatedTotal = 0

    Object.entries(votes).forEach(([party, count]) => {
      const val = Math.max(0, Number(count) || 0)
      payload[`votes:${party}`] = val
      calculatedTotal += val
    })

    payload.totalVotes = calculatedTotal
    payload.reportingPercent = Math.min(100, Math.max(0, Math.round(reportingPercent)))
    payload.lastUpdated = Math.floor(Date.now() / 1000)

    await redis.hset(redisKey, payload)

    return NextResponse.json({
      success: true,
      totalVotes: calculatedTotal,
      reportingPercent: payload.reportingPercent,
    })
  } catch (err) {
    console.error('Election update error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}