import { getPayloadClient } from '@/lib/queries'

export const dynamic = 'force-dynamic'

/**
 * Liveness + readiness for Docker's HEALTHCHECK and for checking a deploy:
 * 200 only when Payload has initialised (migrations applied) and the database answers.
 * Reports the running image version so a rollback can be confirmed with one request.
 */
export async function GET() {
  const version = process.env.APP_VERSION ?? 'dev'
  try {
    const payload = await getPayloadClient()
    await payload.count({ collection: 'pages', overrideAccess: true })
    return Response.json({ status: 'ok', version })
  } catch {
    return Response.json({ status: 'error', version }, { status: 503 })
  }
}
