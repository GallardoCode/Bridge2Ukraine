import nextEnv from '@next/env'
import path from 'path'

/**
 * Points the process at the test database and test media folder. Tests wipe and
 * re-migrate the database, so this refuses anything not ending in `_test`.
 */
export const applyTestEnv = () => {
  nextEnv.loadEnvConfig(process.cwd())
  if (process.env.TEST_DATABASE_URL) process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
  const dbName = new URL(process.env.DATABASE_URL ?? 'postgresql://x/none').pathname.slice(1)
  if (!dbName.endsWith('_test')) {
    throw new Error(`Refusing to run tests against "${dbName}". Set TEST_DATABASE_URL to a database ending in _test.`)
  }
  process.env.MEDIA_DIR = path.resolve(process.cwd(), 'test-media')
  process.env.PAYLOAD_SECRET ||= 'test-secret'
}
