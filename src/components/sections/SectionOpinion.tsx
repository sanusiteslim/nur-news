import ArticleCard from '@/components/ui/ArticleCard'

export default function SectionOpinion({ data }: { data: any }) {
  if (!data) return null
  const { title, count, articles: allArticles } = data
  const articles = (allArticles || []).slice(0, count || 4)

  return (
    <section>
      <h2 className="section-title mb-4">{title || 'Opinion'}</h2>
      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article: any) => (
            <ArticleCard key={article.slug.current} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-text-muted bg-gray-50 rounded-lg">
          <p className="text-sm">No opinion pieces yet. Add some in Sanity CMS.</p>
        </div>
      )}
    </section>
  )
}