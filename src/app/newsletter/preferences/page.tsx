import { getSubscriberForPreferences, NEWSLETTER_LISTS } from '@/lib/newsletter'
import PreferencesForm from './PreferencesForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Newsletter preferences', robots: { index: false, follow: false } }

export default async function PreferencesPage({
  searchParams,
}: {
  searchParams: { email?: string; token?: string }
}) {
  const email = searchParams.email ?? ''
  const token = searchParams.token ?? ''
  const subscriber = email && token ? await getSubscriberForPreferences(email, token) : null

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="w-10 h-1 bg-brand-700 rounded-full mb-4" />
      <h1 className="text-3xl font-bold text-text-primary">Your newsletters</h1>

      {subscriber ? (
        <>
          <p className="mt-3 text-text-secondary">
            Choose what we send to <span className="font-semibold text-text-primary">{subscriber.email}</span>.
          </p>
          <PreferencesForm
            email={email}
            token={token}
            initialLists={subscriber.lists}
            lists={NEWSLETTER_LISTS.map((l) => ({ id: l.id, name: l.name, cadence: l.cadence, description: l.description }))}
          />
        </>
      ) : (
        <p className="mt-4 text-text-secondary">
          This link is incomplete or has expired. Use the &ldquo;Manage newsletters&rdquo; link at the bottom of any
          email from us.
        </p>
      )}
    </div>
  )
}
