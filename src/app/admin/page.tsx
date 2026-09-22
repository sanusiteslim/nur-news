import Link from 'next/link'

export const dynamic = 'force-dynamic'

const items = [
  {
    title: 'Tips',
    description: 'Review and triage submitted news tips.',
    href: '/admin/tips',
  },
  {
    title: 'Brief',
    description: 'Create and manage the NUR Report Brief.',
    href: '/admin/brief',
  },
  {
    title: 'Distribution',
    description: 'Prepare WhatsApp posts and publish to Telegram.',
    href: '/admin/distribution',
  },
]

export default function AdminDashboard() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          NUR Report
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Newsroom
        </h1>

        <p className="mt-3 text-gray-600">
          Editorial control centre.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <h2 className="text-xl font-bold">
              {item.title}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {item.description}
            </p>

            <span className="mt-5 inline-block text-sm font-semibold">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}