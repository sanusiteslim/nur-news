import { client, activeAuthorsQuery } from '@/lib/sanity'
import { urlForImage } from '@/lib/image'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Our Journalists',
  description:
    'The reporters, editors and contributors behind NUR Report’s coverage of Nigeria, Africa and the world.',
  alternates: { canonical: '/author' },
}

export default async function AuthorsIndexPage() {
  // Only authors with at least one published story — an index full of empty
  // profiles reads as padding and gives crawlers nothing to chew on.
  const authors = await client.fetch(activeAuthorsQuery)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">Our Journalists</h1>
      <p className="text-text-secondary mb-10 max-w-2xl">
        The people behind our reporting. Every story we publish carries a named byline.
      </p>

      {(!authors || authors.length === 0) ? (
        <p className="text-text-secondary">No author profiles published yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {authors.map((author: any) => (
            <Link
              key={author.slug.current}
              href={`/author/${author.slug.current}`}
              className="group flex gap-4 items-start"
            >
              {author.photo ? (
                <Image
                  src={urlForImage(author.photo).width(120).height(120).url()}
                  alt={author.name}
                  width={64}
                  height={64}
                  className="rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-800 font-bold text-lg">
                    {author.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-bold text-text-primary group-hover:text-brand-700 transition-colors">
                  {author.name}
                </h2>
                {author.role && <p className="text-sm text-brand-700">{author.role}</p>}
                {author.bio && (
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{author.bio}</p>
                )}
                <p className="text-xs text-text-muted mt-1">
                  {author.articleCount} {author.articleCount === 1 ? 'story' : 'stories'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
