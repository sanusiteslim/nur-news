import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | NUR Report',
  description: 'Cookie Policy for NUR Report.',
}

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-brand-800 mb-2">Cookie Policy</h1>
      <p className="text-sm text-text-muted mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="prose prose-lg max-w-none prose-headings:text-text-primary prose-p:text-text-primary prose-a:text-brand-700 space-y-6">
        <section>
          <h2>1. What Are Cookies</h2>
          <p>Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences and understand how it's being used.</p>
        </section>

        <section>
          <h2>2. How We Use Cookies</h2>
          <p>We may use cookies for essential site functionality, to remember basic preferences, and for analytics to understand traffic and improve the Site. We do not currently use cookies to sell your personal data.</p>
        </section>

        <section>
          <h2>3. Third-Party Cookies</h2>
          <p>If we use third-party services such as analytics or advertising providers, those services may set their own cookies subject to their own policies. We encourage you to review those separately.</p>
        </section>

        <section>
          <h2>4. Managing Cookies</h2>
          <p>Most browsers let you control or disable cookies through their settings. Disabling cookies may affect some functionality of the Site.</p>
        </section>

        <section>
          <h2>5. Changes to This Policy</h2>
          <p>We may update this Cookie Policy periodically. Changes will be posted on this page with an updated revision date.</p>
        </section>

        <section>
          <h2>6. Contact</h2>
          <p>Questions about this Cookie Policy can be sent via our <a href="/contact">Contact page</a>.</p>
        </section>
      </div>
    </div>
  )
}