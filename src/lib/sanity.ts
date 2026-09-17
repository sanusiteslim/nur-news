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
  *[_type == "homepage"][0] {  // ← removed: && _id == "homepage"
    heroStory->{
      headline, slug, excerpt, featuredImage, category, publishedAt,
      "author": author->{name, photo}
    },
    sidebarStories[]{
      label,
      story->{
        headline, slug, excerpt, featuredImage, category, publishedAt
      }
    },
    showLiveUpdates,
    liveUpdatesSource->{
      headline, liveUpdates, slug, category
    },
    highlightSection{
      title,
      "featured": select(
        ^.heroStory->slug.current == featured->slug.current => null,
        featured->{
          headline, slug, excerpt, featuredImage, category, publishedAt,
          "author": author->{name, photo}
        }
      ),
      list[]->{
        headline, slug, excerpt, featuredImage, category, publishedAt
      }
    },
    gridSection{
      title, category, count,
      "articles": *[
        _type == "article" &&
        status == "published" &&
        (!defined(^.category) || category == ^.category) &&
        slug.current != ^.^.heroStory->slug.current
      ] | order(publishedAt desc) [0...9] {
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
      ] | order(publishedAt desc) [0...6] {
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
  *[_type == "article" && slug.current == $slug][0] {
    _id, headline, slug, excerpt, category, tags,
    featuredImage, body, isBreaking, hasLiveUpdates, liveUpdates,
    videoUrl, videoDuration,
    publishedAt,
    "author": author->{name, photo, bio, slug, role}
  }
`

export const categoryQuery = (category: string) => `
  *[_type == "article" && category == "${category}" && status == "published"] | order(publishedAt desc) {
    headline, slug, excerpt, featuredImage, category, publishedAt,
    "author": author->{name, photo}
  }
`

// Same data, but paginated with a properly parametrized $category (rather
// than string-interpolated) and a $start/$end range — used by the Opinion
// category page's hero + initial feed, and by the "Show more" API route for
// subsequent pages.
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

export const relatedArticlesQuery = `
  *[
    _type == "article" &&
    status == "published" &&
    category == $category &&
    slug.current != $slug
  ] | order(publishedAt desc) [0...3] {
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
  *[_type == "article" && (category == "video" || defined(videoUrl) || defined(videoFile)) && status == "published"] | order(publishedAt desc) {
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
  *[_type == "article" && (category == "video" || defined(videoUrl) || defined(videoFile)) && status == "published"] | order(publishedAt desc)[0] {
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
  *[_type == "author" && defined(slug.current) && count(*[_type == "article" && status == "published" && author._ref == ^._id]) > 0]
    | order(name asc) {
    name, slug, role, photo, bio,
    "articleCount": count(*[_type == "article" && status == "published" && author._ref == ^._id])
  }
`

// ---------------------------------------------------------------------------
// Tag archives  (/tag/[tag])
// ---------------------------------------------------------------------------

/** Every published article carrying a given tag, newest first. */
// Two deliberate choices here:
//  1. `in` (exact array membership), not `match`. `match` does tokenized text
//     matching, so /tag/war would wrongly pull in "us-israel-iran-war".
//  2. The param is named $topic, not $tag. next-sanity's typed groq parser
//     can't tell the param `$tag` apart from the field `tags` — that prefix
//     collision breaks its tokenizer and makes client.fetch(q, { tag }) a
//     type error. Any non-colliding name works.
export const tagArticlesQuery = groq`
  *[_type == "article" && status == "published" && $topic in tags]
    | order(publishedAt desc) [0...50] {
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
  count(*[_type == "article" && status == "published" && $topic in tags])
`
