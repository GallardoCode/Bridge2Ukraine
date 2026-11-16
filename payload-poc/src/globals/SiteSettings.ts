import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'

/** Things that appear on every page: brand, logo and the footer contact details. */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'Content' },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'brandName', type: 'text', required: true, defaultValue: 'Bridge2Ukraine' },
        { name: 'logo', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      fields: [
        { name: 'emblem', type: 'upload', relationTo: 'media' },
        { name: 'tagline', type: 'textarea' },
        { name: 'contactHeading', type: 'text', defaultValue: 'Contact Us' },
        {
          name: 'contacts',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'value', type: 'text', required: true },
              ],
            },
          ],
        },
        { name: 'copyright', type: 'text' },
      ],
    },
  ],
}
