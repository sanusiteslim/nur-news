import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | NUR Report',
  description: 'Terms of Service for NUR Report.',
}

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-brand-800 mb-2">Terms of Service</h1>
      <p className="text-sm text-text-muted mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="prose prose-lg max-w-none prose-headings:text-text-primary prose-p:text-text-primary prose-a:text-brand-700 space-y-6">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using NUR Report ("the Site"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Site.</p>
        </section>

        <section>
          <h2>2. Use of the Site</h2>
          <p>You agree to use the Site only for lawful purposes. You may not use the Site in any way that could damage, disable, or impair it, or interfere with any other party's use of the Site.</p>
        </section>

        <section>
          <h2>3. Content and Intellectual Property</h2>
          <p>All articles, images, graphics, and other content published on the Site are the property of NUR Report or its licensors and are protected by applicable copyright laws. You may share links to our content but may not reproduce, republish, or redistribute our content without prior written permission.</p>
        </section>

        <section>
          <h2>4. Accuracy of Content</h2>
          <p>We strive for accuracy in our reporting. If you believe an article contains an error, please contact us so we can review and correct it where appropriate.</p>
        </section>

        <section>
          <h2>5. Limitation of Liability</h2>
          <p>NUR Report is not liable for any damages arising from your use of, or inability to use, the Site or its content.</p>
        </section>

        <section>
          <h2>6. Changes to These Terms</h2>
          <p>We may update these Terms from time to time. Continued use of the Site after changes are posted constitutes acceptance of the revised Terms.</p>
        </section>

        <section>
          <h2>7. Contact</h2>
          <p>Questions about these Terms can be sent via our <a href="/contact">Contact page</a>.</p>
        </section>
      </div>
    </div>
  )
}