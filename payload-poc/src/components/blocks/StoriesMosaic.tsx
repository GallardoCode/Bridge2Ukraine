import type { Story } from '@/payload-types'
import { populatedList, toImage, type Image } from '@/lib/media'
import type { BlockOf } from './simple'
import { MosaicGrid, type Tile } from './StoriesMosaicClient'

const toTile = (story: Story): Tile | null => {
  const base = { id: story.id, size: story.size }
  switch (story.kind) {
    case 'photo': {
      const image = toImage(story.media)
      return image ? { ...base, kind: 'photo', image, caption: story.caption ?? '' } : null
    }
    case 'video': {
      const video = toImage(story.media)
      const poster: Image | null = toImage(story.poster)
      return video ? { ...base, kind: 'video', src: video.src, poster: poster?.src ?? null, caption: story.caption ?? '' } : null
    }
    case 'fact':
      return {
        ...base,
        kind: 'fact',
        heading: story.heading ?? '',
        text: story.text ?? '',
        colour: story.colour ?? 'yellow',
      }
    default: {
      const _exhaustive: never = story.kind
      return null
    }
  }
}

export const StoriesMosaic = ({ block }: { block: BlockOf<'storiesMosaic'> }) => {
  const tiles = populatedList(block.stories).flatMap((s) => {
    const tile = toTile(s)
    return tile ? [tile] : []
  })
  return (
    <section className="photos-mosaic-section">
      <div className="section-container">
        <h2>{block.heading}</h2>
        <MosaicGrid
          tiles={tiles}
          initialCount={block.initialCount ?? tiles.length}
          buttonLabel={block.buttonLabel ?? 'View All Stories'}
        />
      </div>
    </section>
  )
}
