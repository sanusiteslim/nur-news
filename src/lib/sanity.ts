import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { groq } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-07-17',
  useCdn: true,
})
const builder = imageUrlBuilder(client)
export const urlFor = (source: any) => builder.image(source)

export const homepageQuery = `
  *[_type == "homepage"] | order(_updatedAt desc)[0] {
    "heroStory": select(heroStory->status == "published" => heroStory->{
      headline, slug, excerpt, featuredImage, category, publishedAt,
      "author": author->{name, photo}
    }),
    sidebarStories[]{
      label,
      "story": select(story->status == "published" => story->{
        headline, slug, excerpt, featuredImage, category, publishedAt
      })
    },
    showLiveUpdates,
    liveUpdatesSource->{
      headline, liveUpdates, slug, category
    },
    highlightSection{
      title,
      // De-duplication against the hero is done in lib/homepageDedup.ts.
      "featured": select(featured->status == "published" => featured->{
        headline, slug, excerpt, featuredImage, category, publishedAt,
        "author": author->{name, photo}
      }),
      "list": list[@->status == "published"]->{
        headline, slug, excerpt, featuredImage, category, publishedAt
      }
    },
    gridSection{
      title, category, count,
      "articles": *[
        _type == "article" &&
        status == "published" &&
        (defined(^.category) && category == ^.category ||
         !defined(^.category) && category != "opinion")
      ] | order(publishedAt desc) [0...24] {
        headline, slug, excerpt, featuredImage, category, publishedAt,
        "author": author->{name, photo}
      }
    },
    opinionSection{
      title, count,
      "articles": *[
        _type == "article" &&
        status == "published" &&
        category == "opinion"
      ] | order(publishedAt desc) [0...16] {
        headline, slug, excerpt, featuredImage, category, publishedAt,
        "author": author->{name, photo}
      }
    }
  }
`

export const breakingNewsQuery = `
  *[_type == "article" && isBreaking == true && status == "published"] | order(publishedAt desc)[0] {
    headline, slug, category, featuredImage
  }
`

export const articleQuery = `
  *[_type == "article" && slug.current == $slug && status == "published"][0] {
    _id, _updatedAt, headline, slug, excerpt, category, tags,
    featuredImage, isBreaking, hasLiveUpdates, liveUpdates,
    body,
    videoUrl, videoDuration,
    publishedAt,
    sources, corrections, seo,
    "author": author->{name, photo, bio, slug, role}
  }
`

// Paginated category listing with a parametrised $category and a
// $start/$end range — used by every category page, the Opinion page, the
// per-category RSS feed and the "Show more" API route.
export const categoryCountQuery = groq`
  count(*[_type == "article" && category == $category && status == "published"])
`

export const categoryPageQuery = groq`
  *[_type == "article" && category == $category && status == "published"] | order(publishedAt desc) [$start...$end] {
    headline, slug, excerpt, featuredImage, category, publishedAt,
    "author": author->{name, photo}
  }
`

// Full-text-ish search across headline, excerpt, and body.
// Pass the term already wildcarded, e.g. client.fetch(searchQuery, { term: `${q}*` })
// src/lib/sanity.ts


export const searchQuery = groq`
  *[
    _type == "article" &&
    status == "published" &&
    (
      headline match $term ||
      excerpt match $term ||
      pt::text(body) match $term
    )
  ] | order(publishedAt desc) [0...24] {
    headline, slug, excerpt, featuredImage, category, publishedAt,
    "author": author->{name, photo}
  }
`

// Related = shares a tag (case-insensitive) or the category, ranked by how
// many tags overlap, then recency. Falls back gracefully when untagged.
export const relatedArticlesQuery = groq`
  *[
    _type == "article" &&
    status == "published" &&
    slug.current != $slug &&
    (category == $category || count(tags[lower(@) in $tags]) > 0)
  ] | score(boost(count(tags[lower(@) in $tags]) > 0, 2), boost(category == $category, 1))
    | order(_score desc, publishedAt desc) [0...3] {
    headline, slug, excerpt, featuredImage, category, publishedAt,
    "author": author->{name, photo}
  }
`

// Video articles: either category='video' OR has a videoUrl/videoFile
// Fetches article summaries for a known set of slugs. Used to hydrate the
// Most Read module: the ranking itself comes from Redis (src/lib/analytics.ts),
// this just resolves those slugs back into displayable article data. Order
// from Sanity's `in` filter isn't guaranteed to match $slugs — the caller
// re-sorts by the original view-count order.
export const articlesBySlugsQuery = groq`
  *[_type == "article" && status == "published" && slug.current in $slugs] {
    headline, slug, category, publishedAt
  }
`

export const videoArticlesQuery = groq`
  *[_type == "article" && (category == "video" || defined(videoUrl)) && status == "published"] | order(publishedAt desc) [0...48] {
    _id,
    headline,
    slug,
    category,
    excerpt,
    featuredImage,
    videoUrl,
    videoDuration,
    publishedAt,
    author->{
      name,
      photo
    }
  }
`

// Latest video for hero section
export const latestVideoQuery = groq`
  *[_type == "article" && (category == "video" || defined(videoUrl)) && status == "published"] | order(publishedAt desc)[0] {
    _id,
    headline,
    slug,
    category,
    excerpt,
    featuredImage,
    videoUrl,
    videoDuration,
    publishedAt,
    author->{
      name,
      photo
    }
  }
`
// ---------------------------------------------------------------------------
// Author profiles  (/author/[slug])
// ---------------------------------------------------------------------------

/** One author's public profile. */
export const authorQuery = groq`
  *[_type == "author" && slug.current == $slug][0] {
    name, slug, role, state, bio, photo, twitter, email
  }
`

/** Every published article by a given author, newest first. */
export const authorArticlesQuery = groq`
  *[_type == "article" && status == "published" && author->slug.current == $slug]
    | order(publishedAt desc) [0...50] {
    headline, slug, excerpt, featuredImage, category, publishedAt,
    "author": author->{name, photo}
  }
`

/** All author slugs — used to statically generate author pages. */
export const allAuthorSlugsQuery = groq`
  *[_type == "author" && defined(slug.current)].slug.current
`

/** Authors who have at least one published article, for the /authors index. */
export const activeAuthorsQuery = groq`
  *[_type == "author" && defined(slug.current)] {
    name, slug, role, photo, bio,
    "articleCount": count(*[_type == "article" && status == "published" && author._ref == ^._id])
  }[articleCount > 0] | order(name asc)
`

// ---------------------------------------------------------------------------
// Tag archives  (/tag/[tag])
// ---------------------------------------------------------------------------

/** Published articles carrying a given tag (matched case-insensitively), newest first. */
// Two deliberate choices here:
//  1. `in` (exact array membership), not `match`. `match` does tokenized text
//     matching, so /tag/war would wrongly pull in "us-israel-iran-war".
//  2. The param is named $topic, not $tag. next-sanity's typed groq parser
//     can't tell the param `$tag` apart from the field `tags` — that prefix
//     collision breaks its tokenizer and makes client.fetch(q, { tag }) a
//     type error. Any non-colliding name works.
export const tagArticlesQuery = groq`
  *[_type == "article" && status == "published" && count(tags[lower(@) == $topic]) > 0]
    | order(publishedAt desc) [$start...$end] {
    headline, slug, excerpt, featuredImage, category, publishedAt, tags,
    "author": author->{name, photo}
  }
`

/**
 * Every distinct tag in use across published articles.
 * `array::unique` flattens the per-article tag arrays into one deduplicated
 * list, which is what the /tag index renders.
 */
export const allTagsQuery = groq`
  array::unique(*[_type == "article" && status == "published" && defined(tags)].tags[])
`

/** How many published articles carry a given tag. */
export const tagCountQuery = groq`
  count(*[_type == "article" && status == "published" && count(tags[lower(@) == $topic]) > 0])
`
export const latestBriefsQuery = groq`
  *[
    _type == "brief" &&
    status == "published"
  ]
  | order(date desc)[0...30] {
    _id,
    title,
    slug,
    date,
    edition,
    list,
    intro
  }
`

export const briefBySlugQuery = groq`
  *[
    _type == "brief" &&
    slug.current == $slug &&
    status == "published"
  ][0] {
    _id,
    title,
    slug,
    date,
    edition,
    list,
    intro,
    closing,

    "leadStory": leadStory->{
      _id,
      headline,
      slug,
      excerpt,
      featuredImage,
      category,
      publishedAt,
      "author": author->{
        name,
        photo
      }
    },

    "nigeria": nigeria[]->{
      _id,
      headline,
      slug,
      excerpt,
      featuredImage,
      category,
      publishedAt
    },

    "business": business[]->{
      _id,
      headline,
      slug,
      excerpt,
      featuredImage,
      category,
      publishedAt
    },

    "tech": tech[]->{
      _id,
      headline,
      slug,
      excerpt,
      featuredImage,
      category,
      publishedAt
    },

    "sports": sports[]->{
      _id,
      headline,
      slug,
      excerpt,
      featuredImage,
      category,
      publishedAt
    },

    "world": world[]->{
      _id,
      headline,
      slug,
      excerpt,
      featuredImage,
      category,
      publishedAt
    }
  }
`

// ---------------------------------------------------------------------------
// Topic hubs  (/topics, /topics/[slug])
// ---------------------------------------------------------------------------

export const topicsIndexQuery = groq`
  *[_type == "topic" && defined(slug.current) && isFeatured != false] | order(_updatedAt desc) {
    title, slug, summary, heroImage,
    "count": count(*[_type == "article" && status == "published" && count(tags[lower(@) in ^.^.tags]) > 0])
  }
`

export const topicQuery = groq`
  *[_type == "topic" && slug.current == $slug][0] {
    _updatedAt, title, slug, summary, intro, heroImage, tags, faq, seo,
    "pinned": pinned[@->status == "published"]->{
      headline, slug, excerpt, featuredImage, category, publishedAt,
      "author": author->{name, photo}
    },
    "timeline": timeline[] | order(date desc) {
      date, text, "article": article->{headline, slug, category}
    }
  }
`

export const topicArticlesQuery = groq`
  *[_type == "article" && status == "published" && count(tags[lower(@) in $tags]) > 0]
    | order(publishedAt desc) [0...30] {
    headline, slug, excerpt, featuredImage, category, publishedAt,
    "author": author->{name, photo}
  }
`

export const allTopicSlugsQuery = groq`
  *[_type == "topic" && defined(slug.current)]{ "slug": slug.current, _updatedAt }
`

// ---------------------------------------------------------------------------
// Live events  (/live, /live/[slug])
// ---------------------------------------------------------------------------

const livePostProjection = `
  _key, publishedAt, title, body, isKey, isBreaking, isPinned,
  "author": author->{name, photo, slug}
`

export const liveEventsIndexQuery = groq`
  *[_type == "liveEvent" && defined(slug.current)] | order(startAt desc) [0...40] {
    title, slug, status, eventType, summary, heroImage, startAt, endAt, category,
    "postCount": count(posts),
    "lastPostAt": posts | order(publishedAt desc)[0].publishedAt
  }
`

export const liveEventQuery = groq`
  *[_type == "liveEvent" && slug.current == $slug][0] {
    _id, _updatedAt, title, slug, status, eventType, summary, keyPoints, heroImage,
    startAt, endAt, category, seo,
    "electionSlug": election->slug.current,
    "topic": relatedTopic->{title, slug},
    "posts": posts | order(publishedAt desc) [0...200] { ${livePostProjection} }
  }
`

/** Posts newer than $since (ISO date) — what the live page polls for. */
export const livePostsSinceQuery = groq`
  *[_type == "liveEvent" && slug.current == $slug][0] {
    status, keyPoints, _updatedAt,
    "posts": posts[publishedAt > $since] | order(publishedAt desc) { ${livePostProjection} }
  }
`

/** The event (if any) currently live — drives the LIVE button and strip. */
export const currentLiveEventQuery = groq`
  *[_type == "liveEvent" && status == "live"] | order(startAt desc)[0] {
    title, slug, "lastPostAt": posts | order(publishedAt desc)[0].publishedAt
  }
`

export const allLiveSlugsQuery = groq`
  *[_type == "liveEvent" && defined(slug.current)]{ "slug": slug.current, _updatedAt }
`

// ---------------------------------------------------------------------------
// Corrections log  (/corrections)
// ---------------------------------------------------------------------------

export const correctionsQuery = groq`
  *[_type == "article" && status == "published" && count(corrections) > 0] {
    headline, slug, category,
    "latest": corrections | order(date desc)[0]
  } | order(latest.date desc) [0...100]
`
