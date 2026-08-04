// Estimates article reading time from Sanity Portable Text content.
// Based on an average adult silent-reading speed of ~225 words per minute.

const WORDS_PER_MINUTE = 225

function extractText(blocks: any[] = []): string {
  return blocks
    .filter((block) => block?._type === 'block' && Array.isArray(block.children))
    .map((block) => block.children.map((child: any) => child?.text || '').join(''))
    .join(' ')
}

export function getReadingTime(body: any[] = []): number {
  const text = extractText(body)
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE)
  return Math.max(minutes, 1)
}