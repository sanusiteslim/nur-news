import UnsubscribeForm from './UnsubscribeForm'

export const metadata = { title: 'Unsubscribe', robots: { index: false, follow: false } }

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }> | { email?: string; token?: string }
}) {
  const { email = '', token = '' } = await searchParams
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Unsubscribe</h1>
      {email && token ? (
        <>
          <p className="mt-4 text-gray-600">Stop sending the NUR Report Brief to {email}?</p>
          <UnsubscribeForm email={email} token={token} />
        </>
      ) : (
        <p className="mt-4 text-gray-600">This unsubscribe link is incomplete. Use the link in the email you received.</p>
      )}
    </main>
  )
}
