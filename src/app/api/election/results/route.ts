import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import { redis } from '@/lib/redis'
import { electionProfileQuery } from '@/lib/election'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    // 1. Fetch static candidate profiles from Sanity
    const profile = await client.fetch(electionProfileQuery, { slug })

    if (!profile) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 })
    }

    // 2. Fetch live counters from Redis
    const redisKey = `election:${slug}`
    const raw = await redis.hgetall(redisKey)

    const totalVotes = parseInt((raw?.totalVotes as string) || '0', 10)
    const reportingPercent = parseInt((raw?.reportingPercent as string) || '0', 10)
    const lastUpdated = parseInt((raw?.lastUpdated as string) || '0', 10)

    // 3. Merge: attach votes to each candidate, compute percentages
    const candidates = (profile.candidates || []).map((c: any) => {
      const votes = parseInt((raw?.[`votes:${c.partyCode}`] as string) || '0', 10)
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
      return {
        partyCode: c.partyCode,
        name: c.name,
        color: c.color,
        imageUrl: c.imageUrl,
        votes,
        percentage: Number(percentage.toFixed(1)),
      }
    })

    // Sort by votes descending
    candidates.sort((a: any, b: any) => b.votes - a.votes)

    return NextResponse.json({
      title: profile.title,
      subtitle: profile.subtitle,
      totalVotes,
      reportingPercent,
      lastUpdated,
      candidates,
      updates: profile.updates || [],
    })
  } catch (err) {
    console.error('Election results error:', err)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}