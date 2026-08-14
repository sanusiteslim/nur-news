import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity'

export async function PATCH(req: NextRequest) {
  try {
    const { commentId } = await req.json()

    if (!commentId) {
      return NextResponse.json({ error: 'Missing commentId' }, { status: 400 })
    }

    await client
      .patch(commentId)
      .setIfMissing({ likes: 0 })
      .inc({ likes: 1 })
      .commit()

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Like PATCH error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}