import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email', group: 'Admin' },
  auth: {
    // Plesk terminates TLS, so in production the admin is always served over HTTPS.
    cookies: { secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' },
  },
  fields: [{ name: 'name', type: 'text' }],
}
