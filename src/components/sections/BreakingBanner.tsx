'use client'

import Link from 'next/link'
import { urlForImage } from '@/lib/image'
import Image from 'next/image'

export default function BreakingBanner({ article }: { article: any }) {
  if (!article) return null

  return (
    <div className="bg-accent-red">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
               <div className="flex-shrink-0">
            <span className="inline-block bg-white text-accent-red text-xs font-bold uppercase tracking-widest px-3 py-1 rounded">
              Breaking
            </span>
          </div>
          {article.featuredImage && (
            <div className="hidden md:block w-32 h-20 relative rounded overflow-hidden flex-shrink-0">
              <Image src={urlForImage(article.featuredImage).width(128).height(80).url()} alt={article.headline} fill className="object-cover" />
            </div>
          )}
          <Link href={`/${article.category}/${article.slug.current}`} className="group flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-white group-hover:underline decoration-2 underline-offset-4">
              {article.headline}
            </h2>
          </Link>
          
        </div>
      </div>
    </div>
  )
}