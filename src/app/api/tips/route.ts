import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { writeClient } from '@/lib/sanity-write'

const MAX_TIP_LENGTH = 2000
const MIN_FORM_FILL_MS = 3000 // reject submissions faster than a human could type

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const {
    tipText,
    category,
    location,
    submitterName,
    submitterContact,
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

  if (typeof tipText !== 'string' || !tipText.trim()) {
    return NextResponse.json({ error: 'Tip text is required.' }, { status: 400 })
  }

  if (tipText.length > MAX_TIP_LENGTH) {
    return NextResponse.json({ error: `Tip must be under ${MAX_TIP_LENGTH} characters.` }, { status: 400 })
  }

  try {
    await writeClient.create({
      // Explicit drafts.* id → this is created as a Sanity draft, never live/published.
      // Lets the write token be scoped to "Contributor" (drafts only) instead of
      // "Editor" (full read+write), since this token lives in a public API route.
      _id: `drafts.tip-${randomUUID()}`,
      _type: 'tipSubmission',
      tipText: tipText.trim(),
      category: typeof category === 'string' ? category : 'unsure',
      location: typeof location === 'string' ? location.trim().slice(0, 200) : undefined,
      submitterName: typeof submitterName === 'string' ? submitterName.trim().slice(0, 200) : undefined,
      submitterContact: typeof submitterContact === 'string' ? submitterContact.trim().slice(0, 200) : undefined,
      status: 'new',
      submittedAt: new Date().toISOString(),
      source: 'web',
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error creating tip submission:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}