import type { Block } from 'payload'
import { details, link, links } from '../fields/link'

/*
 * Reusable page sections. Each block maps 1:1 to a section of the original
 * static HTML and renders with the original CSS classes (see src/components/blocks).
 * Editors add, edit, reorder and remove them in a page's "Layout" field.
 */

const eyebrow = { name: 'eyebrow', type: 'text', admin: { description: 'Small uppercase label above the heading.' } } as const

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'heading', type: 'text', required: true },
    { name: 'text', type: 'textarea' },
    link('cta', { label: 'Button' }),
  ],
}

export const MissionBlock: Block = {
  slug: 'mission',
  labels: { singular: 'Mission statement', plural: 'Mission statements' },
  fields: [
    eyebrow,
    { name: 'heading', type: 'text', required: true },
    { name: 'text', type: 'textarea' },
    { name: 'quote', type: 'text' },
  ],
}

export const FeatureCardsBlock: Block = {
  slug: 'featureCards',
  labels: { singular: 'Feature cards', plural: 'Feature cards' },
  fields: [
    eyebrow,
    { name: 'heading', type: 'text', required: true },
    { name: 'lead', type: 'textarea' },
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea', required: true },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Optional infographic below the cards.' } },
  ],
}

export const StoriesMosaicBlock: Block = {
  slug: 'storiesMosaic',
  labels: { singular: 'Stories mosaic', plural: 'Stories mosaics' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    {
      name: 'stories',
      type: 'relationship',
      relationTo: 'stories',
      hasMany: true,
      required: true,
      admin: { description: 'Pick stories and drag to set their order in the grid.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'initialCount',
          type: 'number',
          defaultValue: 7,
          min: 1,
          admin: { description: 'Stories shown before "View all" is clicked.' },
        },
        { name: 'buttonLabel', type: 'text', defaultValue: 'View All Stories' },
      ],
    },
  ],
}

export const WorkGalleryBlock: Block = {
  slug: 'workGallery',
  labels: { singular: 'Text with photo grid', plural: 'Text with photo grids' },
  fields: [
    eyebrow,
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'richText' },
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
  ],
}

export const StatsBlock: Block = {
  slug: 'stats',
  labels: { singular: 'Journey stats', plural: 'Journey stats' },
  fields: [
    eyebrow,
    { name: 'heading', type: 'text', required: true },
    { name: 'lead', type: 'textarea' },
    { name: 'mapImage', type: 'upload', relationTo: 'media' },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Stat', plural: 'Stats' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', required: true },
            { name: 'label', type: 'text', required: true },
          ],
        },
        { name: 'description', type: 'text' },
        { name: 'highlight', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}

export const PartnersBlock: Block = {
  slug: 'partners',
  labels: { singular: 'Partner logos', plural: 'Partner logos' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'partners', type: 'relationship', relationTo: 'partners', hasMany: true, required: true },
  ],
}

export const ActionCentreBlock: Block = {
  slug: 'actionCentre',
  labels: { singular: 'Ways to help', plural: 'Ways to help' },
  fields: [
    {
      name: 'anchor',
      type: 'text',
      admin: { description: 'Optional id so buttons can link here, e.g. "donate" for #donate.' },
    },
    eyebrow,
    { name: 'heading', type: 'text', required: true },
    {
      name: 'cards',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'richText' },
        { name: 'perks', type: 'richText', admin: { description: 'Optional boxed highlights.' } },
        link('link', { label: 'Button' }),
      ],
    },
    {
      name: 'banner',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'text', type: 'textarea' },
        links('buttons'),
      ],
    },
  ],
}

export const ImageContentBlock: Block = {
  slug: 'imageContent',
  labels: { singular: 'Image with text', plural: 'Images with text' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    eyebrow,
    { name: 'heading', type: 'text', required: true },
    { name: 'intro', type: 'richText' },
    { name: 'detailsIntro', type: 'text', admin: { description: 'Line above the details, e.g. "Get in touch with us:"' } },
    details(),
    {
      type: 'row',
      fields: [
        {
          name: 'detailsStyle',
          type: 'select',
          defaultValue: 'card',
          options: [
            { label: 'Bordered card', value: 'card' },
            { label: 'Plain', value: 'plain' },
          ],
        },
        { name: 'boxed', type: 'checkbox', defaultValue: false, admin: { description: 'Tinted panel behind the text.' } },
        { name: 'centred', type: 'checkbox', defaultValue: true, admin: { description: 'Centre the text vertically against the image.' } },
      ],
    },
    { name: 'body', type: 'richText' },
  ],
}

export const ButtonRowBlock: Block = {
  slug: 'buttonRow',
  labels: { singular: 'Button row', plural: 'Button rows' },
  fields: [
    { name: 'intro', type: 'text' },
    links('buttons'),
    { name: 'divider', type: 'checkbox', defaultValue: false, admin: { description: 'Thin line above the row.' } },
  ],
}

export const CentredIntroBlock: Block = {
  slug: 'centredIntro',
  labels: { singular: 'Centred intro', plural: 'Centred intros' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'text', type: 'textarea' },
    details(),
    links('buttons'),
  ],
}

export const ImageGalleryBlock: Block = {
  slug: 'imageGallery',
  labels: { singular: 'Image gallery', plural: 'Image galleries' },
  fields: [{ name: 'images', type: 'upload', relationTo: 'media', hasMany: true, required: true }],
}

export const pageBlocks: Block[] = [
  HeroBlock,
  MissionBlock,
  FeatureCardsBlock,
  StoriesMosaicBlock,
  WorkGalleryBlock,
  StatsBlock,
  PartnersBlock,
  ActionCentreBlock,
  ImageContentBlock,
  ButtonRowBlock,
  CentredIntroBlock,
  ImageGalleryBlock,
]
