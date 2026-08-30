import Link from 'next/link'
import { Facebook, Instagram, X, Youtube, Rss } from 'lucide-react'

const footerLinks = {
  'Sections': [
    { label: 'Nigeria', href: '/nigeria' },
    { label: 'Africa', href: '/africa' },
    { label: 'World', href: '/world' },
    { label: 'Sports', href: '/sports' },
    { label: 'Opinion', href: '/opinion' },
  ],
  'More': [
    { label: 'Business', href: '/business' },
    { label: 'Tech', href: '/tech' },
    { label: 'Culture', href: '/culture' },
    { label: 'Environment', href: '/environment' },
  ],
  'Company': [
    { label: 'About NURR', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
    { label: 'Send Us a Tip', href: '/tip' },
    { label: 'Advertise', href: '/advertise' },
  ],
  'Legal': [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
}

// TODO: replace with NUR Report's real social profile URLs before launch —
// these are placeholders so the footer doesn't ship with links to the wrong
// accounts. Swap the '#' hrefs for the actual profiles.
const socialLinks = [
  { label: 'Facebook', href: '#', icon: Facebook },
  { label: 'X (Twitter)', href: '#', icon: X },
  { label: 'Instagram', href: '#', icon: Instagram },
  { label: 'YouTube', href: '#', icon: Youtube },
  { label: 'RSS Feed', href: '/rss.xml', icon: Rss },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Masthead / editorial standards blurb */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">About NURR</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              NUR Report is an independent newsroom covering Nigeria, Africa, and the world. Our reporting is fact-checked, sourced, and edited to a consistent editorial standard before publication.
            </p>
            <Link href="/about" className="inline-block mt-3 text-sm font-medium text-brand-500 hover:text-brand-100 underline underline-offset-2 transition-colors">
              Read our editorial standards →
            </Link>

            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('/') ? undefined : '_blank'}
                  rel={href.startsWith('/') ? undefined : 'noopener noreferrer'}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:bg-brand-700 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg width="28" height="19" viewBox="0 0 161.33 108.74" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4CAF50" d="M113.65,80.64V1.28h19.84v8.96h2.88c1.17-3.2,3.12-5.54,5.84-7.04,2.72-1.49,5.89-2.24,9.52-2.24h9.6v17.92h-9.92c-5.12,0-9.33,1.36-12.64,4.08-3.31,2.72-4.96,6.91-4.96,12.56v45.12h-20.16Z"/>
              <path fill="#FFFFFF" d="M60.38,108.74c-6.19,0-11.6-1.41-16.24-4.24-4.64-2.83-8.24-6.75-10.8-11.76-2.56-5.01-3.84-10.77-3.84-17.28V28.1h20.16v45.76c0,5.98,1.46,10.46,4.4,13.44,2.93,2.99,7.12,4.48,12.56,4.48,6.19,0,10.99-2.05,14.4-6.16,3.41-4.1,5.12-9.84,5.12-17.2V28.1h20.16v79.36h-19.84v-10.4h-2.88c-1.28,2.67-3.68,5.28-7.2,7.84-3.52,2.56-8.86,3.84-16,3.84Z"/>
              <path fill="#4CAF50" d="M0,80.64V1.28h19.84v10.4h2.88c1.28-2.77,3.68-5.41,7.2-7.92,3.52-2.5,8.85-3.76,16-3.76,6.18,0,11.6,1.42,16.24,4.24,4.64,2.83,8.24,6.72,10.8,11.68,2.56,4.96,3.84,10.75,3.84,17.36v47.36h-20.16v-45.76c0-5.97-1.47-10.45-4.4-13.44-2.94-2.98-7.12-4.48-12.56-4.48-6.19,0-10.99,2.06-14.4,6.16-3.42,4.11-5.12,9.84-5.12,17.2v40.32H0Z"/>
            </svg>
            <span className="font-bold text-lg">NURR</span>
          </div>
          <p className="text-gray-400 text-sm text-center md:text-right">
            © {new Date().getFullYear()} NUR Report.
          </p>
        </div>
      </div>
    </footer>
  )
}