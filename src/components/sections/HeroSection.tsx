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
          <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
            {heroStory.featuredImage ? (
              <Image src={urlForImage(heroStory.featuredImage).width(1200).height(675).url()} alt={heroStory.featuredImage.alt || heroStory.headline} fill className="object-cover transition-transform duration-500 group-hover:scale-105" priority />
            ) : (
              <div className="w-full h-full bg-brand-100 flex items-center justify-center">
                <span className="text-brand-800 font-bold text-4xl">NUR</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <span className="text-brand-500 text-xs md:text-sm font-semibold uppercase tracking-wider">{heroStory.category}</span>
              <h2 className="text-xl md:text-3xl font-bold text-white mt-2 leading-tight group-hover:underline decoration-2 underline-offset-4">{heroStory.headline}</h2>
              <p className="text-white/80 mt-2 line-clamp-2 hidden md:block text-sm md:text-base">{heroStory.excerpt}</p>
            </div>
          </div>
        </Link>
      </div>

      {sidebarStories && sidebarStories.length > 0 && (
        <div className="lg:col-span-4 space-y-4">
          {sidebarStories.map((story: any, i: number) => (
            <SidebarCard key={story?.slug?.current || i} story={story} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function SidebarCard({ story, index }: { story: any; index: number }) {
  if (!story) return null
  const sections = ['World Cup 2026', 'Must Read', 'Trending', 'Latest', 'Top Story']
  const sectionTitle = sections[index] || 'Latest'

  return (
    <div className="border-l-4 border-brand-700 pl-4 py-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-1">{sectionTitle}</p>
      <Link href={`/${story.category}/${story.slug.current}`} className="group">
        <div className="flex gap-3">
          {story.featuredImage && (
            <div className="relative w-20 h-14 flex-shrink-0 rounded overflow-hidden">
              <Image src={urlForImage(story.featuredImage).width(80).height(56).url()} alt={story.headline} fill className="object-cover" />
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