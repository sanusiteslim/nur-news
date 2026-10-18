import { NextResponse } from 'next/server'
import { groq } from 'next-sanity'
import { client } from '@/lib/sanity'
import { serializeLivePosts } from '@/lib/live'

export const dynamic = 'force-dynamic'

// Same URL for every reader (no per-client params), so Vercel's CDN can serve
// one cached copy to everyone: at most one Sanity read per 10 seconds per
// event, however many people are watching.
const latestQuery = groq`
  *[_type == "liveEvent" && slug.current == $slug][0] {
    status, keyPoints, _updatedAt,
    "posts": posts | order(publishedAt desc) [0...30] {
      _key, publishedAt, title, body, isKey, isBreaking, isPinned,
      "author": author->{name, photo, slug}
    }
  }
`

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  if (!/^[a-z0-9-]{1,96}$/.test(params.slug)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  try {
    const data = await client.fetch(latestQuery, { slug: params.slug })
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(
      {
        status: data.status,
        keyPoints: data.keyPoints || [],
        updatedAt: data._updatedAt,
        posts: serializeLivePosts(data.posts),
      },
      { headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' } }
    )
  } catch (err) {
    console.error('live feed failed:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
