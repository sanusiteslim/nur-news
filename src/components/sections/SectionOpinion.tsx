import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '@/lib/image'
import QuoteBadge from '@/components/ui/QuoteBadge'

export default function SectionOpinion({ data }: { data: any }) {
  if (!data) return null

  const { title, count, articles: allArticles } = data
  const articles = (allArticles || []).slice(0, count || 5)

  if (!articles.length) {
    return (
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-8 bg-brand-700 rounded-full" />
          <h2 className="text-2xl font-bold text-text-primary">{title || 'Opinion'}</h2>
        </div>
        <div className="text-center py-12 text-text-muted bg-surface-offwhite rounded-lg">
          <p className="text-sm">No opinion pieces yet. Add some in Sanity CMS.</p>
        </div>
      </section>
    )
  }

  const [featured, ...list] = articles

  return (
    <section>
      {/* Section header — thick green bar + title + view-all */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-brand-700 rounded-full" />
          <h2 className="text-2xl font-bold text-text-primary">{title || 'Opinion'}</h2>
        </div>
        <Link
          href="/opinion"
          className="text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline underline-offset-2 transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Featured opinion (left) ── */}
        {featured && (
          <Link
            href={`/${featured.category}/${featured.slug.current}`}
            className="group block"
          >
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4">
              {featured.featuredImage?.asset ? (
                <Image
                  src={urlForImage(featured.featuredImage)
                    .width(800)
                    .height(500)
                    .url()}
                  alt={featured.featuredImage.alt || featured.headline}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-brand-100 flex items-center justify-center">
                  <span className="text-brand-800 font-bold text-2xl">NURR</span>
                </div>
              )}
              <QuoteBadge />
            </div>

            <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-700 mb-2">
              Opinion
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-text-primary leading-snug group-hover:text-brand-700 transition-colors">
              {featured.headline}
            </h3>
            <p className="text-text-secondary mt-2 line-clamp-3 text-sm md:text-base leading-relaxed">
              {featured.excerpt}
            </p>
          </Link>
        )}

        {/* ── Opinion list (right) ── */}
        {list.length > 0 && (
          <div className="flex flex-col gap-5">
            {list.map((article: any) => (
              <Link
                key={article.slug.current}
                href={`/${article.category}/${article.slug.current}`}
                className="group block"
              >
                <div className="flex gap-4">
                  {/* Thumbnail with quote badge */}
                  <div className="relative w-28 h-20 md:w-32 md:h-22 flex-shrink-0 rounded-lg overflow-hidden">
                    {article.featuredImage?.asset ? (
                      <Image
                        src={urlForImage(article.featuredImage)
                          .width(256)
                          .height(180)
                          .url()}
                        alt={article.featuredImage.alt || article.headline}
                        fill
                        sizes="(max-width: 768px) 112px, 128px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-100 flex items-center justify-center">
                        <span className="text-brand-800 font-bold text-xs">NUR</span>
                      </div>
                    )}
                    <QuoteBadge />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-700 mb-1">
                      Opinion
                    </span>
                    <h4 className="text-base font-semibold text-text-primary leading-snug group-hover:text-brand-700 transition-colors line-clamp-3">
                      {article.headline}
                    </h4>
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