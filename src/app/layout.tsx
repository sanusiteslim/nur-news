import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import ElectionTicker from '@/components/election/ElectionTicker'
import Footer from '@/components/layout/Footer'
import NotificationPrompt from '@/components/NotificationPrompt'
import { getSiteUrl } from '@/lib/site'
import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script'


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const siteDescription = 'Independent news coverage of Nigeria, Africa, and the world. Breaking news, sports, opinion, and analysis.'


export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'NUR Report',
    template: '%s | NUR Report',
  },
  verification: {
    google: "J_jRy_4vHvjTX-mMnvVRbbOeEj_hkijiayhAA-5DAHs", // Paste just the long code string here
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
  capable: true,
  statusBarStyle: 'default',
  title: 'NURR',
},
formatDetection: {
  telephone: false,
},

  description: siteDescription,
  alternates: {
    types: {
      'application/rss+xml': [{ url: '/rss.xml', title: 'NUR Report RSS Feed' }],
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'NUR Report',
    title: 'NUR Report',
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NUR Report',
    description: siteDescription,
  },
}
export const viewport: Viewport = {
  themeColor: '#1B5E20',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
   const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
   const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-text-primary">
        {/* Your sticky header, main pages, and footer layout layout */}        
        <Navbar />
        <ElectionTicker />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <NotificationPrompt />
        {/* 2. Render the analytics script only if the ID exists */}
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {/* Loads once site-wide; individual AdSlot components push ad requests into it */}
        {adsenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        
      </body>
    </html>
  )
}