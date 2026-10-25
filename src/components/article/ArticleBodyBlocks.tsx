import Link from 'next/link'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { urlForImage } from '@/lib/image'
import { getEmbedUrl } from '@/lib/video'
import { formatPublishedDate } from '@/lib/formatDate'

// Renderers for the extra article-body blocks defined in
// sanity/schemaTypes/richContent.ts. Add a renderer here whenever a block
// type is added there, or the block is silently skipped on the site.

// ---- Table -----------------------------------------------------------------

/** Minimal CSV parser: commas, quoted cells ("a, b"), and "" escapes. */
function parseCsv(csv: string): string[][] {
  const rows: string[][] = []
  for (const line of csv.replace(/\r/g, '').split('\n')) {
    if (!line.trim()) continue
    const cells: string[] = []
    let cell = ''
    let quoted = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') {
          cell += '"'
          i++
        } else if (ch === '"') {
          quoted = false
        } else {
          cell += ch
        }
      } else if (ch === '"') {
        quoted = true
      } else if (ch === ',') {
        cells.push(cell.trim())
        cell = ''
      } else {
        cell += ch
      }
    }
    cells.push(cell.trim())
    rows.push(cells)
  }
  return rows
}

export function DataTable({ value }: { value: any }) {
  const rows: string[][] = value?.rows?.length
    ? value.rows.map((r: any) => (r?.cells || []).map((c: any) => String(c ?? '')))
    : value?.csv
      ? parseCsv(value.csv)
      : []
  if (rows.length === 0) return null

  const width = Math.max(...rows.map((r) => r.length))
  const pad = (r: string[]) => [...r, ...Array(width - r.length).fill('')]
  const header = value.hasHeaderRow !== false ? pad(rows[0]) : null
  const body = (header ? rows.slice(1) : rows).map(pad)

  return (
    <figure className="my-8">
      {value.caption && <figcaption className="text-base font-bold text-text-primary mb-3">{value.caption}</figcaption>}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left border-collapse">
          {header && (
            <thead className="bg-brand-800 text-white">
              <tr>
                {header.map((cell, i) => (
                  <th key={i} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {body.map((row, r) => (
              <tr key={r} className="border-t border-gray-200 even:bg-surface-offwhite">
                {row.map((cell, c) =>
                  c === 0 && value.hasHeaderColumn ? (
                    <th key={c} scope="row" className="px-4 py-3 font-semibold text-text-primary">
                      {cell}
                    </th>
                  ) : (
                    <td key={c} className="px-4 py-3 text-text-primary">
                      {cell}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {value.source && <p className="text-xs text-text-muted mt-2">{value.source}</p>}
    </figure>
  )
}

// ---- Callout ---------------------------------------------------------------

const CALLOUT_TONES: Record<string, { box: string; title: string }> = {
  info: { box: 'border-brand-700 bg-brand-50', title: 'text-brand-800' },
  context: { box: 'border-text-muted bg-surface-offwhite', title: 'text-text-primary' },
  warning: { box: 'border-accent-orange bg-orange-50', title: 'text-accent-orange' },
  alert: { box: 'border-accent-red bg-red-50', title: 'text-accent-red' },
}

export function Callout({ value }: { value: any }) {
  const tone = CALLOUT_TONES[value?.tone] || CALLOUT_TONES.info
  return (
    <aside className={`my-8 rounded-r-lg border-l-4 p-5 ${tone.box}`}>
      {value.title && <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${tone.title}`}>{value.title}</p>}
      <div className="text-base leading-relaxed text-text-primary [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-brand-700 [&_a]:underline">
        <PortableText value={value.body || []} />
      </div>
    </aside>
  )
}

// ---- Key facts -------------------------------------------------------------

export function KeyFacts({ value }: { value: any }) {
  const items: string[] = (value?.items || []).filter(Boolean)
  if (items.length === 0) return null
  return (
    <aside className="my-8 rounded-lg bg-surface-offwhite border border-gray-100 p-6">
      <div className="w-10 h-1 bg-accent-orange rounded-full mb-4" />
      <p className="text-lg font-bold text-text-primary mb-4">{value.title || 'Key facts'}</p>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-base leading-relaxed text-text-primary">
            <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-brand-700" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

// ---- Pull quote ------------------------------------------------------------

export function PullQuote({ value }: { value: any }) {
  if (!value?.quote) return null
  return (
    <figure className="my-10 border-y-2 border-brand-700 py-6 text-center">
      <blockquote className="text-2xl md:text-3xl font-bold leading-snug text-brand-800">&ldquo;{value.quote}&rdquo;</blockquote>
      {value.attribution && (
        <figcaption className="mt-4 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">{value.attribution}</span>
          {value.role && <span>, {value.role}</span>}
        </figcaption>
      )}
    </figure>
  )
}

// ---- Embed -----------------------------------------------------------------

type EmbedInfo = { src: string; aspect: string } | null

function embedFor(raw: string): EmbedInfo {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^www\.|^m\./, '')

  const video = getEmbedUrl(raw)
  if (video) return { src: video, aspect: 'aspect-video' }

  if (host === 'twitter.com' || host === 'x.com') {
    const id = url.pathname.match(/status\/(\d+)/)?.[1]
    return id ? { src: `https://platform.twitter.com/embed/Tweet.html?id=${id}&dnt=true`, aspect: 'h-[560px]' } : null
  }
  if (host === 'instagram.com') {
    const m = url.pathname.match(/^\/(p|reel|tv)\/([\w-]+)/)
    return m ? { src: `https://www.instagram.com/${m[1]}/${m[2]}/embed`, aspect: 'h-[640px]' } : null
  }
  if (host === 'facebook.com' || host === 'fb.watch') {
    const isVideo = /\/videos\/|\/watch|\/reel\//.test(url.pathname) || host === 'fb.watch'
    const plugin = isVideo ? 'video' : 'post'
    return { src: `https://www.facebook.com/plugins/${plugin}.php?href=${encodeURIComponent(raw)}&show_text=true`, aspect: isVideo ? 'aspect-video' : 'h-[600px]' }
  }
  if (host === 'tiktok.com') {
    const id = url.pathname.match(/video\/(\d+)/)?.[1]
    return id ? { src: `https://www.tiktok.com/embed/v2/${id}`, aspect: 'h-[740px]' } : null
  }
  if (host === 'open.spotify.com') {
    return { src: `https://open.spotify.com/embed${url.pathname}`, aspect: 'h-[232px]' }
  }
  return null
}

export function Embed({ value }: { value: any }) {
  if (!value?.url) return null
  const info = embedFor(value.url)

  return (
    <figure className="my-8">
      {info ? (
        <div className={`relative w-full max-w-2xl mx-auto overflow-hidden rounded-lg bg-surface-offwhite ${info.aspect}`}>
          <iframe
            src={info.src}
            title={value.caption || 'Embedded content'}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      ) : (
        <a
          href={value.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg border border-gray-200 p-4 text-brand-700 font-semibold hover:bg-brand-50 break-all"
        >
          {value.url}
        </a>
      )}
      {value.caption && <figcaption className="text-sm text-text-muted mt-2 text-center">{value.caption}</figcaption>}
    </figure>
  )
}

// ---- Related story card ----------------------------------------------------

export function RelatedStory({ value }: { value: any }) {
  const story = value?.story
  if (!story?.slug?.current || story.status !== 'published') return null
  return (
    <aside className="my-8">
      <Link
        href={`/${story.category}/${story.slug.current}`}
        className="group flex gap-4 items-center rounded-lg border border-gray-200 p-4 hover:bg-surface-offwhite transition-colors"
      >
        {story.featuredImage?.asset && (
          <div className="relative w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0 rounded-md overflow-hidden">
            <Image
              src={urlForImage(story.featuredImage).width(256).height(160).url()}
              alt={story.featuredImage.alt || story.headline}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">{value.label || 'Read more'}</span>
          <p className="text-base font-bold text-text-primary leading-snug mt-1 group-hover:text-brand-700 transition-colors line-clamp-2">
            {story.headline}
          </p>
          <p className="text-xs text-text-muted mt-1">{formatPublishedDate(story.publishedAt)}</p>
        </div>
      </Link>
    </aside>
  )
}

// ---- Divider ---------------------------------------------------------------

export function Divider({ value }: { value: any }) {
  if (value?.style === 'dots') {
    return (
      <div className="my-10 text-center text-2xl tracking-[0.75em] text-text-muted" aria-hidden="true">
        •••
      </div>
    )
  }
  return <hr className="my-10 border-t border-gray-200" />
}
