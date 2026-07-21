export interface Article {
  _id: string
  headline: string
  slug: { current: string }
  excerpt: string
  category: string
  tags?: string[]
  featuredImage?: {
    asset: any
    alt?: string
    caption?: string
  }
  body: any[]
  isBreaking?: boolean
  hasLiveUpdates?: boolean
  liveUpdates?: {
    timestamp: string
    updateText: string
  }[]
  author?: Author
  publishedAt: string
  status: 'draft' | 'published' | 'scheduled'
}

export interface Author {
  _id: string
  name: string
  slug: { current: string }
  role?: string
  bio?: string
  photo?: any
  twitter?: string
  email?: string
}