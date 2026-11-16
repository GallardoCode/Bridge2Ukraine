import path from 'path'
import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Library' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  upload: {
    // Local disk storage. In Docker this directory is a named volume (see deploy/compose.yml).
    staticDir: process.env.MEDIA_DIR ?? path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/*', 'video/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describes the image for screen readers.' },
    },
  ],
}
