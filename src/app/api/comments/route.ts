import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { writeClient } from '@/lib/sanity-write'

const MAX_COMMENT_LENGTH = 1000
const MIN_FORM_FILL_MS = 3000 // reject submissions faster than a human could type

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const {
    articleId,
    name,
    body: commentBody,
    website, // honeypot field — real users never fill this in
    formLoadedAt, // timestamp (ms) from when the form rendered client-side
  } = body ?? {}

  // Honeypot: bots fill every field, humans never see this one (it's hidden via CSS)
  if (website) {
    return NextResponse.json({ ok: true }) // pretend success, drop silently
  }

  // Basic bot-speed check: reject if the form was "submitted" implausibly fast
  if (typeof formLoadedAt === 'number' && Date.now() - formLoadedAt < MIN_FORM_FILL_MS) {
    return NextResponse.json({ error: 'Please try again.' }, { status: 400 })
  }

  if (typeof articleId !== 'string' || !articleId.trim()) {
    return NextResponse.json({ error: 'Missing article reference.' }, { status: 400 })
  }

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }

  if (typeof commentBody !== 'string' || !commentBody.trim()) {
    return NextResponse.json({ error: 'Comment cannot be empty.' }, { status: 400 })
  }

  if (commentBody.length > MAX_COMMENT_LENGTH) {
    return NextResponse.json({ error: `Comment must be under ${MAX_COMMENT_LENGTH} characters.` }, { status: 400 })
  }

  try {
    await writeClient.create({
      // Same trick as tips: explicit drafts.* id means this is created as a
      // draft, invisible on the site until an editor publishes it in Studio.
      // Lets the write token stay scoped to "Contributor" (drafts only).
      _id: `drafts.comment-${randomUUID()}`,
      _type: 'comment',
      article: { _type: 'reference', _ref: articleId },
      name: name.trim().slice(0, 80),
      body: commentBody.trim(),
      submittedAt: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}