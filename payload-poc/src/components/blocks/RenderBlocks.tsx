import type { ReactNode } from 'react'
import { Partners } from './Partners'
import {
  ActionCentre,
  ButtonRow,
  CentredIntro,
  FeatureCards,
  Hero,
  ImageContent,
  ImageGallery,
  Mission,
  Stats,
  WorkGallery,
  type LayoutBlock,
} from './simple'
import { StoriesMosaic } from './StoriesMosaic'

/** Blocks that sit inside the page's content column rather than spanning the full width. */
const contained = new Set<LayoutBlock['blockType']>(['imageContent', 'buttonRow', 'centredIntro', 'imageGallery'])

const renderBlock = (block: LayoutBlock, index: number): ReactNode => {
  switch (block.blockType) {
    case 'hero':
      return <Hero block={block} isFirst={index === 0} />
    case 'mission':
      return <Mission block={block} />
    case 'featureCards':
      return <FeatureCards block={block} />
    case 'storiesMosaic':
      return <StoriesMosaic block={block} />
    case 'workGallery':
      return <WorkGallery block={block} />
    case 'stats':
      return <Stats block={block} />
    case 'partners':
      return <Partners block={block} />
    case 'actionCentre':
      return <ActionCentre block={block} />
    case 'imageContent':
      return <ImageContent block={block} />
    case 'buttonRow':
      return <ButtonRow block={block} />
    case 'centredIntro':
      return <CentredIntro block={block} />
    case 'imageGallery':
      return <ImageGallery block={block} />
    default: {
      const _exhaustive: never = block
      return null
    }
  }
}

/**
 * Renders a page layout in order. Consecutive "contained" blocks share one
 * <main class="section-container">, matching the original donate/volunteer pages.
 */
export const RenderBlocks = ({ blocks }: { blocks: LayoutBlock[] }) => {
  const out: ReactNode[] = []
  let run: ReactNode[] = []
  const flush = () => {
    if (run.length) out.push(<main className="section-container" key={`main-${out.length}`}>{run}</main>)
    run = []
  }
  blocks.forEach((block, i) => {
    const node = <div key={block.id ?? i} data-block={block.blockType} style={{ display: 'contents' }}>{renderBlock(block, i)}</div>
    if (contained.has(block.blockType)) {
      run.push(node)
    } else {
      flush()
      out.push(node)
    }
  })
  flush()
  return <>{out}</>
}
