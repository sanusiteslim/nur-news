import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { CategoryLanding } from '@/components/category/CategoryListing'
import { categoryLabels, validCategories } from '@/lib/taxonomy'

// Refreshed on publish by /api/revalidate; this is only the fallback timer.
export const revalidate = 120

export function generateStaticParams() {
  // /opinion and /video have their own pages; everything else is pre-built at deploy.
  return validCategories.filter((c) => c !== 'opinion' && c !== 'video').map((category) => ({ category }))
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
  return <CategoryLanding category={params.category} />
}
