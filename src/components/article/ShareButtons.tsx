'use client'

import { useState } from 'react'
import { Facebook, Twitter, MessageCircle, Link2, Check } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa';

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)

  const shareLinks = [
    {
      name: 'Facebook',
      Icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: 'WhatsApp',
      Icon: FaWhatsapp,
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
    {
      name: 'X',
      Icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
  ]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail silently
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-text-primary mr-1">Share</span>
      {shareLinks.map(({ name, Icon, href }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${name}`}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-text-secondary hover:bg-brand-50 hover:text-brand-700 transition-colors"
        >
          <Icon size={16} />
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link"
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-text-secondary hover:bg-brand-50 hover:text-brand-700 transition-colors"
      >
        {copied ? <Check size={16} className="text-brand-700" /> : <Link2 size={16} />}
      </button>
    </div>
  )
}