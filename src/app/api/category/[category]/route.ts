import { NextRequest, NextResponse } from 'next/server'
import { client, categoryPageQuery } from '@/lib/sanity'
import { validCategories } from '@/lib/taxonomy'

export const dynamic = 'force-dynamic'

const MAX_LIMIT = 30
const DEFAULT_LIMIT = 10

// GET /api/category/opinion?offset=19&limit=10
// Powers the "Show more" button on category pages. Fetches one extra item
// beyond `limit` so the caller knows whether another page exists without a
// separate count query.
export async function GET(req: NextRequest, { params }: { params: { category: string } }) {
  const category = params.category

  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: 'Unknown category' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10) || 0)
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT))

  try {
    const raw = await client.fetch(categoryPageQuery, {
      category,
      start: offset,
      end: offset + limit + 1,
    })

    const hasMore = raw.length > limit
    return NextResponse.json({ articles: raw.slice(0, limit), hasMore })
  } catch (err) {
    console.error(`GET /api/category/${category} failed:`, err)
    return NextResponse.json({ error: 'Failed to load articles' }, { status: 500 })
  }
}
