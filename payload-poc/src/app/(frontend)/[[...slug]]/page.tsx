import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Button } from '@/components/Button'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { SiteFooter } from '@/components/SiteFooter'
import { toImage } from '@/lib/media'
import { getPage, getSiteSettings } from '@/lib/queries'

// Render on every request: content edits show up immediately, and `next build`
// never needs a database connection. See docs/ARCHITECTURE.md for the trade-off.
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug?: string[] }> }

const slugFrom = async (params: Props['params']) => (await params).slug?.join('/') || 'home'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = await slugFrom(params)
  const [page, settings] = await Promise.all([getPage(slug), getSiteSettings()])
  const brand = settings.brandName
  const icon = toImage(settings.logo)
  return {
    title: !page || slug === 'home' ? brand : `${page.title} | ${brand}`,
    description: page?.metaDescription ?? undefined,
    icons: icon ? [{ url: icon.src }] : undefined,
  }
}

export default async function Page({ params }: Props) {
  const slug = await slugFrom(params)
  const [page, settings, { isEnabled: draft }] = await Promise.all([getPage(slug), getSiteSettings(), draftMode()])

  if (!page) {
    if (slug === 'home') {
      return (
        <main className="section-container">
          <h2>No home page yet</h2>
          <p>
            Run <code>pnpm seed</code> to import the current site, or create a page with the slug
            &quot;home&quot; in <a href="/admin">/admin</a>.
          </p>
        </main>
      )
    }
    notFound()
  }

  const logo = toImage(settings.logo)
  const isHome = slug === 'home'

  return (
    <>
      {draft && (
        <div className="poc-preview-banner">
          Draft preview: you are seeing unpublished changes. <a href="/next/exit-preview">Exit preview</a>
        </div>
      )}
      {draft && <LivePreviewListener />}
      <nav className="nav-bar">
        <div className="logo-area">
          {logo && <img src={logo.src} alt={`${settings.brandName} Logo`} className="site-logo" />}
          {isHome ? (
            <span className="brand-name">{settings.brandName}</span>
          ) : (
            <a href="/" className="brand-name">
              {settings.brandName}
            </a>
          )}
        </div>
        <Button {...page.navButton} />
      </nav>
      <RenderBlocks blocks={page.layout ?? []} />
      {page.showFooter && <SiteFooter settings={settings} />}
    </>
  )
}
