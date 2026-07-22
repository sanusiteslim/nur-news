import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | NUR Report',
  description: 'Get in touch with the NUR Report team.',
}

// TODO: replace the placeholder email below with your real contact address
const CONTACT_EMAIL = 'teslimsanusi123@gmail.com'

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-brand-800 mb-4">Contact</h1>
      <div className="prose prose-lg max-w-none prose-p:text-text-primary space-y-4">
        <p>Have a tip, correction, or question for the NUR Report team? Reach out directly:</p>
        <p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-700 font-semibold">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="text-sm text-text-muted">
          For advertising inquiries, visit our <a href="/advertise" className="text-brand-700">Advertise page</a> instead.
        </p>
      </div>
    </div>
  )
}