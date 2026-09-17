import { NextRequest, NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity-write'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Editor-facing endpoint for the tips inbox at /admin/tips.
 *
 * Auth is a shared admin token sent in the Authorization header — the same
 * lightweight pattern the election admin already uses. That's proportionate
 * for a small newsroom, but be clear-eyed about what it is: one shared
 * secret, no per-user accounts, no audit trail of who actioned what. If the
 * team grows or tips start carrying sensitive sources, move this behind
 * real authentication.
 *
 * Tips are stored as drafts, so reading them requires a token with draft
 * read access — the same SANITY_TIPS_TOKEN the submission route writes with.
 */

function isAuthorised(request: NextRequest): boolean {
  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken) return false

  const header = request.headers.get('authorization') || ''
  const provided = header.replace(/^Bearer\s+/i, '').trim()
  return provided.length > 0 && provided === adminToken
}

const TIPS_QUERY = `*[_type == "tipSubmission"] | order(submittedAt desc) [0...100] {
  _id, tipText, category, location, submitterName, submitterContact,
  status, editorNotes, submittedAt, source
}`

export async function GET(request: NextRequest) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  if (!process.env.SANITY_TIPS_TOKEN) {
    return NextResponse.json(
      { error: 'SANITY_TIPS_TOKEN is not configured on the server.' },
      { status: 503 }
    )
  }

  try {
    const tips = await writeClient.fetch(TIPS_QUERY)
    return NextResponse.json({ tips })
  } catch (error: any) {
    console.error('[api/tips/list] fetch failed:', error?.statusCode, error?.message || error)
    return NextResponse.json({ error: 'Could not load tips.' }, { status: 500 })
  }
}

/** Update a tip's triage status and/or editor notes. */
export async function PATCH(request: NextRequest) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { id, status, editorNotes } = body ?? {}

  if (typeof id !== 'string' || !id.startsWith('drafts.tip-')) {
    return NextResponse.json({ error: 'Invalid tip id' }, { status: 400 })
  }

  const allowedStatuses = ['new', 'reviewing', 'actioned', 'dismissed']
  const patch: Record<string, unknown> = {}

  if (typeof status === 'string') {
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    patch.status = status
  }

  if (typeof editorNotes === 'string') {
    patch.editorNotes = editorNotes.slice(0, 2000)
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  try {
    await writeClient.patch(id).set(patch).commit()
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('[api/tips/list] patch failed:', error?.statusCode, error?.message || error)
    return NextResponse.json({ error: 'Could not update tip.' }, { status: 500 })
  }
}
