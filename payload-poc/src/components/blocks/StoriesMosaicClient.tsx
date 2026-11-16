'use client'

import { useRef, useState } from 'react'
import type { Story } from '@/payload-types'
import type { Image } from '@/lib/media'

type TileBase = { id: number; size: Story['size'] }

export type Tile =
  | (TileBase & { kind: 'photo'; image: Image; caption: string })
  | (TileBase & { kind: 'video'; src: string; poster: string | null; caption: string })
  | (TileBase & { kind: 'fact'; heading: string; text: string; colour: 'yellow' | 'blue' })

const PlayBadge = () => (
  <div className="video-badge" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  </div>
)

/** Same behaviour as the original inline script: play on hover or tap, reset on leave. */
const VideoTile = ({ tile, className, eager }: { tile: Extract<Tile, { kind: 'video' }>; className: string; eager: boolean }) => {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const play = () => {
    setPlaying(true)
    ref.current?.play().catch(() => setPlaying(false))
  }
  const stop = () => {
    setPlaying(false)
    if (ref.current) {
      ref.current.pause()
      ref.current.currentTime = 0
    }
  }

  return (
    <div
      className={`${className} video-item${playing ? ' is-playing' : ''}`}
      onMouseEnter={play}
      onMouseLeave={stop}
      onClick={() => (ref.current?.paused ? play() : stop())}
    >
      <PlayBadge />
      <video
        ref={ref}
        poster={tile.poster ?? undefined}
        src={tile.src}
        loop
        playsInline
        preload={eager ? 'metadata' : 'none'}
        className="mosaic-video"
      />
      {tile.caption && (
        <div className="mosaic-overlay">
          <p>
            <i>{tile.caption}</i>
          </p>
        </div>
      )}
    </div>
  )
}

export const MosaicGrid = ({ tiles, initialCount, buttonLabel }: { tiles: Tile[]; initialCount: number; buttonLabel: string }) => {
  const [expanded, setExpanded] = useState(false)
  const hasMore = tiles.length > initialCount

  return (
    <>
      <div className="sketch-mosaic">
        {tiles.map((tile, i) => {
          const hidden = !expanded && i >= initialCount
          const className = `mosaic-item ${tile.size}${hidden ? ' js-hidden' : ''}`
          switch (tile.kind) {
            case 'photo':
              return (
                <div className={className} key={tile.id}>
                  <img src={tile.image.src} alt={tile.image.alt} loading="lazy" />
                  {tile.caption && (
                    <div className="mosaic-overlay">
                      <p>{tile.caption}</p>
                    </div>
                  )}
                </div>
              )
            case 'video':
              return <VideoTile key={tile.id} tile={tile} className={className} eager={i < initialCount} />
            case 'fact':
              return (
                <div className={`${className} ${tile.colour}-card`} key={tile.id}>
                  <h3>{tile.heading}</h3>
                  <p>{tile.text}</p>
                </div>
              )
            default: {
              const _exhaustive: never = tile
              return null
            }
          }
        })}
      </div>
      {hasMore && !expanded && (
        <div className="view-all-container">
          <button type="button" className="btn-outline view-all-btn" onClick={() => setExpanded(true)}>
            {buttonLabel}
          </button>
        </div>
      )}
    </>
  )
}
