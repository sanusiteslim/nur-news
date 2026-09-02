import { formatDistanceToNow, differenceInHours, format } from 'date-fns'

/**
 * Formats an article's published date the way most professional news sites
 * do: relative time ("3 hours ago") while the story is fresh, then a plain
 * absolute date once it's a day old or older. Relative time past ~24h stops
 * being useful information ("23 days ago", "about 1 month ago") and starts
 * costing the reader a mental math step just to know when something ran.
 *
 * Year is omitted when the date falls in the current year (e.g. "Aug 15"),
 * and included otherwise (e.g. "Aug 15, 2025") so older archive content
 * stays unambiguous.
 *
 * This is specifically for "when was this published" contexts (article
 * cards, bylines). Live-blog / live-updates timestamps are intentionally
 * NOT run through this — for a feed of updates within a single ongoing
 * story, relative time ("2 minutes ago") is the correct read regardless of
 * how long the story itself has been live, so those call sites keep using
 * date-fns' formatDistanceToNow directly.
 */
export function formatPublishedDate(dateInput?: string | Date | null): string {
  if (!dateInput) return 'Recently'

  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return 'Recently'

  const hoursAgo = differenceInHours(new Date(), date)
  if (hoursAgo < 24) {
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const sameYear = date.getFullYear() === new Date().getFullYear()
  return format(date, sameYear ? 'MMM d' : 'MMM d, yyyy')
}