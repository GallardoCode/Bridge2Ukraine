import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { getPayloadClient } from '@/lib/queries'

/** Turns on Next.js draft mode for a logged-in editor, then shows the requested page. */
export async function GET(req: NextRequest) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return new Response('Log in to /admin to preview drafts.', { status: 403 })

  const path = req.nextUrl.searchParams.get('path') ?? '/'
  if (!path.startsWith('/') || path.startsWith('//')) return new Response('Invalid path', { status: 400 })

  ;(await draftMode()).enable()
  redirect(path)
}
