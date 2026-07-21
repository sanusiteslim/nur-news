import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '@/lib/image'
import { formatDistanceToNow } from 'date-fns'

export default function SectionHighlight({ data }: { data: any }) {
  if (!data) return null
  const { title, featured, list } = data

  return (
    <section>
      <h2 className="section-title mb-4">{title || 'Latest'}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {featured && (
          <div className="lg:col-span-7">
            <Link href={`/${featured.category}/${featured.slug.current}`} className="group block">
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-3">
                {featured.featuredImage ? (
                  <Image src={urlForImage(featured.featuredImage).width(800).height(450).url()} alt={featured.featuredImage.alt || featured.headline} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-brand-100" />
                )}
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">{featured.category}</span>
              <h3 className="text-xl font-bold text-text-primary mt-1 group-hover:text-brand-700 transition-colors">{featured.headline}</h3>
              <p className="text-text-secondary mt-2 line-clamp-2">{featured.excerpt}</p>
            </Link>
          </div>
        )}

        {list && list.length > 0 && (
          <div className="lg:col-span-5 space-y-4">
            {list.map((item: any, i: number) => (
              <Link key={item?.slug?.current || i} href={`/${item.category}/${item.slug.current}`} className="group block">
                <div className="flex gap-3">
                  {item.featuredImage && (
                    <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden">
                      <Image src={urlForImage(item.featuredImage).width(96).height(64).url()} alt={item.headline} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-text-primary group-hover:text-brand-700 transition-colors line-clamp-2">{item.headline}</h4>
                    <p className="text-xs text-text-muted mt-1">{item.publishedAt ? formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true }) : 'Recently'}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}