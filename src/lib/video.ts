// Extract YouTube / Vimeo IDs and thumbnails

export function getYouTubeID(url: string): string | null {
  if (!url) return null

  // Handles (www./m. optional, http/https):
  //   youtube.com/watch?v=ID          youtube.com/watch?list=X&v=ID
  //   youtube.com/embed/ID            youtube.com/v/ID
  //   youtube.com/shorts/ID           youtube.com/live/ID   (previously unmatched)
  //   youtube-nocookie.com/embed/ID   (previously unmatched)
  //   youtu.be/ID                     youtu.be/ID?si=...
  const match = url
    .trim()
    .match(/(?:youtube(?:-nocookie)?\.com\/(?:[^/\s]+\/\S+\/|(?:embed|v|shorts|live)\/|\S*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
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