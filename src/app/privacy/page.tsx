import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | NUR Report',
  description: 'Privacy Policy for NUR Report.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-brand-800 mb-2">Privacy Policy</h1>
      <p className="text-sm text-text-muted mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="prose prose-lg max-w-none prose-headings:text-text-primary prose-p:text-text-primary prose-a:text-brand-700 space-y-6">
        <section>
          <h2>1. Information We Collect</h2>
          <p>We may collect basic technical information when you visit the Site, such as your browser type, device information, and pages viewed, in order to understand how the Site is used and to improve it.</p>
        </section>

        <section>
          <h2>2. Cookies</h2>
          <p>The Site may use cookies or similar technologies to remember preferences and analyze traffic. You can disable cookies through your browser settings, though some features of the Site may not function as intended.</p>
        </section>

        <section>
          <h2>3. Third-Party Services</h2>
          <p>We may use third-party services (such as analytics or advertising providers) that collect information according to their own privacy policies. We encourage you to review those policies separately.</p>
        </section>

        <section>
          <h2>4. How We Use Information</h2>
          <p>Information collected is used to operate, maintain, and improve the Site, and is not sold to third parties.</p>
        </section>

        <section>
          <h2>5. Your Rights</h2>
          <p>Depending on your location, you may have rights to access, correct, or request deletion of information we hold about you. Contact us to make such a request.</p>
        </section>

        <section>
          <h2>6. Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date.</p>
        </section>

        <section>
          <h2>7. Contact</h2>
          <p>Questions about this Privacy Policy can be sent via our <a href="/contact">Contact page</a>.</p>
        </section>
      </div>

      <p className="mt-10 text-sm text-text-muted italic">
        Note: this is placeholder template content and has not been reviewed by a lawyer. Please have it reviewed by legal counsel — particularly before running ads or collecting any user data — so it accurately reflects your actual data practices and complies with applicable law (e.g. Nigeria's NDPR).
      </p>
    </div>
  )
}