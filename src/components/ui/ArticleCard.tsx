import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '@/lib/image'
import { formatDistanceToNow } from 'date-fns'
import SectionHighlight from '@/components/sections/SectionHighlight'

export default function ArticleCard({ article }: { article: any }) {
  if (!article) return null

  return (
    <Link href={`/${article.category}/${article.slug.current}`} className="group block">
      <article className="bg-surface-card rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div className="relative aspect-[16/9] overflow-hidden">
          {article.featuredImage ? (
            <Image src={urlForImage(article.featuredImage).width(600).height(338).url()} alt={article.featuredImage.alt || article.headline} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-brand-100 flex items-center justify-center">
              <span className="text-brand-800 font-bold text-2xl">NURR</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">{article.category}</span>
          <h3 className="text-lg font-semibold text-text-primary mt-2 leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">{article.headline}</h3>
          <p className="text-sm text-text-secondary mt-2 line-clamp-2">{article.excerpt}</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
            <span>{article.author?.name || 'NUR Staff'}</span>
            <span>•</span>
            <span>{article.publishedAt ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true }) : 'Recently'}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}