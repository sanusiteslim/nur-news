import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export const metadata = {
  title: "You're Offline",
  robots: { index: false, follow: false },
}

// Served by the service worker (see public/sw.js) whenever a page navigation
// fails because the device has no connection. Precached at install time so
// it's available even on the very first offline visit.
export default function OfflinePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-7 h-7 text-brand-700" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">You&apos;re offline</h1>
        <p className="text-text-secondary leading-relaxed">
          We can&apos;t reach NUR Report right now. Check your connection and try again — pages you&apos;ve already visited may still be available.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-5 py-2.5 bg-brand-700 text-white text-sm font-medium rounded-full hover:bg-brand-800 transition-colors"
        >
          Try Home
        </Link>
      </div>
    </div>
  )
}
