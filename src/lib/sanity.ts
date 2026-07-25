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
    sidebarStories[]->{
      headline, slug, excerpt, featuredImage, category, publishedAt
    },
    showLiveUpdates,
    liveUpdatesSource->{
      headline, liveUpdates, slug, category
    },
    highlightSection{
      title,
      featured->{
        headline, slug, excerpt, featuredImage, category, publishedAt,
        "author": author->{name, photo}
      },
      list[]->{
        headline, slug, excerpt, featuredImage, category, publishedAt
      }
    },
    gridSection{
      title, category, count,
      "articles": *[
        _type == "article" &&
        status == "published" &&
        (!defined(^.category) || category == ^.category)
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
    headline, slug, excerpt, category, tags,
    featuredImage, body, isBreaking, hasLiveUpdates, liveUpdates,
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