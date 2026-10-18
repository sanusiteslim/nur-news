/** @type {import('next').NextConfig} */

// Baseline security headers. Deliberately no Content-Security-Policy: AdSense
// and Google Analytics load scripts from many rotating hosts, and a strict
// CSP would silently break ads (revenue). Add one later if needed.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig = {
  images: {
    // Sanity's CDN resizes for free; see src/lib/imageLoader.ts. This keeps
    // images out of Vercel's (quota-limited) image optimiser.
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Admin screens must never be framed or indexed.
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
    ]
  },
}

module.exports = nextConfig
