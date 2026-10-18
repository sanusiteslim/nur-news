import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editorial Standards',
  description: 'How NUR Report reports, verifies, corrects and separates news from opinion.',
  alternates: { canonical: '/editorial-standards' },
}

// DRAFT COPY — review and edit so it describes how NUR Report actually works
// before relying on it. Google News and readers both read this page.
export default function EditorialStandardsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-10 h-1 bg-brand-700 rounded-full mb-4" />
      <h1 className="text-3xl md:text-4xl font-bold text-brand-800 mb-6">Editorial Standards</h1>

      <div className="space-y-8 text-lg leading-relaxed text-text-primary">
        <section>
          <h2 className="text-xl font-bold mb-2">Accuracy</h2>
          <p>
            We report what we can verify. Facts are checked against primary documents, named sources or our own
            reporting before publication. When we can&apos;t confirm something, we say so plainly, or we don&apos;t
            publish it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Sources</h2>
          <p>
            We name our sources wherever possible. We grant anonymity only when a source faces real risk and the
            information is important and can&apos;t be obtained another way, and we tell readers why. Where a story
            relies on documents or data, we list them at the end of the article.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">News and opinion</h2>
          <p>
            News reporting and opinion are kept separate. Opinion pieces sit in our{' '}
            <Link href="/opinion" className="text-brand-700 underline underline-offset-2">Opinion</Link> section and
            carry a note that the views are the writer&apos;s own. Opinion writers are held to the same standard of
            factual accuracy as reporters.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Corrections</h2>
          <p>
            When we get something wrong, we fix it promptly and say what changed. Corrections appear at the top of the
            story and on our <Link href="/corrections" className="text-brand-700 underline underline-offset-2">corrections page</Link>.
            To report an error, use our <Link href="/contact" className="text-brand-700 underline underline-offset-2">contact page</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Independence</h2>
          <p>
            Advertisers and sponsors have no say over what we cover or how. Paid content, if we run any, is labelled
            clearly as such.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Tips</h2>
          <p>
            Readers are some of our best sources. If you know something we should look into,{' '}
            <Link href="/tip" className="text-brand-700 underline underline-offset-2">send us a tip</Link>.
          </p>
        </section>
      </div>
    </div>
  )
}
