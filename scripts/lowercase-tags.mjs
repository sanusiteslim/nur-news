// One-off: lowercase every article tag in Sanity (e.g. "Sports" -> "sports",
// "AI" -> "ai") so they match the updated tag list in the Studio. The site
// already matches tags case-insensitively, so this is tidy-up, not urgent.
//
// Needs a token with write access (Sanity manage -> API -> Tokens -> Editor):
//   SANITY_WRITE_TOKEN=sk... node scripts/lowercase-tags.mjs           (dry run)
//   SANITY_WRITE_TOKEN=sk... node scripts/lowercase-tags.mjs --apply   (writes)
import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from 'next-sanity'

const apply = process.argv.includes('--apply')
const token = process.env.SANITY_WRITE_TOKEN
if (!token) {
  console.error('Set SANITY_WRITE_TOKEN (an Editor token) first.')
  process.exit(1)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'l7g6k8p8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-07-17',
  token,
  useCdn: false,
})

// Includes drafts, so an open draft doesn't reintroduce the old casing.
const docs = await client.fetch(`*[_type == "article" && count(tags[@ != lower(@)]) > 0]{ _id, headline, tags }`)
console.log(`${docs.length} article(s) have tags to lowercase.`)

for (const doc of docs) {
  const tags = Array.from(new Set(doc.tags.map((t) => String(t).toLowerCase())))
  console.log(`- ${doc.headline}: ${doc.tags.join(', ')}  ->  ${tags.join(', ')}`)
  if (apply) await client.patch(doc._id).set({ tags }).commit()
}

console.log(apply ? 'Done.' : 'Dry run only. Re-run with --apply to save.')
