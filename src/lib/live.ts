import 'server-only'
import { urlForImage } from './image'

/**
 * Live posts are rendered by a client component, so Sanity image objects are
 * turned into plain URLs here, on the server. That keeps the Sanity client
 * (and its image builder) out of the browser bundle.
 */
export type LivePost = {
  _key: string
  publishedAt: string
  title?: string
  body: any[]
  isKey?: boolean
  isBreaking?: boolean
  isPinned?: boolean
  author?: { name?: string; photoUrl?: string; slug?: string }
}

export function serializeLivePosts(posts: any[] | null | undefined): LivePost[] {
  return (posts || [])
    .filter((p) => p?._key && p?.publishedAt)
    .map((p) => ({
      _key: p._key,
      publishedAt: p.publishedAt,
      title: p.title || undefined,
      isKey: Boolean(p.isKey),
      isBreaking: Boolean(p.isBreaking),
      isPinned: Boolean(p.isPinned),
      author: p.author?.name
        ? {
            name: p.author.name,
            slug: p.author.slug?.current,
            photoUrl: p.author.photo?.asset ? urlForImage(p.author.photo).width(64).height(64).url() : undefined,
          }
        : undefined,
      body: (p.body || []).map((block: any) =>
        block?._type === 'image'
          ? {
              _type: 'liveImage',
              _key: block._key,
              url: block.asset ? urlForImage(block).width(1000).url() : null,
              alt: block.alt || '',
              caption: block.caption || '',
            }
          : block
      ),
    }))
}

/** Plain-text version of a post body, for structured data. */
export function postText(body: any[]): string {
  return (body || [])
    .filter((b) => b?._type === 'block')
    .map((b) => (b.children || []).map((c: any) => c.text).join(''))
    .join(' ')
    .trim()
}
