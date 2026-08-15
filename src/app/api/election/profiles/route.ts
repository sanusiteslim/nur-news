import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const profiles = await client.fetch(groq`
      *[_type == "election"] | order(title asc) {
        "slug": slug.current,
        title,
        candidates[] { partyCode, name, color }
      }
    `)

    return NextResponse.json(profiles || [])
  } catch (err) {
    console.error('Election profiles error:', err)
    return NextResponse.json([], { status: 500 })
  }
}