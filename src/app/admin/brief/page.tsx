import Link from 'next/link'

export default function AdminBriefPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">
        NUR Report Brief
      </h1>

      <p className="mt-3 text-gray-600">
        Briefs are authored in Sanity Studio.
      </p>

      <div className="mt-8 rounded-xl border p-6">
        <h2 className="font-bold">
          Workflow
        </h2>

        <ol className="mt-4 list-decimal space-y-2 pl-5 text-gray-700">
          <li>Create a new NUR Report Brief in Sanity.</li>
          <li>Select the lead story.</li>
          <li>Add stories to each section.</li>
          <li>Set status to Published.</li>
          <li>The Brief becomes available publicly.</li>
          <li>Use Distribution to publish it to Telegram.</li>
        </ol>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/admin"
          className="rounded-lg border px-4 py-2"
        >
          Back
        </Link>

        <a
          href="/studio"
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          Open Studio
        </a>
      </div>
    </main>
  )
}