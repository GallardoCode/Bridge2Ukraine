import config from '@payload-config'
import path from 'path'
import { getPayload } from 'payload'
import { seed } from './seed'

// PROTOTYPE: `pnpm seed`. Wipes CMS content in DATABASE_URL and re-imports the static site.
const payload = await getPayload({ config })

const { totalDocs: users } = await payload.count({ collection: 'users' })
if (users === 0) {
  const email = 'dev@example.com'
  const password = 'dev-password'
  await payload.create({ collection: 'users', data: { email, password, name: 'Local editor' } })
  payload.logger.info(`Created local editor ${email} / ${password}`)
}

await seed(payload, {
  photosDir: process.env.PHOTOS_DIR ?? path.resolve(process.cwd(), '../photos'),
  log: (msg) => payload.logger.info(msg),
})
process.exit(0)
