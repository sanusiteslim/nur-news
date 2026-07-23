import ArticleCard from '@/components/ui/ArticleCard'

export default function RelatedArticles({ articles }: { articles: any[] }) {
  if (!articles || articles.length === 0) return null

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent-orange" />
        Related
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: any) => (
          <ArticleCard key={article.slug.current} article={article} />
        ))}
      </div>
    </section>
  )
}