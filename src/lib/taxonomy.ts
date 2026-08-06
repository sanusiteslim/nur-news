// Single source of truth for article categories.
// Keep this in sync with the `category` options list in sanity/schemaTypes/article.ts
// and the links in src/components/layout/Navbar.tsx.
export const CATEGORIES: { value: string; label: string }[] = [
  { value: 'nigeria', label: 'Nigeria' },
  { value: 'africa', label: 'Africa' },
  { value: 'world', label: 'World' },
  { value: 'sports', label: 'Sports' },
  { value: 'opinion', label: 'Opinion' },
  { value: 'business', label: 'Business' },
  { value: 'video', label: 'Video' },
  { value: 'tech', label: 'Tech' },
  { value: 'culture', label: 'Culture' },
  { value: 'environment', label: 'Environment' },
]

export const categoryLabels: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
)

export const validCategories: string[] = CATEGORIES.map((c) => c.value)

// Tag values that don't title-case cleanly (acronyms, stylized names).
// Keep in sync with the `tags` options list in sanity/schemaTypes/article.ts.
const TAG_LABEL_OVERRIDES: Record<string, string> = {
  afcon: 'AFCON',
  nelfund: 'NELFUND',
  'us-israel-iran-war': 'US-Israel-Iran War',
}

// Turns a stored tag value (e.g. "world-cup-2026") into a display label
// (e.g. "World Cup 2026"), honoring acronym overrides above.
export function formatTag(tag: string): string {
  if (TAG_LABEL_OVERRIDES[tag]) return TAG_LABEL_OVERRIDES[tag]
  return tag
    .split('-')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ')
}