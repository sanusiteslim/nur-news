import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '@/lib/image'
import { formatPublishedDate } from '@/lib/formatDate'
import QuoteBadge from '@/components/ui/QuoteBadge'

function ByLine({ article }: { article: any }) {
  return (
    <div className="mt-3 text-sm text-text-muted">
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
  )
}

export default function OpinionHero({ featured, gridItems }: { featured: any; gridItems: any[] }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 pb-10 border-b border-gray-200">
      {/* Featured piece */}
      <Link href={`/${featured.category}/${featured.slug.current}`} className="group block">
        <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4">
          {featured.featuredImage?.asset ? (
            <Image
              src={urlForImage(featured.featuredImage).width(1000).height(625).url()}
              alt={featured.featuredImage.alt || featured.headline}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
          ) : (
            <div className="w-full h-full bg-brand-100 flex items-center justify-center">
              <span className="text-brand-800 font-bold text-3xl">NURR</span>
            </div>
          )}
          <QuoteBadge />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Opinion</span>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mt-2 leading-tight group-hover:text-brand-700 transition-colors">
          {featured.headline}
        </h1>
        <p className="text-text-secondary mt-3 leading-relaxed">{featured.excerpt}</p>
        <ByLine article={featured} />
      </Link>

      {/* 2x4 grid of the next 8 pieces */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 content-start">
        {gridItems.map((item) => (
          <Link key={item.slug.current} href={`/${item.category}/${item.slug.current}`} className="group block">
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-2">
              {item.featuredImage?.asset ? (
                <Image
                  src={urlForImage(item.featuredImage).width(320).height(200).url()}
                  alt={item.featuredImage.alt || item.headline}
                  fill
                  sizes="(max-width: 640px) 100vw, 240px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-brand-100 flex items-center justify-center">
                  <span className="text-brand-800 font-bold text-xs">NUR</span>
                </div>
              )}
              <QuoteBadge />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">Opinion</span>
            <h3 className="text-sm font-semibold text-text-primary mt-1 leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
              {item.headline}
            </h3>
            <p className="text-xs text-text-muted mt-1">{formatPublishedDate(item.publishedAt)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
