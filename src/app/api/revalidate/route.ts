import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  const body = await request.json()
  const { _type, slug } = body

  if (_type === 'article') {
    revalidateTag('articles')
    if (slug) revalidateTag(`article-${slug}`)
  }

  if (_type === 'homepage') {
    revalidateTag('homepage')
  }

  if (_type === 'author') {
    revalidateTag('authors')
  }

  return NextResponse.json({ revalidated: true, now: Date.now() })
}