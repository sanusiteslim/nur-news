'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PortableText } from '@portabletext/react'
import { formatDistanceToNow, format } from 'date-fns'

type LivePost = {
  _key: string
  publishedAt: string
  title?: string
  body: any[]
  isKey?: boolean
  isBreaking?: boolean
  isPinned?: boolean
  author?: { name?: string; photoUrl?: string; slug?: string }
}

const POLL_MS = 20_000

const components = {
  block: {
    normal: ({ children }: any) => <p className="mb-3 last:mb-0 leading-relaxed text-text-primary">{children}</p>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-brand-700 pl-4 italic text-text-secondary my-3">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
  },
  marks: {
    link: ({ value, children }: any) => {
      const href = typeof value?.href === 'string' && /^(https?:|mailto:|\/)/.test(value.href) ? value.href : null
      return href ? (
        <a href={href} className="text-brand-700 underline underline-offset-2 hover:text-brand-800" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ) : (
        <>{children}</>
      )
    },
  },
  types: {
    liveImage: ({ value }: any) =>
      value?.url ? (
        <figure className="my-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.url} alt={value.alt || ''} loading="lazy" className="w-full max-h-[480px] object-cover rounded-lg" />
          {value.caption && <figcaption className="text-xs text-text-muted mt-1.5">{value.caption}</figcaption>}
        </figure>
      ) : null,
  },
}

function mergePosts(current: LivePost[], incoming: LivePost[]): LivePost[] {
  const map = new Map(current.map((p) => [p._key, p]))
  for (const p of incoming) map.set(p._key, p) // edits replace the old copy
  return Array.from(map.values()).sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
}

/** Relative time that refreshes itself, rendered only after mount (no hydration mismatch). */
function TimeAgo({ iso }: { iso: string }) {
  const [, tick] = useState(0)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    const id = setInterval(() => tick((n) => n + 1), 60_000)
    return () => clearInterval(id)
  }, [])
  const date = new Date(iso)
  return (
    <time dateTime={iso} title={format(date, 'd MMM yyyy, h:mm a')}>
      {mounted ? formatDistanceToNow(date, { addSuffix: true }) : format(date, 'h:mm a')}
    </time>
  )
}

function PostCard({ post, eventSlug, pinned }: { post: LivePost; eventSlug: string; pinned?: boolean }) {
  const [copied, setCopied] = useState(false)
  const anchor = `post-${post._key}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/live/${eventSlug}#${anchor}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <article
      id={anchor}
      className={`relative scroll-mt-24 rounded-lg border p-4 sm:p-5 ${
        pinned ? 'border-brand-700 bg-brand-50' : post.isBreaking ? 'border-accent-red/40 bg-red-50/40' : 'border-gray-200 bg-white'
      }`}
    >
      <header className="flex flex-wrap items-center gap-2 mb-2 text-xs">
        <span className="font-bold text-brand-800">
          <TimeAgo iso={post.publishedAt} />
        </span>
        {pinned && <span className="rounded bg-brand-700 px-1.5 py-0.5 font-bold uppercase tracking-wide text-white">Pinned</span>}
        {post.isBreaking && (
          <span className="rounded bg-accent-red px-1.5 py-0.5 font-bold uppercase tracking-wide text-white">Breaking</span>
        )}
        {post.isKey && !post.isBreaking && (
          <span className="rounded bg-accent-orange/15 px-1.5 py-0.5 font-bold uppercase tracking-wide text-accent-orange">
            Key event
          </span>
        )}
      </header>

      {post.title && <h3 className="text-lg font-bold text-text-primary mb-2 leading-snug">{post.title}</h3>}
      <div className="text-[17px]">
        <PortableText value={post.body} components={components} />
      </div>

      <footer className="mt-3 flex items-center justify-between gap-3 text-xs text-text-muted">
        {post.author?.name ? (
          <span className="flex items-center gap-2">
            {post.author.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.photoUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
            )}
            {post.author.name}
          </span>
        ) : (
          <span />
        )}
        <button onClick={copyLink} className="font-medium hover:text-brand-700">
          {copied ? 'Link copied' : 'Copy link'}
        </button>
      </footer>
    </article>
  )
}

/**
 * The live blog itself. Starts from server-rendered posts (so Google and
 * slow connections see everything immediately), then polls the cached
 * /api/live/[slug] endpoint while the event is live and the tab is visible.
 * New posts wait behind a "new updates" button so the page never jumps
 * under a reader mid-paragraph.
 */
export default function LiveFeed({
  slug,
  initialPosts,
  initialStatus,
  initialKeyPoints,
}: {
  slug: string
  initialPosts: LivePost[]
  initialStatus: string
  initialKeyPoints: string[]
}) {
  const [posts, setPosts] = useState<LivePost[]>(initialPosts)
  const [pending, setPending] = useState<LivePost[]>([])
  const [status, setStatus] = useState(initialStatus)
  const [keyPoints, setKeyPoints] = useState<string[]>(initialKeyPoints)
  const [keyOnly, setKeyOnly] = useState(false)
  const [visibleCount, setVisibleCount] = useState(30)
  const known = useRef(new Set(initialPosts.map((p) => p._key)))

  const poll = useCallback(async () => {
    if (document.visibilityState !== 'visible') return
    try {
      const res = await fetch(`/api/live/${slug}`)
      if (!res.ok) return
      const data = await res.json()
      setStatus(data.status)
      setKeyPoints(data.keyPoints || [])
      const incoming: LivePost[] = data.posts || []
      const fresh = incoming.filter((p) => !known.current.has(p._key))
      const edited = incoming.filter((p) => known.current.has(p._key))
      if (edited.length) setPosts((cur) => mergePosts(cur, edited))
      if (fresh.length) {
        fresh.forEach((p) => known.current.add(p._key))
        setPending((cur) => mergePosts(cur, fresh))
      }
    } catch {
      /* network blip — try again next tick */
    }
  }, [slug])

  useEffect(() => {
    if (status !== 'live') return
    const id = setInterval(poll, POLL_MS)
    const onVisible = () => document.visibilityState === 'visible' && poll()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [poll, status])

  const showPending = () => {
    setPosts((cur) => mergePosts(cur, pending))
    setPending([])
    document.getElementById('live-feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const pinned = useMemo(() => posts.find((p) => p.isPinned), [posts])
  const list = useMemo(
    () => posts.filter((p) => p._key !== pinned?._key && (!keyOnly || p.isKey || p.isBreaking)),
    [posts, pinned, keyOnly]
  )
  const keyEvents = useMemo(() => posts.filter((p) => p.isKey || p.isBreaking).slice(0, 12), [posts])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        {keyPoints.length > 0 && (
          <aside className="mb-6 rounded-lg bg-surface-offwhite border-l-4 border-brand-700 p-5" aria-label="Key points">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-800 mb-3">Where things stand</h2>
            <ul className="space-y-2">
              {keyPoints.map((p, i) => (
                <li key={i} className="flex gap-3 text-text-primary leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-700" aria-hidden="true" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div id="live-feed" className="scroll-mt-20 flex items-center justify-between gap-3 mb-4">
          <h2 className="section-title">{status === 'live' ? 'Live updates' : 'Updates'}</h2>
          <label className="inline-flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input type="checkbox" checked={keyOnly} onChange={(e) => setKeyOnly(e.target.checked)} className="h-4 w-4 accent-brand-700" />
            Key events only
          </label>
        </div>

        <div aria-live="polite" className="sr-only">
          {pending.length > 0 ? `${pending.length} new update${pending.length === 1 ? '' : 's'}` : ''}
        </div>

        {pending.length > 0 && (
          <div className="sticky top-16 z-30 flex justify-center mb-4">
            <button
              onClick={showPending}
              className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-brand-800 transition-colors"
            >
              ↑ {pending.length} new update{pending.length === 1 ? '' : 's'}
            </button>
          </div>
        )}

        <div className="space-y-4">
          {pinned && !keyOnly && <PostCard post={pinned} eventSlug={slug} pinned />}
          {list.slice(0, visibleCount).map((p) => (
            <PostCard key={p._key} post={p} eventSlug={slug} />
          ))}
          {list.length === 0 && !pinned && <p className="text-text-secondary">No updates yet — stay with us.</p>}
        </div>

        {list.length > visibleCount && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setVisibleCount((n) => n + 30)}
              className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-text-primary hover:bg-surface-offwhite"
            >
              Show older updates
            </button>
          </div>
        )}
      </div>

      <aside className="lg:col-span-4">
        {keyEvents.length > 0 && (
          <section className="lg:sticky lg:top-20">
            <h2 className="section-title mb-4">Key events</h2>
            <ol className="relative border-l-2 border-brand-100 ml-1.5 space-y-4">
              {keyEvents.map((p) => (
                <li key={p._key} className="pl-4 relative">
                  <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-brand-700" aria-hidden="true" />
                  <a href={`#post-${p._key}`} className="block group">
                    <span className="block text-xs font-semibold text-text-muted">{format(new Date(p.publishedAt), 'h:mm a')}</span>
                    <span className="block text-sm text-text-primary group-hover:text-brand-700 line-clamp-2">
                      {p.title ||
                        (p.body || [])
                          .filter((b: any) => b._type === 'block')
                          .map((b: any) => (b.children || []).map((c: any) => c.text).join(''))
                          .join(' ')
                          .slice(0, 110)}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}
      </aside>
    </div>
  )
}
