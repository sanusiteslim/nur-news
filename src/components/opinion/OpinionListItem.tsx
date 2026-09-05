import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '@/lib/image'
import { formatPublishedDate } from '@/lib/formatDate'
import QuoteBadge from '@/components/ui/QuoteBadge'

export default function OpinionListItem({ article }: { article: any }) {
  return (
    <article className="py-6 border-b border-gray-200 first:pt-0">
      <Link href={`/${article.category}/${article.slug.current}`} className="group flex gap-5 sm:gap-6 items-start">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Opinion</span>
          <h3 className="text-lg sm:text-xl font-bold text-text-primary mt-1.5 leading-snug group-hover:text-brand-700 transition-colors">
            {article.headline}
          </h3>
          <p className="text-text-secondary mt-2 leading-relaxed line-clamp-2 hidden sm:block">{article.excerpt}</p>
        </div>

        <div className="relative w-28 h-20 sm:w-40 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden">
          {article.featuredImage?.asset ? (
            <Image
              src={urlForImage(article.featuredImage).width(320).height(224).url()}
              alt={article.featuredImage.alt || article.headline}
              fill
              sizes="(max-width: 640px) 112px, 160px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-brand-100 flex items-center justify-center">
              <span className="text-brand-800 font-bold text-xs">NUR</span>
            </div>
          )}
          <QuoteBadge />
        </div>
      </Link>

      <div className="mt-4 text-sm text-text-muted">
        <p>{formatPublishedDate(article.publishedAt)}</p>
        {article.author?.name && (
          <div className="flex items-center gap-2 mt-1">
            {article.author.photo && (
              <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={urlForImage(article.author.photo).width(48).height(48).url()}
                  alt={article.author.name}
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </div>
            )}
            <span className="text-text-primary font-medium">{article.author.name}</span>
          </div>
        )}
      </div>
    </article>
  )
}
