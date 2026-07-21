export default function SectionGrid({ data }: { data: any }) {
  if (!data) return null
  const { title, category } = data

  return (
    <section>
      <h2 className="section-title mb-4">{title || 'More Stories'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full text-center py-12 text-text-muted bg-gray-50 rounded-lg">
          <p>Articles in <span className="font-semibold capitalize">{category}</span> will appear here.</p>
          <p className="text-sm mt-2">Add articles in Sanity CMS with category &quot;{category}&quot;.</p>
        </div>
      </div>
    </section>
  )
}