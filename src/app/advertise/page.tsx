import type { Metadata } from 'next'
import { getTotalViews } from '@/lib/analytics'
// src/app/advertise/page.tsx
import { Mail, Facebook, MessageCircle } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { FaWhatsapp } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Advertise | NUR Report',
  description: 'Advertising, sponsorship, and media kit information for NUR Report.',
}

// TODO: replace with NUR Report's real advertising contact address before launch.
const ADVERTISE_EMAIL = ''

// TODO: fill in with real figures once available. Unlike the article-views
// count below (which is pulled live from tracked data), unique visitors,
// audience geography, and device breakdown aren't tracked anywhere in this
// codebase yet — Google Analytics is wired in (see NEXT_PUBLIC_GA_MEASUREMENT_ID
// in layout.tsx) so those numbers can be pulled from there once there's
// enough traffic history to report honestly.
const AUDIENCE_STATS = [
  { label: 'Monthly unique visitors', value: 'TBD' },
  { label: 'Primary audience', value: 'Nigeria & diaspora' },
  { label: 'Top device', value: 'Mobile' },
]

const AD_FORMATS = [
  {
    name: 'In-Article Display',
    description:
      'Responsive AdSense units placed automatically within article body copy, spaced every two paragraphs so they sit naturally in the reading flow rather than stacked at the top.',
  },
  {
    name: 'Sponsored Content',
    description:
      'A full article slot written or co-written with your team, published and labeled as sponsored, distributed through our regular category and homepage placements.',
  },
  {
    name: 'Newsletter & Push (coming soon)',
    description:
      'Placement in our push-notification alerts and upcoming email newsletter, reaching readers directly outside the browser.',
  },
]

export default async function AdvertisePage() {


  const contactMethods = [
    {
      name: 'Email',
      icon: Mail,
      href: 'mailto:nearstudiong@gmail.com',
      label: 'Send Us an Email',
      primary: true,
    },

        {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      href: 'https://wa.me/2349160711708', // Replace with actual number
      label: 'Chat on WhatsApp',
      primary: false,
    },

    {
      name: 'Twitter/X',
      icon: FaXTwitter,
      href: 'https://x.com/nurreporthq',
      label: 'Follow on X',
      primary: false,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: '#',
      label: 'Like on Facebook',
      primary: false,
    },
    

  ];

  const totalViews = await getTotalViews()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-brand-800 mb-4">Advertise With Us</h1>
      <div className="prose prose-lg max-w-none prose-p:text-text-primary space-y-4 mb-10">
        <p>NUR Report covers Nigeria, Africa, and world news, sports, and opinion for a growing, engaged readership. We work with a limited number of advertisers and sponsors at a time to keep placements relevant and non-intrusive.</p>
      </div>

      {/* Reach — one real, honestly-labeled number plus the stats we don't
          track yet, rather than inventing plausible-looking figures. */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-text-primary mb-4">Our Reach</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface-offwhite rounded-lg p-4">
            <p className="text-2xl font-bold text-brand-800">{totalViews.toLocaleString()}</p>
            <p className="text-xs text-text-muted mt-1">Article views tracked</p>
          </div>
          {AUDIENCE_STATS.map((stat) => (
            <div key={stat.label} className="bg-surface-offwhite rounded-lg p-4">
              <p className="text-2xl font-bold text-brand-800">{stat.value}</p>
              <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-2">
          Article view count reflects tracked reads since analytics went live and updates in real time. Audience figures marked &ldquo;TBD&rdquo; will be filled in from Google Analytics once there&apos;s enough traffic history to report accurately.
        </p>
      </section>

      {/* Formats */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-text-primary mb-4">Ad Formats & Placements</h2>
        <div className="space-y-4">
          {AD_FORMATS.map((format) => (
            <div key={format.name} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-text-primary">{format.name}</h3>
              <p className="text-sm text-text-secondary mt-1">{format.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rates — TODO placeholder, not fabricated numbers */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-text-primary mb-4">Rates</h2>
        <p className="text-text-secondary text-sm">
          Rates depend on placement, duration, and campaign scope. Get in touch below and we&apos;ll send a current rate card and available slots.
        </p>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-xl font-bold text-text-primary mb-4">Get in Touch</h2>
        <p className="text-text-secondary">
          Interested in advertising or sponsorship? Reach out directly:
        </p>
          </section>
      
        <div className="flex flex-wrap gap-16">
            {contactMethods.map((method) => (
              <a
                key={method.name}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`
                  inline-flex items-center gap-2 px-2 py-2 rounded-full
                  font-medium transition-all duration-200
                  hover:scale-105 hover:shadow-lg
                  ${
                    method.primary
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }
                `}
              >
                <method.icon className="w-5 h-5" />
                <span>{method.label}</span>
              </a>
            ))}
          </div>

      
    </div>
  )
}
