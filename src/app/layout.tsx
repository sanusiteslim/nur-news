import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getSiteUrl } from '@/lib/site'

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
  description: siteDescription,
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
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-text-primary">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}