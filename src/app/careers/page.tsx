import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers | NUR Report',
  description: 'Join the NUR Report team.',
}

export default function CareersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-brand-800 mb-4">Careers</h1>
      <div className="prose prose-lg max-w-none prose-p:text-text-primary space-y-4">
        <p>NUR Report is growing, and we're always interested in hearing from writers, editors, and contributors who care about independent journalism across Nigeria, Africa, and the world.</p>
        <p>We don't have any specific openings listed right now, but if you'd like to be considered for future roles, send us a note via our <a href="/contact" className="text-brand-700">Contact page</a> with a short introduction and any relevant work samples.</p>
      </div>
    </div>
  )
}