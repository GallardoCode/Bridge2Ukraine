import type { SiteSetting } from '@/payload-types'
import { toImage } from '@/lib/media'

export const SiteFooter = ({ settings }: { settings: SiteSetting }) => {
  const { footer, brandName } = settings
  const emblem = toImage(footer?.emblem)
  return (
    <footer className="credentials-footer">
      <div className="section-container footer-layout">
        <div className="footer-left-brand">
          {emblem && (
            <div className="large-circle-logo">
              <img src={emblem.src} alt={emblem.alt} />
            </div>
          )}
          <h3>{brandName}</h3>
          {footer?.tagline && (
            <p>
              {footer.tagline.split('\n').map((line, i, all) => (
                <span key={i}>
                  {line}
                  {i < all.length - 1 && <br />}
                </span>
              ))}
            </p>
          )}
        </div>
        <div className="footer-right-contact">
          {footer?.contactHeading && <h4>{footer.contactHeading}</h4>}
          {footer?.contacts?.map((c, i) => (
            <p className="contact-line" key={c.id ?? i}>
              {c.label}: <strong>{c.value}</strong>
            </p>
          ))}
        </div>
      </div>
      {footer?.copyright && <div className="footer-bottom-meta">{footer.copyright}</div>}
    </footer>
  )
}
