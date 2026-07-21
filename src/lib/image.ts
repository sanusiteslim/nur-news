import imageUrlBuilder from '@sanity/image-url'
import { client } from './sanity'

const builder = imageUrlBuilder(client)

export function urlForImage(source: any) {
  if (!source) return builder.image({}).auto('format').fit('max')
  return builder.image(source).auto('format').fit('max')
}