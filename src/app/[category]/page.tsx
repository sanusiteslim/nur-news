import { client, categoryPageQuery, categoryCountQuery } from '@/lib/sanity'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import CategoryListing, { CATEGORY_PAGE_SIZE } from '@/components/category/CategoryListing'
import { categoryLabels, validCategories } from '@/lib/taxonomy'

// Refreshed on publish by /api/revalidate; this is only the fallback timer.
export const revalidate = 120

export function generateStaticParams() {
  // /opinion has its own page; everything else is pre-built at deploy.
  return validCategories.filter((c) => c !== 'opinion').map((category) => ({ category }))
}

type Params = { params: { category: string } }

export function generateMetadata({ params }: Params): Metadata {
  const category = params.category
  if (!validCategories.includes(category)) return {}
  const label = categoryLabels[category] || category
  return {
    title: `${label} News`,
    description: `The latest ${label} news, analysis and reporting from NUR Report.`,
    alternates: {
      canonical: `/${category}`,
      types: { 'application/rss+xml': [{ url: `/${category}/rss.xml`, title: `${label} | NUR Report` }] },
    },
    openGraph: {
      type: 'website',
      title: `${label} News | NUR Report`,
      description: `The latest ${label} news, analysis and reporting from NUR Report.`,
      url: `/${category}`,
    },
  }
}

export default async function CategoryPage({ params }: Params) {
  // Validate BEFORE touching Sanity, so junk URLs cost nothing.
  if (!validCategories.includes(params.category)) {
    const lower = params.category.toLowerCase()
    if (validCategories.includes(lower)) permanentRedirect(`/${lower}`)
    return notFound()
  }
  const category = params.category

  const [articles, total] = await Promise.all([
    client.fetch(categoryPageQuery, { category, start: 0, end: CATEGORY_PAGE_SIZE }),
    client.fetch<number>(categoryCountQuery, { category }),
  ])

  if (!articles || articles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-brand-800 mb-2">{categoryLabels[category] || category}</h1>
        <p className="text-text-secondary">No stories here yet — check back soon.</p>
      </div>
    )
  }

  return (
    <CategoryListing
      category={category}
      articles={articles}
      page={1}
      totalPages={Math.max(1, Math.ceil((total || 0) / CATEGORY_PAGE_SIZE))}
    />
  )
}
