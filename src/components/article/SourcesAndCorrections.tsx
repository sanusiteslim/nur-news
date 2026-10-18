import Link from 'next/link'
import { format } from 'date-fns'

type Source = { _key?: string; title: string; url?: string }
type Correction = { _key?: string; date: string; text: string }

function safeHref(url?: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null
  } catch {
    return null
  }
}

/** Corrections notice — shown near the top so readers see what changed. */
export function CorrectionsNotice({ corrections }: { corrections?: Correction[] }) {
  const items = (corrections || []).filter((c) => c?.text).sort((a, b) => (a.date < b.date ? 1 : -1))
  if (items.length === 0) return null

  return (
    <aside className="mb-8 rounded-lg border border-accent-orange/40 bg-orange-50 p-4" aria-label="Corrections">
      <h2 className="text-xs font-bold uppercase tracking-wider text-accent-orange mb-2">
        {items.length === 1 ? 'Correction' : 'Corrections'}
      </h2>
      <ul className="space-y-2 text-sm text-text-primary">
        {items.map((c, i) => (
          <li key={c._key || i}>
            <time dateTime={c.date} className="font-semibold">
              {format(new Date(c.date), 'MMM d, yyyy, h:mm a')}:
            </time>{' '}
            {c.text}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-text-muted">
        See our{' '}
        <Link href="/corrections" className="underline underline-offset-2 hover:text-brand-700">
          corrections policy
        </Link>
        .
      </p>
    </aside>
  )
}

/** Sources list — shown after the body. */
export function SourcesList({ sources }: { sources?: Source[] }) {
  const items = (sources || []).filter((s) => s?.title)
  if (items.length === 0) return null

  return (
    <section className="mt-10 pt-6 border-t border-gray-200">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">Sources</h2>
      <ol className="list-decimal pl-5 space-y-1.5 text-sm text-text-secondary">
        {items.map((s, i) => {
          const href = safeHref(s.url)
          return (
            <li key={s._key || i}>
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-700 underline underline-offset-2 hover:text-brand-800">
                  {s.title}
                </a>
              ) : (
                s.title
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
