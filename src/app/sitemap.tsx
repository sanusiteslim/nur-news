import { MetadataRoute } from 'next';
import { client } from '@/lib/sanity'

// Only published articles, and only fields we actually need to build a URL
const SITEMAP_QUERY = `*[_type == "article" && status == "published" && defined(slug.current)] {
  "slug": slug.current,
  category,
  _updatedAt
}`;

interface SanityArticle {
  slug: string;
  category: string;
  _updatedAt: string;
}

// Keep this in sync with the validCategories list in src/app/[category]/page.tsx
const CATEGORIES = [
  'nigeria', 'africa', 'world', 'sports', 'video',
  'business', 'tech', 'culture', 'environment', 'opinion',
]

const STATIC_PAGES = [
  'about', 'careers', 'contact', 'advertise', 'terms', 'privacy', 'cookies',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nurreport.name.ng';

  let articleRoutes: MetadataRoute.Sitemap = [];

  try {
    const articles = await client.fetch<SanityArticle[]>(SITEMAP_QUERY);

    articleRoutes = articles
      .filter((article) => article.category && article.slug)
      .map((article) => ({
        url: `${baseUrl}/${article.category}/${article.slug}`,
        lastModified: new Date(article._updatedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
  } catch (error) {
    console.error("Error fetching Sanity paths for sitemap:", error);
  }

  const homeRoute: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${baseUrl}/${category}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.6,
  }))

  const staticRoutes: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${baseUrl}/${page}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.3,
  }))

  return [...homeRoute, ...categoryRoutes, ...articleRoutes, ...staticRoutes];
}