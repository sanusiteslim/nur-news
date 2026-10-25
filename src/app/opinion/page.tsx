import type { Metadata } from 'next'
import { CategoryLanding } from '@/components/category/CategoryListing'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Opinion',
  description: 'Analysis and opinion on Nigeria, Africa, and world affairs from NUR Report contributors.',
  alternates: {
    canonical: '/opinion',
    types: { 'application/rss+xml': [{ url: '/opinion/rss.xml', title: 'Opinion | NUR Report' }] },
  },
}

// Same layout as every other section page; see CategoryLanding.
export default function OpinionPage() {
  return <CategoryLanding category="opinion" />
}
