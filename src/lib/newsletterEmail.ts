import 'server-only'
import { getSiteUrl } from './site'
import { urlFor } from './sanity'

/**
 * Email templates. Pure functions: they take everything they need (including
 * the per-recipient unsubscribe URL) as arguments. Inline styles + tables,
 * because that's what email clients actually support.
 */

const BRAND = '#0f5132' // adjust to the site's brand colour
const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function shell(title: string, bodyHtml: string, footerHtml: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Georgia,'Times New Roman',serif;color:#111827;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;">
<tr><td style="background:${BRAND};padding:18px 28px;font-family:Arial,Helvetica,sans-serif;color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:.5px;">NUR REPORT</td></tr>
<tr><td style="padding:28px;">${bodyHtml}</td></tr>
<tr><td style="padding:18px 28px;background:#f9fafb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6b7280;">${footerHtml}</td></tr>
</table></td></tr></table></body></html>`
}

/* ------------------------------ confirmation ------------------------------ */

export function confirmationEmail(confirmUrl: string) {
  const subject = 'Confirm your subscription to the NUR Report Brief'
  const html = shell(
    subject,
    `<h1 style="margin:0 0 12px;font-size:24px;line-height:30px;">One quick step</h1>
<p style="font-size:16px;line-height:26px;margin:0 0 20px;">Thanks for signing up for the NUR Report Brief — the day's most important stories from Nigeria, Africa and the world, in your inbox.</p>
<p style="margin:0 0 24px;"><a href="${esc(confirmUrl)}" style="background:${BRAND};color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:15px;padding:12px 24px;border-radius:999px;display:inline-block;">Confirm my subscription</a></p>
<p style="font-size:14px;line-height:22px;color:#4b5563;margin:0;">If the button doesn't work, paste this link into your browser:<br><a href="${esc(confirmUrl)}" style="color:${BRAND};word-break:break-all;">${esc(confirmUrl)}</a></p>`,
    `You received this because someone entered this address at ${esc(getSiteUrl())}. If that wasn't you, ignore this email and you won't be subscribed.`
  )
  const text = `Confirm your subscription to the NUR Report Brief:\n\n${confirmUrl}\n\nIf you didn't sign up, ignore this email and you won't be subscribed.`
  return { subject, html, text }
}

/* ---------------------------------- brief ---------------------------------- */

type Story = {
  headline: string
  slug: { current: string }
  excerpt?: string
  category?: string
  featuredImage?: any
}

export type BriefForEmail = {
  title: string
  slug: { current: string }
  date: string
  edition?: string
  intro?: string
  closing?: string
  leadStory?: Story | null
  nigeria?: Story[] | null
  business?: Story[] | null
  tech?: Story[] | null
  sports?: Story[] | null
  world?: Story[] | null
}

const SECTIONS: [keyof BriefForEmail, string][] = [
  ['nigeria', 'Nigeria'],
  ['business', 'Business'],
  ['tech', 'Tech'],
  ['sports', 'Sports'],
  ['world', 'World'],
]

const storyUrl = (s: Story) => `${getSiteUrl()}/${s.category || 'news'}/${s.slug.current}`

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export function briefSubject(b: BriefForEmail): string {
  const label = b.edition === 'morning' ? 'Morning Brief' : 'Evening Brief'
  return `${b.title} — ${label}, ${new Date(b.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}`
}

function storyBlock(s: Story): string {
  return `<p style="margin:0 0 20px;"><a href="${esc(storyUrl(s))}" style="font-size:18px;line-height:24px;font-weight:bold;color:#111827;text-decoration:none;">${esc(s.headline)}</a>${
    s.excerpt
      ? `<br><span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#4b5563;">${esc(s.excerpt)}</span>`
      : ''
  }</p>`
}

/**
 * Per-recipient unsubscribe URL is passed in — every email is individually
 * addressed, so each carries its own signed link.
 */
export function briefEmail(brief: BriefForEmail, unsubscribeUrl: string) {
  const site = getSiteUrl()
  const briefUrl = `${site}/brief/${brief.slug.current}`
  const subject = briefSubject(brief)

  let body = `<p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">${esc(formatDate(brief.date))}</p>
<h1 style="margin:0 0 16px;font-size:28px;line-height:34px;">${esc(brief.title)}</h1>`

  if (brief.intro) body += `<p style="font-size:16px;line-height:26px;margin:0 0 24px;">${esc(brief.intro)}</p>`

  const lead = brief.leadStory
  if (lead) {
    let img = ''
    if (lead.featuredImage?.asset) {
      try {
        const src = urlFor(lead.featuredImage).width(1200).height(630).fit('crop').auto('format').url()
        img = `<a href="${esc(storyUrl(lead))}"><img src="${esc(src)}" alt="${esc(lead.featuredImage.alt || lead.headline)}" width="544" style="display:block;width:100%;max-width:544px;height:auto;margin:0 0 12px;border:0;"></a>`
      } catch {
        /* image is optional */
      }
    }
    body += `<div style="border-top:3px solid ${BRAND};padding-top:14px;margin-bottom:28px;">
<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${BRAND};">Lead story</p>${img}
<a href="${esc(storyUrl(lead))}" style="font-size:24px;line-height:30px;font-weight:bold;color:#111827;text-decoration:none;">${esc(lead.headline)}</a>${
      lead.excerpt ? `<p style="font-size:16px;line-height:26px;margin:10px 0 0;color:#374151;">${esc(lead.excerpt)}</p>` : ''
    }</div>`
  }

  for (const [key, label] of SECTIONS) {
    const stories = (brief[key] as Story[] | null | undefined)?.filter((s) => s?.slug?.current)
    if (!stories?.length) continue
    body += `<h2 style="margin:0 0 14px;padding-top:10px;border-top:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:${BRAND};">${label}</h2>${stories.map(storyBlock).join('')}`
  }

  body += `<p style="margin:8px 0 24px;"><a href="${esc(briefUrl)}" style="background:${BRAND};color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:14px;padding:11px 22px;border-radius:999px;display:inline-block;">Read the full Brief online</a></p>`

  if (brief.closing) body += `<p style="font-size:15px;line-height:24px;color:#374151;border-top:1px solid #e5e7eb;padding-top:16px;margin:0;">${esc(brief.closing)}</p>`

  const html = shell(
    subject,
    body,
    `You're receiving this because you subscribed to the NUR Report Brief at ${esc(site)}.<br><a href="${esc(unsubscribeUrl)}" style="color:#6b7280;">Unsubscribe</a> &nbsp;·&nbsp; <a href="${esc(briefUrl)}" style="color:#6b7280;">View in browser</a>`
  )

  const lines: string[] = [brief.title, formatDate(brief.date), '']
  if (brief.intro) lines.push(brief.intro, '')
  if (lead) lines.push('LEAD STORY', lead.headline, storyUrl(lead), '')
  for (const [key, label] of SECTIONS) {
    const stories = (brief[key] as Story[] | null | undefined)?.filter((s) => s?.slug?.current)
    if (!stories?.length) continue
    lines.push(label.toUpperCase())
    for (const s of stories) lines.push(`- ${s.headline}`, `  ${storyUrl(s)}`)
    lines.push('')
  }
  lines.push(`Read online: ${briefUrl}`)
  if (brief.closing) lines.push('', brief.closing)
  lines.push('', `Unsubscribe: ${unsubscribeUrl}`)

  return { subject, html, text: lines.join('\n') }
}
