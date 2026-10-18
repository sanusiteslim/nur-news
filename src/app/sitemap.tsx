import { MetadataRoute } from 'next'
import { client, allTagsQuery, allAuthorSlugsQuery, allTopicSlugsQuery, allLiveSlugsQuery } from '@/lib/sanity'
import { validCategories } from '@/lib/taxonomy'

// Rebuilt hourly (and on publish via /api/revalidate). Without this export
// Next.js generated the sitemap once at build time and never again.
export const revalidate = 3600

// Only published articles, and only fields we actually need to build a URL
const SITEMAP_QUERY = `*[_type == "article" && status == "published" && defined(slug.current)] {
  "slug": slug.current,
  category,
  _updatedAt
}`

interface SanityArticle {
  slug: string
  category: string
  _updatedAt: string
}

// Static pages that aren't category or article routes. `/search` is
// deliberately excluded — its own metadata sets robots:noindex, so listing it
// here would send Google mixed signals.
const STATIC_PAGES = [
  'about',
  'careers',
  'contact',
  'advertise',
  'terms',
  'privacy',
  'cookies',
  'tip',
  'live',
  'author',
  'tag',
  'topics',
  'newsletters',
  'brief',
  'most-read',
  'editorial-standards',
  'corrections',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nurreport.name.ng'

  // Fetch the three dynamic sets in parallel. Each is independently guarded:
  // a Sanity hiccup on tags shouldn't blank out the article URLs, which are
  // the part that actually matters for indexing.
  const [articles, tags, authorSlugs, topics, liveEvents] = await Promise.all([
    client.fetch<SanityArticle[]>(SITEMAP_QUERY).catch((err) => {
      console.error('sitemap: article fetch failed:', err)
      return [] as SanityArticle[]
    }),
    client.fetch<string[]>(allTagsQuery).catch((err) => {
      console.error('sitemap: tag fetch failed:', err)
      return [] as string[]
    }),
    client.fetch<string[]>(allAuthorSlugsQuery).catch((err) => {
      console.error('sitemap: author fetch failed:', err)
      return [] as string[]
    }),
    client.fetch<{ slug: string; _updatedAt: string }[]>(allTopicSlugsQuery).catch(() => []),
    client.fetch<{ slug: string; _updatedAt: string }[]>(allLiveSlugsQuery).catch(() => []),
  ])

  const articleRoutes: MetadataRoute.Sitemap = (articles || [])
    .filter((article) => article.category && article.slug)
    .map((article) => ({
      // Real route shape is /{category}/{slug}
      url: `${baseUrl}/${article.category}/${article.slug}`,
      // Sanity's exact timestamp, so Google knows when a story was updated
      lastModified: new Date(article._updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

  const homeRoute: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
  ]

  // Sourced from lib/taxonomy so this can't drift out of sync with the
  // categories the site actually serves.
  const categoryRoutes: MetadataRoute.Sitemap = validCategories.map((category) => ({
    url: `${baseUrl}/${category}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.7,
  }))

  // Tags are matched case-insensitively, so list each once, lowercased.
  const uniqueTags = Array.from(new Set((tags || []).filter(Boolean).map((t) => t.toLowerCase())))
  const tagRoutes: MetadataRoute.Sitemap = uniqueTags.map((tag) => ({
    url: `${baseUrl}/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.6,
  }))

  const authorRoutes: MetadataRoute.Sitemap = (authorSlugs || []).map((slug) => ({
    url: `${baseUrl}/author/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  const topicRoutes: MetadataRoute.Sitemap = (topics || []).map((t) => ({
    url: `${baseUrl}/topics/${t.slug}`,
    lastModified: new Date(t._updatedAt),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  const liveRoutes: MetadataRoute.Sitemap = (liveEvents || []).map((e) => ({
    url: `${baseUrl}/live/${e.slug}`,
    lastModified: new Date(e._updatedAt),
    changeFrequency: 'hourly',
    priority: 0.7,
  }))

  const staticRoutes: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${baseUrl}/${page}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.3,
  }))

  return [
    ...homeRoute,
    ...categoryRoutes,
    ...articleRoutes,
    ...topicRoutes,
    ...liveRoutes,
    ...tagRoutes,
    ...authorRoutes,
    ...staticRoutes,
  ]
}
