'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getVideoThumbnail } from '@/lib/video'
import { urlForImage } from '@/lib/image'
import { formatDistanceToNow } from 'date-fns'

interface VideoCardProps {
  article: {
    _id: string
    headline: string
    slug: { current: string }
    category: string
    excerpt?: string
    featuredImage?: any
    videoUrl?: string
    videoDuration?: string
    publishedAt: string
    author?: { name: string }
  }
  size?: 'sm' | 'md' | 'lg'
}

export default function VideoCard({ article, size = 'md' }: VideoCardProps) {
  const thumb =
    (article.videoUrl && getVideoThumbnail(article.videoUrl)) ||
    (article.featuredImage?.asset && urlForImage(article.featuredImage).width(640).height(360).url()) ||
    null

  const aspect = size === 'lg' ? 'aspect-video' : size === 'sm' ? 'aspect-video' : 'aspect-video'

  return (
    <Link href={`/${article.category}/${article.slug.current}`} className="group block">
      <div className={`relative ${aspect} rounded-lg overflow-hidden bg-black mb-3`}>
        {thumb ? (
          <Image
            src={thumb}
            alt={article.headline}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-brand-100 flex items-center justify-center">
            <span className="text-brand-800 font-bold text-2xl">NURR</span>
          </div>
        )}
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
            <svg className="w-6 h-6 text-brand-700 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {/* Duration badge (optional — you'd store this in Sanity) */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
          {article.videoDuration || 'VIDEO'}
        </div>
      </div>

      <h3 className={`font-bold text-text-primary group-hover:text-brand-700 transition-colors leading-snug ${
        size === 'lg' ? 'text-xl md:text-2xl' : size === 'sm' ? 'text-sm' : 'text-base'
      }`}>
        {article.headline}
      </h3>

      {size !== 'sm' && article.excerpt && (
        <p className="text-text-secondary text-sm mt-1 line-clamp-2">{article.excerpt}</p>
      )}

      <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
        <span className="uppercase tracking-wider">{article.category}</span>
        <span>·</span>
        <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
        {article.author && (
          <>
            <span>·</span>
            <span>{article.author.name}</span>
          </>
        )}
      </div>
    </Link>
  )
}