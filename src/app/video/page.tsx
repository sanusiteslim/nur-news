import { client, videoArticlesQuery, latestVideoQuery } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import VideoCard from '@/components/video/VideoCard'
import { getEmbedUrl, getYouTubeID } from '@/lib/video'
import { urlForImage } from '@/lib/image'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video | NUR Report',
  description: 'Watch the latest news videos, interviews, and reports from NUR Report.',
}

export const revalidate = 10

export default async function VideoPage() {
  const [latest, videos] = await Promise.all([
    client.fetch(latestVideoQuery),
    client.fetch(videoArticlesQuery),
  ])

  if (!videos || videos.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Video</h1>
        <p className="text-text-secondary">No videos available yet.</p>
      </div>
    )
  }

  const rest = latest ? videos.filter((v: any) => v._id !== latest._id) : videos

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary">Video</h1>
        <p className="text-text-secondary mt-2">Latest news reports, interviews, and analysis.</p>
      </div>

      {/* Hero: Latest Video */}
      {latest && (
        <section className="mb-12">
          <Link href={`/${latest.category}/${latest.slug.current}`} className="group block">
            <div className="grid md:grid-cols-2 gap-6 items-center bg-surface-card rounded-xl overflow-hidden">
              {/* Thumbnail */}
              <div className="relative aspect-video md:aspect-[16/10] overflow-hidden">
                <Image
                  src={
                    (latest.videoUrl && `https://img.youtube.com/vi/${getYouTubeID(latest.videoUrl)}/maxresdefault.jpg`) ||
                    (latest.featuredImage && urlForImage(latest.featuredImage).width(1280).height(720).url()) ||
                    '/placeholder-video.jpg'
                  }
                  alt={latest.headline}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-brand-700 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-6 md:p-8">
                <span className="text-brand-700 text-sm font-semibold uppercase tracking-wider">Latest</span>
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-2 mb-3 leading-tight group-hover:text-brand-700 transition-colors">
                  {latest.headline}
                </h2>
                {latest.excerpt && (
                  <p className="text-text-secondary text-lg mb-4 line-clamp-3">{latest.excerpt}</p>
                )}
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <span>{latest.author?.name}</span>
                  <span>·</span>
                  <span>VIDEO</span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Video Grid */}
      <section>
        <h2 className="text-xl font-bold text-text-primary mb-6">More Videos</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((article: any) => (
            <VideoCard key={article._id} article={article} />
          ))}
        </div>
      </section>
    </main>
  )
}