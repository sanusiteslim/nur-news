# NUR Report — fixes & new features

Every file in this archive sits at its real path relative to the repo root.
Copy the tree over your working copy (paths already match) and commit.

All 15 files were applied to a clean clone of `main` and type-check with
zero errors (`npx tsc --noEmit`).

---

## 1. Bug fixes

### `sanity/schemaTypes/index.ts` — the comment feature was dead
The file opened with `import { comment } from 'postcss'` — an editor
auto-import that grabbed the wrong `comment`. Your real 121-line
`comment.ts` schema was never registered, so comments could not exist in
Studio at all. Now imports from `./comment` and is included in
`schemaTypes`.

### `src/lib/redis.ts` — one missing env var could take down the homepage
`Redis.fromEnv()` throws **at module scope**. That meant simply *importing*
this file crashed the process, before any of the careful `try/catch` blocks
inside `analytics.ts` could run. The chain was:

    homepage -> MostRead -> lib/analytics -> lib/redis -> throw

So an unset `UPSTASH_REDIS_REST_URL` took out the homepage, the newsletter
signup and the election routes together.

Now the client is created lazily and never throws on import. `getRedis()`
returns `null` when unconfigured and callers degrade gracefully. A
backwards-compatible `redis` proxy export is kept so your three election
routes need no edits — they fail at call time with a clear message, inside
their own existing `try/catch`, instead of at import.

### `src/lib/analytics.ts` / `src/lib/newsletter.ts`
Updated to the safe getter. View tracking silently no-ops, Most Read hides
itself, newsletter signup returns an honest error rather than pretending a
signup worked. Added `getSubscriberCount()` while I was in there.

### `src/app/tip/page.tsx` — "Network error" was lying to you
The form called `res.json()` **before** checking `res.ok`. Any non-JSON
response (a 503, a platform HTML error page, a 404 from a missing route)
threw a `SyntaxError`, which the outer `catch` reported as a network
problem — sending you to check your wifi instead of the server. It now
parses defensively and surfaces the real status code. The category list is
sourced from `lib/taxonomy` so it can't drift.

### `src/app/api/tips/route.ts` — clear diagnostics
Added an explicit guard: if `SANITY_TIPS_TOKEN` is unset, it returns a clean
503 and logs exactly what to do. Sanity 401 vs 403 are now distinguished in
the logs (401 = bad/absent token, 403 = token lacks draft-write permission).
Pinned to `runtime = 'nodejs'` and `dynamic = 'force-dynamic'`.

**This is the most likely cause of the failure you're seeing.** Check that
env var first.

### `src/app/sitemap.tsx`
Was duplicating the category list instead of using `lib/taxonomy`, and was
missing `/tip`, `/live` and everything added since. Now sources categories
from taxonomy, includes tag and author URLs, and guards each fetch
independently so a tag hiccup can't blank out your article URLs. `/search`
is deliberately excluded (its own metadata sets `robots: noindex`).

---

## 2. New features

### Author profiles — `/author` and `/author/[slug]`
Your author schema already carried `slug`, `role`, `state`, `bio`,
`twitter` and `email`, and none of it was surfaced anywhere. Each profile
page emits `Person` JSON-LD linking bylines to real, described humans —
one of the signals Google News weighs for accountable authorship. Bylines
on article pages (and the opinion author bio) now link here. Pages are
statically generated via `generateStaticParams`.

The `/author` index lists only authors with at least one published story.

### Tag archives — `/tag` and `/tag/[tag]`
You had `formatTag()` and tags on every article, but they rendered as plain
text linking nowhere. Now they're browsable topic hubs with related-tag
cross-links at the bottom. Tags render on demand rather than being
pre-built, so a new tag goes live without a redeploy. A tag nobody has used
returns a real 404 rather than an empty soft-404 page.

Two GROQ details worth knowing, both documented in `lib/sanity.ts`:

- The filter uses `$topic in tags` (exact membership), **not**
  `tags match $topic`. `match` does tokenized text matching, so `/tag/war`
  would have wrongly pulled in `us-israel-iran-war`.
- The param is named `$topic`, not `$tag`. next-sanity's typed `groq`
  parser can't tell the param `$tag` apart from the field `tags` — that
  prefix collision breaks its tokenizer and makes
  `client.fetch(q, { tag })` a type error. Took a while to pin down; the
  comment is there so it doesn't bite again.

### Tips inbox — `/admin/tips` and `/api/tips/list`
The dashboard for actually reading submissions: status filtering
(new / reviewing / actioned / dismissed), inline triage buttons, and editor
notes that save on blur. Updates are optimistic with rollback.

Auth is a shared `ADMIN_TOKEN` in an `Authorization: Bearer` header,
matching your existing election admin pattern. Be clear-eyed about what
that is: one shared secret, no per-user accounts, no record of who actioned
what. Proportionate for a small newsroom — but if the team grows, or tips
start carrying sensitive sources, move it behind real authentication.

---

## 3. Environment variables

    SANITY_TIPS_TOKEN=...      # Sanity token, Contributor role (drafts only)
    ADMIN_TOKEN=...            # any long random string; gates /admin/tips

Both are server-only — no `NEXT_PUBLIC_` prefix, ever.

Redis vars stay optional now. Without them the site runs fine; view
tracking, Most Read, newsletter signup and live election results simply
switch off and log a warning.

---

## 4. Not fixed — worth your attention

- `next` is on **14.2.15**, which npm flags for known vulnerabilities.
  Worth bumping and retesting.
- `src/components/ArticleBody.tsx` and `src/components/ads/AdUnit.tsx` are
  orphaned — zero references anywhere in the codebase.
- `src/components/pwa/UpdateToast.tsx` exists but is never mounted in
  `layout.tsx`, so users never see update prompts.
- `categoryQuery` in `lib/sanity.ts` still builds GROQ by string
  interpolation rather than a `$category` param. Low real-world risk given
  Sanity's narrow query surface, but it isn't injection-safe by
  construction.
- `sanity/node_modules` and `sanity/dist` are still committed to git.

---

## 5. Verifying locally

    npx tsc --noEmit     # should print nothing

I could not run a full `next build` here — the sandbox can't reach
`fonts.googleapis.com`, which the `Inter` font loader needs. Vercel's build
environment can, so that particular failure won't reproduce on your
deploys. Everything else was verified directly against the code.
