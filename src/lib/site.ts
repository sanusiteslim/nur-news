export function getSiteUrl() {
  // Falls back to localhost in dev if NEXT_PUBLIC_SITE_URL isn't set yet.
  // Set this in .env.local / Vercel env vars once you have a domain.
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
}