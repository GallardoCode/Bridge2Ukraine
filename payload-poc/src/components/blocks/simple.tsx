import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Page } from '@/payload-types'
import { toImage, toImages } from '@/lib/media'
import { Button, Buttons } from '../Button'
import { Details } from '../Details'

export type LayoutBlock = NonNullable<Page['layout']>[number]
export type BlockOf<T extends LayoutBlock['blockType']> = Extract<LayoutBlock, { blockType: T }>

export const Hero = ({ block, isFirst }: { block: BlockOf<'hero'>; isFirst: boolean }) => {
  const image = toImage(block.image)
  return (
    <header className="hero">
      {image && (
        <img
          src={image.src}
          alt={image.alt}
          className="hero-bg"
          {...(isFirst ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })}
        />
      )}
      <div className="hero-overlay-card">
        <h1>{block.heading}</h1>
        {block.text && <p>{block.text}</p>}
        <Button {...block.cta} />
      </div>
    </header>
  )
}

export const Mission = ({ block }: { block: BlockOf<'mission'> }) => (
  <section className="mission-statement">
    <div className="narrow-container">
      {block.eyebrow && <span className="subtitle gold">{block.eyebrow}</span>}
      <h2>{block.heading}</h2>
      {block.text && <p>{block.text}</p>}
      {block.quote && <blockquote className="quote-line">{block.quote}</blockquote>}
    </div>
  </section>
)

export const FeatureCards = ({ block }: { block: BlockOf<'featureCards'> }) => {
  const image = toImage(block.image)
  return (
    <section className="sustainability-section">
      <div className="section-container">
        <div className="sustainability-header">
          {block.eyebrow && <span className="subtitle">{block.eyebrow}</span>}
          <h2>{block.heading}</h2>
          {block.lead && <p className="sustainability-lead">{block.lead}</p>}
        </div>
        <div className="sustainability-grid">
          {block.cards?.map((card, i) => (
            <div className="sustainability-card" key={card.id ?? i}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
          ))}
        </div>
        {image && (
          <div className="sustainability-infographic-wrapper">
            <img src={image.src} alt={image.alt} className="sustainability-infographic-img" loading="lazy" />
          </div>
        )}
      </div>
    </section>
  )
}

export const WorkGallery = ({ block }: { block: BlockOf<'workGallery'> }) => (
  <section className="our-work-section">
    <div className="section-container split-layout vertical-centre">
      <div className="split-text">
        {block.eyebrow && <span className="subtitle">{block.eyebrow}</span>}
        <h2>{block.heading}</h2>
        {block.body && <RichText data={block.body} disableContainer />}
      </div>
      <div className="photo-grid">
        {toImages(block.images).map((img) => (
          <img key={img.src} src={img.src} alt={img.alt} loading="lazy" />
        ))}
      </div>
    </div>
  </section>
)

export const Stats = ({ block }: { block: BlockOf<'stats'> }) => {
  const map = toImage(block.mapImage)
  return (
    <section className="numbers-section">
      <div className="section-container">
        <div className="journey-header">
          {block.eyebrow && <span className="subtitle">{block.eyebrow}</span>}
          <h2>{block.heading}</h2>
          {block.lead && <p className="journey-lead">{block.lead}</p>}
        </div>
        <div className="infographic-grid bento-journey-layout">
          {map && (
            <div className="info-card bento-map">
              <img src={map.src} alt={map.alt} className="journey-map" loading="lazy" />
            </div>
          )}
          {block.items?.map((item, i) => (
            <div className={`info-card metric-card${item.highlight ? ' highlight' : ''}`} key={item.id ?? i}>
              <span className="stat-number">{item.value}</span>
              <span className="stat-label">{item.label}</span>
              {item.description && <p className="stat-desc">{item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const ActionCentre = ({ block }: { block: BlockOf<'actionCentre'> }) => (
  <section id={block.anchor || undefined} className="action-centre-section">
    <div className="section-container">
      {block.eyebrow && <span className="subtitle">{block.eyebrow}</span>}
      <h2>{block.heading}</h2>
      <div className="top-actions-grid">
        {block.cards?.map((card, i) => (
          <div className="action-panel-card" key={card.id ?? i}>
            <h3>{card.title}</h3>
            {card.body && <RichText data={card.body} disableContainer />}
            {card.perks && (
              <div className="perks-sub-box">
                <RichText data={card.perks} disableContainer />
              </div>
            )}
            <Button {...card.link} />
          </div>
        ))}
      </div>
      {block.banner?.title && (
        <div className="bottom-full-action bank-donation-block">
          <div className="full-action-content">
            <h3>{block.banner.title}</h3>
            {block.banner.text && <p>{block.banner.text}</p>}
          </div>
          <div className="bank-action-buttons">
            {block.banner.buttons?.map((b, i) => <Button key={b.id ?? i} {...b} />)}
          </div>
        </div>
      )}
    </div>
  </section>
)

export const ImageContent = ({ block }: { block: BlockOf<'imageContent'> }) => {
  const image = toImage(block.image)
  return (
    <div className={`split-layout${block.centred === false ? '' : ' vertical-center'}`}>
      <div className="donation-hero-image">{image && <img src={image.src} alt={image.alt} />}</div>
      <div className={block.boxed ? 'split-text donation-box' : 'donation-text-content'}>
        {block.eyebrow && <span className="subtitle">{block.eyebrow}</span>}
        <h2 className={block.boxed ? undefined : 'donation-heading'}>{block.heading}</h2>
        {block.intro && (
          <div className="rich-body">
            <RichText data={block.intro} disableContainer />
          </div>
        )}
        {block.detailsStyle === 'plain' ? (
          <div className="contact-block">
            {block.detailsIntro && <p>{block.detailsIntro}</p>}
            <Details lines={block.details} />
          </div>
        ) : (
          <>
            {block.detailsIntro && <p>{block.detailsIntro}</p>}
            <Details lines={block.details} className="bank-details-subcard" />
          </>
        )}
        {block.body && (
          <div className="rich-body">
            <RichText data={block.body} disableContainer />
          </div>
        )}
      </div>
    </div>
  )
}

export const ButtonRow = ({ block }: { block: BlockOf<'buttonRow'> }) => (
  <div className={`narrow-container button-row${block.divider ? ' donation-extra-actions' : ''}`}>
    {block.intro && <p>{block.intro}</p>}
    <Buttons buttons={block.buttons} />
  </div>
)

export const CentredIntro = ({ block }: { block: BlockOf<'centredIntro'> }) => (
  <div className="volunteer-hero">
    <h2>{block.heading}</h2>
    {block.text && <p>{block.text}</p>}
    <Details lines={block.details} className="volunteer-contact-info" />
    <Buttons buttons={block.buttons} />
  </div>
)

export const ImageGallery = ({ block }: { block: BlockOf<'imageGallery'> }) => (
  <div className="volunteer-gallery">
    {toImages(block.images).map((img) => (
      <div className="volunteer-card" key={img.src}>
        <img src={img.src} alt={img.alt} />
      </div>
    ))}
  </div>
)
