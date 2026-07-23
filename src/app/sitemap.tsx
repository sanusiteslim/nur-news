import { MetadataRoute } from 'next';
// Replace this with the exact path to your configured Sanity client file
import { client } from '@/lib/sanity' 

// 1. Create a clean GROQ query to only fetch published article paths
const SITEMAP_QUERY = `*[_type == "post" && defined(slug.current)] {
  "slug": slug.current,
  _updatedAt
}`;

interface SanityPost {
  slug: string;
  _updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nurreport.name.ng';

  // 2. Fetch the dynamic article data straight from Sanity's CDN
  let articleRoutes: MetadataRoute.Sitemap = [];
  
  try {
    const posts = await client.fetch<SanityPost[]>(SITEMAP_QUERY);
    
    articleRoutes = posts.map((post) => ({
      url: `${baseUrl}/articles/${post.slug}`,
      // Uses Sanity's exact timestamp so Google knows when you updated an article
      lastModified: new Date(post._updatedAt), 
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error fetching Sanity paths for sitemap:", error);
  }

  // 3. Define your basic core landing pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 4. Merge them together into one beautiful sitemap index
  return [...staticRoutes, ...articleRoutes];
}
