import type { Media } from '@/payload-types'

/** A relationship field holds an id until it is populated (query depth). */
type Relation<T> = number | T | null | undefined

export const populated = <T extends object>(value: Relation<T>): T | null =>
  typeof value === 'object' && value !== null ? value : null

export const populatedList = <T extends object>(values: Relation<T>[] | null | undefined): T[] =>
  (values ?? []).flatMap((v) => {
    const doc = populated(v)
    return doc ? [doc] : []
  })

export type Image = { src: string; alt: string }

export const toImage = (value: Relation<Media>): Image | null => {
  const media = populated(value)
  if (!media?.url) return null
  return { src: media.url, alt: media.alt }
}

export const toImages = (values: Relation<Media>[] | null | undefined): Image[] =>
  (values ?? []).flatMap((v) => {
    const image = toImage(v)
    return image ? [image] : []
  })
