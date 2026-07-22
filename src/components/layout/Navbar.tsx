'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, Menu, X, Radio } from 'lucide-react'

const categories = [
  { label: 'Home', href: '/' },
  { label: 'Nigeria', href: '/nigeria' },
  { label: 'Africa', href: '/africa' },
  { label: 'World', href: '/world' },
  { label: 'Sports', href: '/sports' },
  { label: 'Opinion', href: '/opinion' },
  { label: 'Video', href: '/video' },
]

const moreCategories = [
  { label: 'Business', href: '/business' },
  { label: 'Tech', href: '/tech' },
  { label: 'Culture', href: '/culture' },
  { label: 'Environment', href: '/environment' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <svg width="36" height="24" viewBox="0 0 161.33 108.74" xmlns="http://www.w3.org/2000/svg">
              <path fill="#1B5E20" d="M113.65,80.64V1.28h19.84v8.96h2.88c1.17-3.2,3.12-5.54,5.84-7.04,2.72-1.49,5.89-2.24,9.52-2.24h9.6v17.92h-9.92c-5.12,0-9.33,1.36-12.64,4.08-3.31,2.72-4.96,6.91-4.96,12.56v45.12h-20.16Z"/>
              <path fill="#1A1A1A" d="M60.38,108.74c-6.19,0-11.6-1.41-16.24-4.24-4.64-2.83-8.24-6.75-10.8-11.76-2.56-5.01-3.84-10.77-3.84-17.28V28.1h20.16v45.76c0,5.98,1.46,10.46,4.4,13.44,2.93,2.99,7.12,4.48,12.56,4.48,6.19,0,10.99-2.05,14.4-6.16,3.41-4.1,5.12-9.84,5.12-17.2V28.1h20.16v79.36h-19.84v-10.4h-2.88c-1.28,2.67-3.68,5.28-7.2,7.84-3.52,2.56-8.86,3.84-16,3.84Z"/>
              <path fill="#1B5E20" d="M0,80.64V1.28h19.84v10.4h2.88c1.28-2.77,3.68-5.41,7.2-7.92,3.52-2.5,8.85-3.76,16-3.76,6.18,0,11.6,1.42,16.24,4.24,4.64,2.83,8.24,6.72,10.8,11.68,2.56,4.96,3.84,10.75,3.84,17.36v47.36h-20.16v-45.76c0-5.97-1.47-10.45-4.4-13.44-2.94-2.98-7.12-4.48-12.56-4.48-6.19,0-10.99,2.06-14.4,6.16-3.42,4.11-5.12,9.84-5.12,17.2v40.32H0Z"/>
            </svg>
            <span className="text-brand-800 font-bold text-xl tracking-tight hidden sm:block">NURR</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {categories.map((cat) => (
              <Link key={cat.href} href={cat.href} className="px-3 py-2 text-sm font-medium text-text-primary hover:text-brand-700 transition-colors relative group">
                {cat.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand-700 transition-all group-hover:w-full" />
              </Link>
            ))}
            <div className="relative">
              <button onClick={() => setMoreOpen(!moreOpen)} className="px-3 py-2 text-sm font-medium text-text-primary hover:text-brand-700 flex items-center gap-1">
                More <span className="text-xs,">▼</span>
              </button>
              {moreOpen && (
                <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                  {moreCategories.map((cat) => (
                    <Link key={cat.href} href={cat.href} className="block px-4 py-2 text-sm text-text-primary hover:bg-gray-50 hover:text-brand-700" onClick={() => setMoreOpen(false)}>
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/live" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brand-700 text-white text-sm font-medium rounded-full hover:bg-brand-800 transition-colors">
              <Radio className="w-4 h-4" />
              LIVE
            </Link>
            <button onClick={() => setSearchOpen(true)} className="p-2 text-text-primary hover:text-brand-700 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-text-primary">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white w-full max-w-2xl mx-4 rounded-lg p-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-text-muted" />
              <input type="text" placeholder="Search articles..." className="flex-1 text-lg outline-none" autoFocus />
              <button onClick={() => setSearchOpen(false)}>
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 bg-white z-50 lg:hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-xl text-brand-800">NUR</span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="space-y-1">
              {[...categories, ...moreCategories].map((cat) => (
                <Link key={cat.href} href={cat.href} className="block px-4 py-3 text-lg font-medium text-text-primary hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  {cat.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}