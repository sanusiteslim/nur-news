import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Advertise | NUR Report',
  description: 'Advertise with NUR Report.',
}

// TODO: replace the placeholder email below with your real advertising contact address
const ADVERTISE_EMAIL = 'teslimsanusi123@gmail.com'

export default function AdvertisePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-brand-800 mb-4">Advertise With Us</h1>
      <div className="prose prose-lg max-w-none prose-p:text-text-primary space-y-4">
        <p>NUR Report covers Nigeria, Africa, and world news, sports, and opinion for a growing, engaged readership.</p>
        <p>If you're interested in advertising or sponsorship opportunities, get in touch:</p>
        <p>
          <a href={`mailto:${ADVERTISE_EMAIL}`} className="text-brand-700 font-semibold">
            {ADVERTISE_EMAIL}
          </a>
        </p>
      </div>
    </div>
  )
}