// Inserts `adBreak` marker blocks into a Portable Text article body every
// `every` normal paragraphs, so <PortableText> can render an <AdSlot />
// between them via its `types.adBreak` renderer.
//
// Only counts actual body paragraphs (block/normal) — headings, blockquotes,
// images, and lists don't count toward the interval, and a marker is never
// left as the very last element (no ad dangling after the final paragraph).
export function withAdBreaks(body: any[], every: number = 2): any[] {
  if (!Array.isArray(body) || body.length === 0) return body

  const result: any[] = []
  let paragraphCount = 0

  for (const block of body) {
    result.push(block)

    const isParagraph = block?._type === 'block' && (block.style === 'normal' || !block.style)
    if (isParagraph) {
      paragraphCount++
      if (paragraphCount % every === 0) {
        result.push({ _type: 'adBreak', _key: `ad-break-${block._key || paragraphCount}` })
      }
    }
  }

  if (result.length > 0 && result[result.length - 1]?._type === 'adBreak') {
    result.pop()
  }

  return result
}