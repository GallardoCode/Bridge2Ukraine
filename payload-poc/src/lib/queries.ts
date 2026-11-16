import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

export const getPayloadClient = () => getPayload({ config })

/** Depth 2 populates block relationships (stories) and their uploads (stories → media). */
export const getPage = cache(async (slug: string) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    draft,
    // Draft mode is only switched on by /next/preview after checking the admin session.
    overrideAccess: draft,
  })
  return result.docs[0] ?? null
})

export const getSiteSettings = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 1 })
})
