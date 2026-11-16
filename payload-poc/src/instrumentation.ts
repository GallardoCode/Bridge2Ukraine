/**
 * Runs once when the Next.js server starts. Initialising Payload here applies
 * pending `prodMigrations` before the first request is served, so a release with
 * a broken migration fails at start-up instead of on a visitor's request.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.NEXT_PHASE === 'phase-production-build') return
  const { getPayload } = await import('payload')
  const { default: config } = await import('@payload-config')
  await getPayload({ config })
}
