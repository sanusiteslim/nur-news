import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { articleId, name, email, body: commentBody, website, parentId, formLoadedAt } = body

    // Honeypot check
    if (website && website.trim() !== '') {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 })
    }

    // Bot-speed check (< 3 seconds)
    if (formLoadedAt && Date.now() - formLoadedAt < 3000) {
      return NextResponse.json({ error: 'Too fast' }, { status: 400 })
    }

    if (!articleId || !name?.trim() || !commentBody?.trim()) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Verify article exists
    const article = await client.fetch(
      groq`*[_type == "article" && _id == $articleId][0]._id`,
      { articleId }
    )
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // If parentId provided, verify parent comment exists
    if (parentId) {
      const parent = await client.fetch(
        groq`*[_type == "comment" && _id == $parentId][0]._id`,
        { parentId }
      )
      if (!parent) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
      }
    }

    const ip = req.headers.get('x-forwarded-for') || 'unknown'

    const doc = {
      _type: 'comment',
      articleId,
      name: name.trim(),
      email: email?.trim() || '',
      body: commentBody.trim(),
      parentId: parentId || '',
      likes: 0,
      approved: false,
      submittedAt: new Date().toISOString(),
      website: '',
      ipAddress: ip,
    }

    const result = await client.create(doc)

    return NextResponse.json({ success: true, _id: result._id }, { status: 201 })
  } catch (err) {
    console.error('Comment POST error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}