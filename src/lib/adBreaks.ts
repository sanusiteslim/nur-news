// Inserts `adBreak` marker blocks into a Portable Text article body so
// <PortableText> can render an <AdSlot /> between paragraphs via its
// `types.adBreak` renderer.
//
// Spacing scales with length (house rule):
//   - up to 8 paragraphs  → an ad after every 2nd paragraph
//   - 9–16 paragraphs     → every 3rd
//   - 17 or more          → every 4th
// Pass `every` to force a fixed interval instead.
//
// Only real body paragraphs (block/normal) count — headings, quotes, images
// and lists don't — and a marker is never left as the last element.

function isParagraph(block: any): boolean {
  return block?._type === 'block' && (block.style === 'normal' || !block.style) && !block.listItem
}

export function adInterval(paragraphs: number): number {
  if (paragraphs <= 8) return 2
  if (paragraphs <= 16) return 3
  return 4
}

export function withAdBreaks(body: any[], every?: number): any[] {
  if (!Array.isArray(body) || body.length === 0) return body

  const interval = every ?? adInterval(body.filter(isParagraph).length)
  const result: any[] = []
  let paragraphCount = 0

  for (const block of body) {
    result.push(block)
    if (isParagraph(block)) {
      paragraphCount++
      if (paragraphCount % interval === 0) {
        result.push({ _type: 'adBreak', _key: `ad-break-${block._key || paragraphCount}` })
      }
    }
  }

  if (result.length > 0 && result[result.length - 1]?._type === 'adBreak') {
    result.pop()
  }

  return result
}

/** Index of the paragraph after which a mid-article block (e.g. newsletter) fits best. */
export function midpointParagraph(body: any[]): number {
  const n = Array.isArray(body) ? body.filter(isParagraph).length : 0
  return n >= 6 ? Math.ceil(n / 2) : 0
}
