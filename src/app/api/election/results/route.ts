import { NextResponse } from 'next/server'
import { getElectionResults } from '@/lib/electionResults'

export const dynamic = 'force-dynamic'

const SLUG_RE = /^[a-z0-9-]{1,80}$/

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const includeLgas = searchParams.get('lgas') === 'true'

    if (!slug || !SLUG_RE.test(slug)) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    const results = await getElectionResults(slug, includeLgas)
    if (!results) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 })
    }

    return NextResponse.json(results, {
      // Let Vercel's CDN absorb polling traffic: every reader polling every
      // 15s costs one function call per 10s instead of one per reader.
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' },
    })
  } catch (err) {
    console.error('Election results error:', err)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}
