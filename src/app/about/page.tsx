import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | NUR Report',
  description: 'About NUR Report.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-brand-800 mb-4">About NUR Report</h1>
      <div className="prose prose-lg max-w-none prose-p:text-text-primary space-y-4">
        <p>NUR Report is an independent news publication covering Nigeria, Africa, and the world — breaking news, sports, opinion, and analysis reported with accuracy and context.</p>
        <p>Our newsroom is committed to fair, fact-checked reporting that puts readers first, covering the stories that matter across politics, business, sports, and culture.</p>
        <p>Have a story tip, correction, or question? Reach out via our <a href="/contact" className="text-brand-700">Contact page</a>.</p>
      </div>
    </div>
  )
}