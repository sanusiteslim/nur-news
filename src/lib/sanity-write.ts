import 'server-only'
import { createClient } from 'next-sanity'

// SERVER-ONLY. Never import this file from a 'use client' component —
// the `server-only` import above will throw a build error if you try.
//
// Unlike the read client in lib/sanity.ts, this one:
//  - uses a secret write token (SANITY_API_TOKEN), never NEXT_PUBLIC_*
//  - has useCdn: false, since writes must hit the live API, not the CDN cache
//
// Create the token in manage.sanity.io → API → Tokens, with "Contributor"
// permissions (read+write drafts only — not Editor/Developer, which grant
// write access to everything). This token lives in a public API route
// (/api/tips), so it should only be able to touch draft documents, not your
// published articles. The tips route creates documents with an explicit
// drafts.* _id specifically so this narrower token works.
// Set it as SANITY_API_TOKEN in .env.local and in Vercel's environment variables.
// (This var already existed in .env.example but nothing in the codebase
// actually used it until now.)
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-07-17',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})