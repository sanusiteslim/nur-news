import Link from 'next/link'
import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity'
import { briefBySlugQuery } from '@/lib/sanity'

export const revalidate = 300

type Props = {
  params: Promise<{
    slug: string
  }>
}

function StoryList({
  title,
  stories,
}: {
  title: string
  stories: any[]
}) {
  if (!stories?.length) return null

  return (
    <section className="mt-10">
      <h2 className="border-b pb-3 text-2xl font-bold">
        {title}
      </h2>

      <div className="divide-y">
        {stories.map((story) => (
          <article key={story._id || story.slug?.current} className="py-5">
            <Link
              href={`/${story.category}/${story.slug.current}`}
              className="text-xl font-semibold hover:underline"
            >
              {story.headline}
            </Link>

            {story.excerpt && (
              <p className="mt-2 text-gray-600">
                {story.excerpt}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

export default async function BriefPage({ params }: Props) {
  const { slug } = await params

  const brief = await client.fetch(briefBySlugQuery, { slug })

  if (!brief) notFound()

  const date = new Date(brief.date)

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="border-b pb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          NUR Report Brief
        </p>

        <h1 className="mt-3 text-4xl font-bold md:text-5xl">
          {brief.title}
        </h1>

        <p className="mt-3 text-gray-500">
          {date.toLocaleDateString('en-NG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        {brief.intro && (
          <p className="mt-6 text-lg leading-8 text-gray-700">
            {brief.intro}
          </p>
        )}
      </header>

      {brief.leadStory && (
        <section className="mt-10 rounded-2xl bg-gray-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Lead story
          </p>

          <Link
            href={`/${brief.leadStory.category}/${brief.leadStory.slug.current}`}
            className="mt-2 block text-3xl font-bold hover:underline"
          >
            {brief.leadStory.headline}
          </Link>

          {brief.leadStory.excerpt && (
            <p className="mt-3 text-lg text-gray-700">
              {brief.leadStory.excerpt}
            </p>
          )}
        </section>
      )}

      <StoryList title="Nigeria" stories={brief.nigeria} />
      <StoryList title="Business" stories={brief.business} />
      <StoryList title="Tech" stories={brief.tech} />
      <StoryList title="Sports" stories={brief.sports} />
      <StoryList title="World" stories={brief.world} />

      {brief.closing && (
        <footer className="mt-12 border-t pt-8 text-gray-700">
          {brief.closing}
        </footer>
      )}
    </main>
  )
}