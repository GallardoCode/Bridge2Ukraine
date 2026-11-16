import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { pageBlocks } from '../blocks/config'
import { link } from '../fields/link'

export const pagePath = (slug: string | null | undefined) => (slug === 'home' ? '/' : `/${slug ?? ''}`)

const previewUrl = (slug: string | null | undefined) =>
  `/next/preview?path=${encodeURIComponent(pagePath(slug))}`

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
    livePreview: { url: ({ data }) => previewUrl(data?.slug) },
    preview: (data) => previewUrl(typeof data.slug === 'string' ? data.slug : undefined),
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: {
    drafts: { autosave: { interval: 375 } },
    maxPerDoc: 25,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Layout',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: pageBlocks,
              admin: { initCollapsed: true },
            },
          ],
        },
        {
          label: 'Page settings',
          fields: [
            { name: 'metaDescription', type: 'textarea' },
            link('navButton', { label: 'Navigation button', admin: { description: 'Button on the right of the top bar.' } }),
            { name: 'showFooter', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
    { name: 'title', type: 'text', required: true, admin: { position: 'sidebar' } },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: '"home" is the front page. Others become /<slug>.' },
      validate: (value: unknown) =>
        typeof value === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)
          ? true
          : 'Use lowercase letters, numbers and hyphens.',
    },
  ],
}
