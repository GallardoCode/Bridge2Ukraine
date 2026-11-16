import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload, type Payload } from 'payload'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import type { Page } from '@/payload-types'
import { seed } from '@/seed/seed'

let payload: Payload

const findPage = async (slug: string, opts: { draft?: boolean; anonymous?: boolean } = {}) => {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    draft: opts.draft ?? false,
    overrideAccess: !opts.anonymous,
  })
  return docs[0]
}

const render = (page: Page | undefined) => renderToStaticMarkup(<RenderBlocks blocks={page?.layout ?? []} />)

/** Top-level section classes in document order. */
const sectionOrder = (html: string) =>
  [...html.matchAll(/data-block="[^"]+"[^>]*><(?:section|header) [^>]*class="([^"]+)"/g)].map((m) => m[1])

beforeAll(async () => {
  payload = await getPayload({ config })
  // The schema comes from the committed migrations (tests/global-setup.ts), not from push.
  fs.rmSync(process.env.MEDIA_DIR!, { recursive: true, force: true })
  await seed(payload, { photosDir: path.resolve(process.cwd(), '../photos'), skipVideos: true })
})

afterAll(async () => {
  await payload.destroy()
})

describe('seeded content', () => {
  it('publishes the four pages of the static site', async () => {
    const { docs } = await payload.find({ collection: 'pages', sort: 'slug', overrideAccess: false })
    expect(docs.map((p) => p.slug)).toEqual(['donate', 'donate-items', 'home', 'volunteer'])
  })

  it('renders the home page sections in the original order with the original classes', async () => {
    const html = render(await findPage('home'))
    expect(sectionOrder(html)).toEqual([
      'hero',
      'mission-statement',
      'sustainability-section',
      'photos-mosaic-section',
      'our-work-section',
      'numbers-section',
      'partners-carousel-section',
      'action-centre-section',
    ])
  })

  it('shows the first seven stories and hides the rest behind "View All Stories"', async () => {
    const html = render(await findPage('home'))
    const tiles = [...html.matchAll(/class="mosaic-item ([^"]+)"/g)].map((m) => m[1] ?? '')
    expect(tiles.filter((c) => !c.includes('js-hidden'))).toHaveLength(7)
    expect(tiles.filter((c) => c.includes('js-hidden')).length).toBeGreaterThan(0)
    expect(html).toContain('View All Stories')
  })
})

describe('editing', () => {
  it('reorders sections when the layout array is reordered', async () => {
    const home = (await findPage('home'))!
    const layout = home.layout ?? []
    const mission = layout.findIndex((b) => b.blockType === 'mission')
    const reordered = [...layout]
    const [moved] = reordered.splice(mission, 1)
    reordered.push(moved!)

    await payload.update({ collection: 'pages', id: home.id, data: { layout: reordered, _status: 'published' } })

    const order = sectionOrder(render(await findPage('home')))
    expect(order.at(-1)).toBe('mission-statement')
    expect(order[1]).toBe('sustainability-section')
  })

  it('lets a block type be reused on another page', async () => {
    const volunteer = (await findPage('volunteer'))!
    await payload.update({
      collection: 'pages',
      id: volunteer.id,
      data: {
        _status: 'published',
        layout: [
          ...(volunteer.layout ?? []),
          { blockType: 'mission', heading: 'Reused block', text: 'Same block type as on the home page.' },
        ],
      },
    })
    expect(render(await findPage('volunteer'))).toContain('<h2>Reused block</h2>')
  })

  it('keeps draft changes away from the public until published', async () => {
    const donate = (await findPage('donate'))!
    const layout = (donate.layout ?? []).map((b) => (b.blockType === 'imageContent' ? { ...b, heading: 'Draft heading' } : b))
    await payload.update({ collection: 'pages', id: donate.id, data: { layout }, draft: true })

    expect(render(await findPage('donate', { anonymous: true }))).not.toContain('Draft heading')
    expect(render(await findPage('donate', { draft: true }))).toContain('Draft heading')

    await payload.update({ collection: 'pages', id: donate.id, data: { _status: 'published' }, draft: false })
    expect(render(await findPage('donate', { anonymous: true }))).toContain('Draft heading')
  })

  it('updates every page that uses a story when the story is edited in the library', async () => {
    const { docs } = await payload.find({ collection: 'stories', where: { heading: { equals: 'Mirrors' } } })
    await payload.update({ collection: 'stories', id: docs[0]!.id, data: { heading: 'Mirrors (edited)' } })
    expect(render(await findPage('home'))).toContain('<h3>Mirrors (edited)</h3>')
  })
})

describe('access control', () => {
  it('hides a page that has never been published from anonymous visitors', async () => {
    await payload.create({ collection: 'pages', draft: true, data: { title: 'Unpublished', slug: 'unpublished', layout: [] } })
    expect(await findPage('unpublished', { anonymous: true })).toBeUndefined()
    expect(await findPage('unpublished', { draft: true })).toBeDefined()
  })

  it('does not let anonymous visitors create pages', async () => {
    await expect(
      payload.create({ collection: 'pages', overrideAccess: false, data: { title: 'x', slug: 'x', layout: [], _status: 'published' } }),
    ).rejects.toThrow()
  })

  it('rejects slugs that would not make clean URLs', async () => {
    await expect(payload.create({ collection: 'pages', data: { title: 'Bad', slug: 'Bad Slug!', _status: 'published' } })).rejects.toThrow()
  })
})
