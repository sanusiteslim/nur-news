import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nurreport.name.ng';

  // Define your static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // Optional: If you want to dynamically map articles from your database later:
  /*
  const res = await fetch(`${baseUrl}/api/articles`);
  const articles = await res.json();

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article: any) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...articleRoutes];
  */

  return staticRoutes;
}
