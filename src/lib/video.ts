// Extract YouTube / Vimeo IDs and thumbnails

export function getYouTubeID(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
  return match ? match[1] : null
}

export function getVimeoID(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

export function getVideoThumbnail(url: string): string | null {
  const yt = getYouTubeID(url)
  // hqdefault (480x360) is reliably available for every YouTube video.
  // maxresdefault can 404 for videos without an HD source thumbnail, which
  // would otherwise crash next/image at render time.
  if (yt) return `https://img.youtube.com/vi/${yt}/hqdefault.jpg`
  // Vimeo requires API call for thumbs — fallback to placeholder or featuredImage
  return null
}

export function getEmbedUrl(url: string): string | null {
  const yt = getYouTubeID(url)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}?rel=0`
  const vimeo = getVimeoID(url)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo}`
  return null
}