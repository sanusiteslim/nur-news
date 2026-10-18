import { client, categoryPageQuery, categoryCountQuery } from '@/lib/sanity'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import CategoryListing, { CATEGORY_PAGE_SIZE, categoryPagePath } from '@/components/category/CategoryListing'
import { categoryLabels, validCategories } from '@/lib/taxonomy'

export const revalidate = 600

type Params = { params: { category: string; n: string } }

// Rendered on first visit, then cached until revalidated (ISR), instead of
// a fresh server render on every view.
export function generateStaticParams() {
  return []
}

function parsePage(n: string): number | null {
  if (!/^\d{1,4}$/.test(n)) return null
  const page = Number(n)
  return page >= 1 ? page : null
}

export function generateMetadata({ params }: Params): Metadata {
  const page = parsePage(params.n)
  if (!validCategories.includes(params.category) || !page) return {}
  const label = categoryLabels[params.category] || params.category
  return {
    title: `${label} News — Page ${page}`,
    description: `More ${label} news and analysis from NUR Report, page ${page}.`,
    alternates: { canonical: categoryPagePath(params.category, page) },
  }
}

export default async function CategoryPagedPage({ params }: Params) {
  const page = parsePage(params.n)
  if (!validCategories.includes(params.category) || !page) return notFound()
  if (page === 1) permanentRedirect(`/${params.category}`)

  const category = params.category
  const start = (page - 1) * CATEGORY_PAGE_SIZE
  const [articles, total] = await Promise.all([
    client.fetch(categoryPageQuery, { category, start, end: start + CATEGORY_PAGE_SIZE }),
    client.fetch<number>(categoryCountQuery, { category }),
  ])

  const totalPages = Math.max(1, Math.ceil((total || 0) / CATEGORY_PAGE_SIZE))
  if (!articles || articles.length === 0 || page > totalPages) return notFound()

  return <CategoryListing category={category} articles={articles} page={page} totalPages={totalPages} />
}
