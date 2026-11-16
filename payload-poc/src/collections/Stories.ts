import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

/**
 * One tile in the "Stories of Impact" mosaic. A story is a photo, a video or a
 * coloured text card. Stories live in their own collection so the same story
 * can be picked by any Stories Mosaic block, on any page, in any order.
 */
export const Stories: CollectionConfig = {
  slug: 'stories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'size', 'updatedAt'],
    group: 'Library',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Internal name, shown in the admin only.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          defaultValue: 'photo',
          options: [
            { label: 'Photo', value: 'photo' },
            { label: 'Video', value: 'video' },
            { label: 'Text card', value: 'fact' },
          ],
        },
        {
          name: 'size',
          type: 'select',
          required: true,
          defaultValue: 'tall',
          admin: { description: 'How much of the mosaic grid the tile covers.' },
          options: [
            { label: 'Small square (1×1)', value: 'small-square' },
            { label: 'Tall (1×2)', value: 'tall' },
            { label: 'Wide (2×2)', value: 'wide' },
            { label: 'Large square (2×2)', value: 'large-square' },
          ],
        },
      ],
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: (_, s) => s?.kind === 'photo' || s?.kind === 'video' },
      validate: (value: unknown, { siblingData }: { siblingData: { kind?: string } }) =>
        siblingData.kind !== 'fact' && !value ? 'Photos and videos need a file.' : true,
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, s) => s?.kind === 'video',
        description: 'Still image shown before the video plays.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        condition: (_, s) => s?.kind === 'photo' || s?.kind === 'video',
        description: 'Shown in the blue bar on hover.',
      },
    },
    {
      name: 'heading',
      type: 'text',
      admin: { condition: (_, s) => s?.kind === 'fact' },
    },
    {
      name: 'text',
      type: 'textarea',
      admin: { condition: (_, s) => s?.kind === 'fact' },
    },
    {
      name: 'colour',
      type: 'select',
      defaultValue: 'yellow',
      options: [
        { label: 'Yellow', value: 'yellow' },
        { label: 'Blue', value: 'blue' },
      ],
      admin: { condition: (_, s) => s?.kind === 'fact' },
    },
  ],
}
