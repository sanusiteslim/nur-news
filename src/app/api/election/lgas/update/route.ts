import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { OSUN_LGAS } from '@/lib/election'
import { checkBearer } from '@/lib/adminAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SLUG_RE = /^[a-z0-9-]{1,80}$/
const PARTY_RE = /^[A-Za-z0-9-]{1,12}$/

export async function POST(req: NextRequest) {
  const denied = checkBearer(req, 'ELECTION_SECRET_TOKEN')
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status })

  try {
    const body = await req.json().catch(() => null)
    const { slug, lga, votes, reportingPercent } = body ?? {}

    if (typeof slug !== 'string' || !SLUG_RE.test(slug) || typeof lga !== 'string' || !votes || typeof votes !== 'object') {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (typeof reportingPercent !== 'number' || !Number.isFinite(reportingPercent)) {
      return NextResponse.json({ error: 'reportingPercent must be a number' }, { status: 400 })
    }
    if (!OSUN_LGAS.includes(lga)) {
      return NextResponse.json({ error: 'Invalid LGA' }, { status: 400 })
    }

    // Sanitise: whole, non-negative numbers keyed by a plausible party code.
    let totalVotes = 0
    const cleanVotes: Record<string, number> = {}
    for (const [party, count] of Object.entries(votes as Record<string, unknown>)) {
      if (!PARTY_RE.test(party)) continue
      const val = Math.max(0, Math.floor(Number(count) || 0))
      cleanVotes[party] = val
      totalVotes += val
    }

    const payload = {
      votes: cleanVotes,
      totalVotes,
      reportingPercent: Math.min(100, Math.max(0, Math.round(reportingPercent))),
    }

    const lgaKey = `election:${slug}:lgas`
    await redis.hset(lgaKey, { [lga]: JSON.stringify(payload) })

    // Recompute statewide totals from every LGA on record.
    const allLgas = (await redis.hgetall<Record<string, unknown>>(lgaKey)) || {}
    let statewideTotal = 0
    let reportingSum = 0
    const statewideVotes: Record<string, number> = {}

    for (const raw of Object.values(allLgas)) {
      try {
        const parsed: any = typeof raw === 'string' ? JSON.parse(raw) : raw
        statewideTotal += Number(parsed.totalVotes) || 0
        reportingSum += Number(parsed.reportingPercent) || 0
        for (const [party, count] of Object.entries(parsed.votes || {})) {
          statewideVotes[party] = (statewideVotes[party] || 0) + (Number(count) || 0)
        }
      } catch {
        /* skip corrupt entry */
      }
    }

    // Statewide reporting = average across ALL LGAs (unreported count as 0),
    // not just whichever LGA was updated last.
    const statewideReporting = Math.round(reportingSum / OSUN_LGAS.length)

    const statePayload: Record<string, number> = {
      totalVotes: statewideTotal,
      reportingPercent: statewideReporting,
      lastUpdated: Math.floor(Date.now() / 1000),
    }
    for (const [party, count] of Object.entries(statewideVotes)) {
      statePayload[`votes:${party}`] = count
    }

    // Replace (not merge) so parties removed from every LGA disappear.
    const stateKey = `election:${slug}`
    await redis.del(stateKey)
    await redis.hset(stateKey, statePayload)

    return NextResponse.json({
      success: true,
      lga: payload,
      statewide: { totalVotes: statewideTotal, reportingPercent: statewideReporting, votes: statewideVotes },
    })
  } catch (err) {
    console.error('LGA update error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
