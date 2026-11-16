import { populated, populatedList } from '@/lib/media'
import type { BlockOf } from './simple'

export const Partners = ({ block }: { block: BlockOf<'partners'> }) => {
  const logos = populatedList(block.partners).flatMap((p) => {
    const logo = populated(p.logo)
    return logo?.url ? [{ id: p.id, src: logo.url, name: p.name }] : []
  })
  // The track holds the logos twice; the CSS animation scrolls by 50% for a seamless loop.
  return (
    <section className="partners-carousel-section">
      <div className="partners-title">{block.title}</div>
      <div className="carousel-wrapper">
        <div className="carousel-track">
          <div className="group">
            {logos.map((l) => (
              <div className="partner-logo" key={l.id}>
                <img src={l.src} alt={l.name} loading="lazy" />
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="group">
            {logos.map((l) => (
              <div className="partner-logo" key={l.id}>
                <img src={l.src} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
