import Link from 'next/link'

export const metadata = { title: 'Newsletter', robots: { index: false, follow: false } }

const MESSAGES: Record<string, { title: string; body: string }> = {
  confirmed: { title: "You're subscribed", body: 'Thanks for confirming. The NUR Report Brief will land in your inbox.' },
  unsubscribed: { title: "You've been unsubscribed", body: "You won't receive the NUR Report Brief any more." },
  invalid: { title: 'That link is not valid', body: 'It may be incomplete or damaged. Try signing up again from the website.' },
}

export default async function NewsletterStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }> | { s?: string }
}) {
  const { s } = await searchParams
  const m = MESSAGES[s ?? ''] ?? MESSAGES.invalid
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">{m.title}</h1>
      <p className="mt-4 text-gray-600">{m.body}</p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white">
        Back to NUR Report
      </Link>
    </main>
  )
}
