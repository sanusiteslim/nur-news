import { getSiteUrl } from './site'

export const SITE_NAME = 'NUR Report'

// Official profiles (same as the footer). Helps Google tie them to the site.
const SOCIAL_PROFILES = [
  'https://www.facebook.com/nurreport',
  'https://x.com/nurreporthq',
  'https://www.instagram.com/nurreporthq',
  'https://www.youtube.com/@nurrhq',
  'https://whatsapp.com/channel/0029VbDVR0X1NCrdmavdcg41',
]

/**
 * Serialises structured data for a <script type="application/ld+json">.
 * `<` is escaped so a headline containing "</script>" can't break out of the
 * tag (JSON.stringify alone doesn't protect against that).
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/** Drops undefined/null/empty-array keys so the output stays tidy. */
function clean<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0))
  ) as T
}

export function publisher() {
  const site = getSiteUrl()
  return {
    '@type': 'NewsMediaOrganization',
    '@id': `${site}/#organization`,
    name: SITE_NAME,
    url: site,
    logo: { '@type': 'ImageObject', url: `${site}/icon-512.png`, width: 512, height: 512 },
  }
}

/** Site-wide graph: the newsroom itself plus the site search action. */
export function siteJsonLd() {
  const site = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@graph': [
      clean({
        ...publisher(),
        description: 'Independent news coverage of Nigeria, Africa, and the world.',
        foundingLocation: { '@type': 'Place', name: 'Nigeria' },
        publishingPrinciples: `${site}/editorial-standards`,
        correctionsPolicy: `${site}/corrections`,
        ethicsPolicy: `${site}/editorial-standards`,
        sameAs: SOCIAL_PROFILES,
      }),
      {
        '@type': 'WebSite',
        '@id': `${site}/#website`,
        url: site,
        name: SITE_NAME,
        inLanguage: 'en-NG',
        publisher: { '@id': `${site}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${site}/search?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }
}

type ArticleLike = {
  headline: string
  excerpt?: string
  category: string
  tags?: string[]
  publishedAt: string
  _updatedAt?: string
  corrections?: { date: string }[]
  author?: { name?: string; slug?: { current?: string } }
  slug: { current: string }
}

export function newsArticleJsonLd(article: ArticleLike, images: string[], sectionLabel?: string) {
  const site = getSiteUrl()
  const url = `${site}/${article.category}/${article.slug.current}`
  // A correction is a real modification; otherwise use Sanity's own timestamp,
  // never earlier than publication.
  const latestCorrection = (article.corrections || []).map((c) => c.date).sort().pop()
  const modified = [article.publishedAt, article._updatedAt, latestCorrection].filter(Boolean).sort().pop()

  return clean({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.headline.slice(0, 110),
    description: article.excerpt,
    image: images,
    datePublished: article.publishedAt,
    dateModified: modified,
    articleSection: sectionLabel,
    keywords: article.tags?.join(', '),
    inLanguage: 'en-NG',
    isAccessibleForFree: true,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    author: article.author?.name
      ? clean({
          '@type': 'Person',
          name: article.author.name,
          url: article.author.slug?.current ? `${site}/author/${article.author.slug.current}` : undefined,
        })
      : { '@type': 'Organization', name: SITE_NAME, url: site },
    publisher: publisher(),
  })
}

export function collectionPageJsonLd(opts: { name: string; description?: string; path: string; urls: string[] }) {
  const site = getSiteUrl()
  return clean({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: `${site}${opts.path}`,
    isPartOf: { '@id': `${site}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: opts.urls.slice(0, 20).map((u, i) => ({ '@type': 'ListItem', position: i + 1, url: u })),
    },
  })
}
