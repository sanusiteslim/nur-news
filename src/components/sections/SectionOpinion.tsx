export default function SectionOpinion({ data }: { data: any }) {
  if (!data) return null
  const { title } = data

  return (
    <section>
      <h2 className="section-title mb-4">{title || 'Opinion'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-full text-center py-12 text-text-muted bg-gray-50 rounded-lg">
          <p>Opinion articles will appear here.</p>
          <p className="text-sm mt-2">Tag articles as &quot;Opinion&quot; category in Sanity CMS.</p>
        </div>
      </div>
    </section>
  )
}