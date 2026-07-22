import { client, categoryQuery } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import ArticleCard from '@/components/ui/ArticleCard'

export const revalidate = 10

const categoryLabels: Record<string, string> = {
  nigeria: 'Nigeria',
  africa: 'Africa',
  world: 'World',
  sports: 'Sports',
  opinion: 'Opinion',
  business: 'Business',
  tech: 'Tech',
  culture: 'Culture',
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const articles = await client.fetch(categoryQuery(params.category))

  if (!articles || articles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-brand-800 mb-2">{categoryLabels[params.category] || params.category}</h1>
        <p className="text-text-secondary">No articles yet. Add some in Sanity CMS.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-brand-800 mb-2">{categoryLabels[params.category] || params.category}</h1>
      <p className="text-text-secondary mb-8">Latest {categoryLabels[params.category]?.toLowerCase() || params.category} news and analysis from NUR.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: any) => (
          <ArticleCard key={article.slug.current} article={article} />
        ))}
      </div>
    </div>
  )
}