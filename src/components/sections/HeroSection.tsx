import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '@/lib/image'
import { formatDistanceToNow } from 'date-fns'

export default function HeroSection({ heroStory, sidebarStories }: any) {
  if (!heroStory) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8">
        <Link href={`/${heroStory.category}/${heroStory.slug.current}`} className="group block">
          <div className="relative -mx-4 sm:mx-0 aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] rounded-none sm:rounded-lg overflow-hidden">
            {heroStory.featuredImage?.asset ? (
              <Image src={urlForImage(heroStory.featuredImage).width(1200).height(675).url()} alt={heroStory.featuredImage.alt || heroStory.headline} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover transition-transform duration-500 group-hover:scale-105" priority />
            ) : (
              <div className="w-full h-full bg-brand-100 flex items-center justify-center">
                <span className="text-brand-800 font-bold text-4xl">NUR</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
              <span className="text-brand-500 text-sm md:text-sm font-semibold uppercase tracking-wider [text-shadow:0_1px_4px_rgb(0_0_0_/_60%)]">{heroStory.category}</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 leading-tight group-hover:underline decoration-2 underline-offset-4 [text-shadow:0_2px_8px_rgb(0_0_0_/_60%)]">{heroStory.headline}</h2>
              <p className="text-white/85 mt-2 line-clamp-2 hidden md:block text-sm md:text-base [text-shadow:0_1px_4px_rgb(0_0_0_/_60%)]">{heroStory.excerpt}</p>
            </div>
          </div>
        </Link>
      </div>

      {sidebarStories && sidebarStories.length > 0 && (
        <div className="lg:col-span-4 space-y-4">
          {sidebarStories.map((item: any, i: number) => (
            <SidebarCard key={item?.story?.slug?.current || i} story={item?.story} label={item?.label} />
          ))}
        </div>
      )}
    </div>
  )
}

function SidebarCard({ story, label }: { story: any; label?: string }) {
  if (!story) return null

  return (
    <div className="border-l-4 border-brand-700 pl-4 py-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-1">{label || 'Latest'}</p>
      <Link href={`/${story.category}/${story.slug.current}`} className="group">
        <div className="flex gap-3">
          {story.featuredImage?.asset && (
            <div className="relative w-20 h-14 flex-shrink-0 rounded overflow-hidden">
              <Image src={urlForImage(story.featuredImage).width(80).height(56).url()} alt={story.headline} fill sizes="80px" className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-primary leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">{story.headline}</h3>
            <p className="text-xs text-text-muted mt-1">{story.publishedAt ? formatDistanceToNow(new Date(story.publishedAt), { addSuffix: true }) : 'Recently'}</p>
          </div>
        </div>
      </Link>
    </div>
  )
}