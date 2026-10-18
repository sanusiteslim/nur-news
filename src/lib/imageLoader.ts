'use client'

/**
 * next/image loader. Sanity's CDN already resizes and converts images for
 * free, so routing them through Vercel's optimiser too only burns the Hobby
 * plan's image-optimisation quota. Sanity URLs get the requested width (and a
 * proportionally scaled height, if one was set) applied directly; any other
 * source is returned unchanged.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith('https://cdn.sanity.io/')) return src

  const url = new URL(src)
  const params = url.searchParams
  const w = Number(params.get('w'))
  const h = Number(params.get('h'))

  if (w && h) params.set('h', String(Math.round((h / w) * width)))
  params.set('w', String(width))
  params.set('q', String(quality || 75))
  if (!params.has('auto')) params.set('auto', 'format')
  return url.toString()
}
