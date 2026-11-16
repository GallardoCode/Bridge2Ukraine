import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'
import type { Page, Story } from '@/payload-types'
import { b, doc, h3, p, ul } from './lexical'

/*
 * PROTOTYPE seed: transcribes the static site (../index.html, donate.html,
 * donate_items.html, volunteer.html) into Payload and uploads the photos it uses.
 * It deletes all pages, stories and partners first. Never point it at a database
 * you care about.
 */

const INSTAGRAM = 'https://instagram.com/bridge2ukraine'
const JOURNEY_FORM = 'https://forms.gle/GoeZKSNozrZ6TJbSA'

type StorySeed = Omit<Story, 'id' | 'media' | 'poster' | 'updatedAt' | 'createdAt'> & {
  file?: string
  alt?: string
  posterFile?: string
}

const photo = (file: string, size: Story['size'], alt: string, caption: string): StorySeed => ({
  kind: 'photo', title: caption, file, alt, caption, size,
})
const video = (file: string, posterFile: string, size: Story['size'], caption: string): StorySeed => ({
  kind: 'video', title: `Video: ${caption}`, file, posterFile, alt: caption, caption, size,
})
const fact = (heading: string, text: string, colour: 'yellow' | 'blue'): StorySeed => ({
  kind: 'fact', title: `Card: ${heading}`, heading, text, colour, size: 'small-square',
})

// Same order as index.html. The first seven are visible before "View All Stories".
const stories: StorySeed[] = [
  video('stories-school_bomb_shelter-landscape.mov', 'stories-school_bomb_shelter-thumbnail.webp', 'wide', '"Thank you for the comfortable sleep, warmth and a cosy bomb shelter. THANK YOU!"'),
  fact('Mirrors', 'Mirrors donated by hotels are now being used in rehabilitation centres to help soldiers learn to walk again.', 'yellow'),
  photo('stories-Mum Receiving a baby care package-portrait.webp', 'tall', 'Mother receiving a baby care package', 'Mum receiving a baby care package.'),
  photo('stories-Hospitals receiving donations-landscape.webp', 'wide', 'Hospitals receiving medical supply donations', 'Hospitals receiving donations'),
  photo('stories-Kid receiving sweets and clothes-square.webp', 'large-square', 'Child receiving sweets and clothing', 'Kid receiving sweets and clothes'),
  video('stories-ukraninan volunteers receiving donations.mov', 'stories-ukraninan volunteers receiving donations.webp', 'tall', 'Ukrainian volunteers receiving donations in Kyiv'),
  fact('Mini Fridges', 'Mini fridges donated by hotels are being used to store medical supplies in evacuation centres.', 'blue'),
  photo('stories-hospital staff receiving supplies-square.webp', 'small-square', 'Hospital staff receiving medical supplies', 'Hospital staff receiving supplies'),
  photo('stories-basic care package for this baby-landscape.webp', 'wide', 'Baby receiving basic care package', 'Basic care package for this baby'),
  photo('stories-kid reading an english book-portrait.webp', 'tall', 'Child reading an English book', 'Kid reading an English book'),
  photo('stories-family receiving basic aid-square.webp', 'small-square', 'Family receiving humanitarian aid', 'Family receiving basic aid'),
  fact('Hotel Safes', 'Hotel safes donated by corporate partners provide privacy for soldiers on the front lines.', 'blue'),
  video('stories-thank you from a kid-portrait.mov', 'stories-thank you from a kid-thumbnail.webp', 'tall', '"Thank you for this! Wishing you well"'),
  photo('stories-kids playing with weights donated by a UK gym-portrait.webp', 'tall', 'Children playing with gym weights', 'Kids playing with weights donated by a UK gym'),
  photo("stories-kids reading english children's books donated-portrait.webp", 'tall', 'Children reading donated English books', "Kids reading English children's books donated"),
  fact('Warm Clothing', 'As winter approaches, warm clothing donations are crucial for those in Ukraine as power stations are targeted and heating is limited.', 'yellow'),
  photo('stories-kids receiving presents-square.webp', 'large-square', 'Children receiving gifts', 'Kids receiving presents'),
  photo('stories-kids reciving PE kit-square.webp', 'small-square', 'Children receiving PE equipment', 'Kids receiving PE kits'),
  photo('stories-kids using donated gym equipment-landscape.webp', 'wide', 'Children using exercise equipment', "Kids using donated David Lloyd's gym equipment"),
  photo('stories-kids reading books.webp', 'tall', 'Children reading books donated by UK schools', 'Children reading books donated by UK schools'),
  photo('stories-little boy receiving clothes-portrait.webp', 'tall', 'Young boy receiving donated clothes', 'Little boy receiving clothes'),
  photo('stories-little girl so happy to recieve UK chocolates-square.webp', 'small-square', 'Young girl happy with chocolates', 'Little girl happy to receive UK chocolates'),
  photo('stories-old lady receiving incontinence underwear-portrait.webp', 'tall', 'Elderly woman receiving healthcare supplies', 'Old lady receiving incontinence underwear'),
  photo('stories-Rehabilitation centres receiving exercise equipment-square.webp', 'large-square', 'Rehabilitation centres receiving exercise equipment', 'Rehabilitation centres receiving exercise equipment'),
  photo('stories-rehabilitation centre for soldiers-landscape.webp', 'wide', 'Soldiers using exercise equipment in rehabilitation', 'Gym equipment used in rehabilitation centre for the soldiers'),
  photo('stories-school kids getting sweets-landscape.webp', 'wide', 'School children receiving sweets', 'School kids getting sweets'),
  photo('stories-soldier receiving aid from UK-portrait.webp', 'tall', 'Ukrainian soldier receiving aid', 'Soldier receiving aid from UK'),
  photo('stories-grandma and granddaughter reciving aid-portrait.webp', 'tall', 'Grandmother and granddaughter receiving aid', 'Grandma and granddaughter receiving aid'),
  photo('stories-soldiers receiving aid and food-portrait.webp', 'tall', 'Group of soldiers receiving food packages', 'Soldiers receiving aid and food'),
  photo('stories-soldiers receiving sweets in hospital-square.webp', 'tall', 'Injured soldiers receiving sweets in hospital', 'Soldiers receiving sweets in hospital'),
  video('stories-thank you from children-landscape.mov', 'stories-thank you from children-thumbnail.webp', 'small-square', '"Thank you!"'),
  photo('stories-Kid reciving British snacks-portrait.webp', 'tall', 'Child holding British snacks', 'Kid receiving British snacks'),
  photo('stories-lady receiving blankets, towels and basic humanitarian aid-portrait.webp', 'tall', 'Woman receiving blankets and supplies', 'Lady receiving blankets, towels and basic humanitarian aid'),
]

const partners: [file: string, name: string][] = [
  ['partner-NHS.webp', 'NHS Supply Chain'],
  ['partner-St_John_Ambulance.webp', 'St John Ambulance'],
  ['partner-British-Ukrainian_Aid.webp', 'British Ukrainian Aid'],
  ['partner-Alliance_for_Better_Care.webp', 'Alliance for Better Care'],
  ['partner-Charity_Foundation_Legit.webp', 'Foundation Legit'],
  ['partner-First_Demolition_Services.webp', 'First Demolition'],
  ['partner-St.Gertrudes_Catholic_Church.webp', "St Gertrude's Catholic Church"],
  ['partner-Marlborough_House_Vinehall.webp', 'Marlborough House Vinehall'],
  ['partner-Frasers_Hospitality.webp', 'Frasers Hospitality'],
]

type PageData = Omit<Page, 'id' | 'updatedAt' | 'createdAt'>

export type SeedOptions = {
  photosDir: string
  log?: (message: string) => void
  /** Skip the five videos (about 90 MB) for faster test runs. */
  skipVideos?: boolean
}

export async function seed(payload: Payload, { photosDir, log = () => {}, skipVideos = false }: SeedOptions) {
  const req = { payload } // run as the system (overrideAccess is the default for the Local API)

  // Media is kept and reused by filename: deleting it would break required
  // references such as the site logo, which Postgres (rightly) refuses.
  log('Clearing pages, stories and partners…')
  for (const collection of ['pages', 'stories', 'partners'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } } })
  }

  const existing = await payload.find({ collection: 'media', limit: 0, pagination: false, depth: 0 })
  const mediaIds = new Map<string, number>(
    existing.docs.flatMap((m) => (m.filename ? [[m.filename, m.id] as const] : [])),
  )
  const upload = async (file: string, alt: string) => {
    const known = mediaIds.get(file)
    if (known) return known
    const filePath = path.join(photosDir, file)
    if (!fs.existsSync(filePath)) throw new Error(`Missing photo: ${filePath}`)
    const doc = await payload.create({ collection: 'media', data: { alt }, filePath })
    mediaIds.set(file, doc.id)
    return doc.id
  }

  log('Uploading media…')
  const logo = await upload('logo.webp', 'Bridge2Ukraine Logo')
  const emblem = await upload('logo-stamp.webp', 'Aid Ukraine Logo Emblem')

  log('Creating stories…')
  const storyIds: number[] = []
  for (const s of stories) {
    if (skipVideos && s.kind === 'video') continue
    const { file, alt, posterFile, ...data } = s
    const created = await payload.create({
      collection: 'stories',
      data: {
        ...data,
        media: file ? await upload(file, alt ?? data.title) : null,
        poster: posterFile ? await upload(posterFile, `${alt ?? data.title} (poster)`) : null,
      },
    })
    storyIds.push(created.id)
  }

  log('Creating partners…')
  const partnerIds: number[] = []
  for (const [file, name] of partners) {
    const created = await payload.create({ collection: 'partners', data: { name, logo: await upload(file, name) } })
    partnerIds.push(created.id)
  }

  log('Updating site settings…')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      brandName: 'Bridge2Ukraine',
      logo,
      footer: {
        emblem,
        tagline: 'Powering frontline resilience.\nDiverting logistics waste.',
        contactHeading: 'Contact Us',
        contacts: [
          { label: 'Email', value: 'admin@bridge2ukraine.org' },
          { label: 'Phone', value: '(+44) 079 7747 4326' },
        ],
        copyright: '© 2026 Bridge2Ukraine',
      },
    },
  })

  const ourWork = { label: 'Our Work', url: '/', appearance: 'primary' as const, newTab: false }

  const home: PageData = {
    title: 'Home',
    slug: 'home',
    _status: 'published',
    showFooter: true,
    navButton: { label: 'Donate', url: '#donate', appearance: 'primary', newTab: false },
    layout: [
      {
        blockType: 'hero',
        image: await upload('hero-children-landscape.webp', 'Children receiving donated aid in Ukraine'),
        heading: 'Repurposing UK Surplus into Life Changing Aid for Ukraine',
        text: 'We help UK organisations donate surplus goods, delivering resources directly to families navigating the hardships of war.',
        cta: { label: 'Ways to Support', url: '#donate', appearance: 'white', newTab: false },
      },
      {
        blockType: 'mission',
        eyebrow: 'The Mission',
        heading: 'Millions of Ukrainians have been displaced, needing safety and basic necessities.',
        text: 'We help Ukrainian hospitals, schools, bomb shelters, rehabilitation centres and people rebuilding their lives, whilst also ensuring many tonnes of quality UK surplus are diverted from landfill.',
        quote: '“Every item helps rebuild lives”',
      },
      {
        blockType: 'featureCards',
        eyebrow: 'Circular Aid & Sustainability',
        heading: 'Turning Corporate Surplus into Humanitarian Aid',
        lead: 'With over 32% of UK landfill waste coming from structural and commercial clearance sectors, the push toward a circular economy is more urgent than ever. Bridge2Ukraine offers businesses an immediate, practical way to participate in circular reuse.',
        cards: [
          { title: 'Zero to Landfill', text: 'Divert heavy commercial clearances, furniture, and medical equipment from incineration and landfill, directly lowering your operational carbon emissions.' },
          { title: 'Verified ESG Reporting', text: 'Receive audited metrics and Green Certificates for every donation, detailing exact tonnage diverted to support your corporate ESG reporting.' },
          { title: 'Tax & Cost Efficiency', text: 'Deduct the value of donated goods from total profits before corporation tax, converting disposal costs into tangible tax savings and societal impact.' },
        ],
        image: await upload('sustainability - infographic - how it works for UK businesses.webp', 'Infographic showing how Bridge2Ukraine works for UK businesses'),
      },
      {
        blockType: 'storiesMosaic',
        heading: 'Stories of Impact',
        stories: storyIds,
        initialCount: 7,
        buttonLabel: 'View All Stories',
      },
      {
        blockType: 'workGallery',
        eyebrow: 'Our Work',
        heading: 'Collecting & Delivering Aid',
        body: doc(
          p('We are a group of British and Ukrainian volunteers partnering with local communities, schools, medical centres, gyms, and hotels across the UK to collect donations.'),
          p('Items are systematically sorted at our South England hub, securely packed, and dispatched straight to Ukraine.'),
          p('We partner with small, trusted Ukrainian charities in Kyiv, Odesa, and Sumy, which make the final delivery to communities closer to the frontline.'),
        ),
        images: [
          await upload('our_work-packed_lorry_ready_to_set_off_to_Ukraine-landscape.webp', 'Packed lorry ready to set off'),
          await upload('our_work-packing the lorry-landscape.webp', 'Volunteers packing the vehicle'),
          await upload('our_work-Tony moving the pallets-square.webp', 'Tony moving pallets with aid supplies'),
          await upload('our_work-late_nights_paking_the_van.webp', 'Volunteers packing the van late at night'),
        ],
      },
      {
        blockType: 'stats',
        eyebrow: 'Our Work So Far',
        heading: 'The Journey of Aid',
        lead: 'From South England packing hubs to the frontline communities of Kyiv, Odesa, and Sumy, every cargo transforms corporate surplus into immediate relief.',
        mapImage: await upload('journey-map uk to ukraine-square.webp', 'Map of the supply route from UK to Ukraine'),
        items: [
          { value: '69', label: 'Direct Cargos Delivered', description: 'Direct logistics trucks sent across Europe into frontline regions.', highlight: false },
          { value: '590 Tonnes', label: 'Landfill Waste Diverted', description: 'Commercial-grade equipment and textiles saved from UK disposal.', highlight: false },
          { value: '£370,000+', label: 'Value Provided', description: 'Delivered directly to hospitals, shelters, and families.', highlight: true },
        ],
      },
      { blockType: 'partners', title: 'Our UK & Ukrainian Partners', partners: partnerIds },
      {
        blockType: 'actionCentre',
        anchor: 'donate',
        eyebrow: 'How Can You Help?',
        heading: 'Support Our Mission',
        cards: [
          {
            title: 'Donate Items',
            body: doc(p('Divert heavy, high-quality institutional surplus from UK landfill straight to frontline communities.')),
            perks: doc(
              ul(
                ['💼 Deduct the value of donated items from total profits before calculating ', b('corporation tax'), '.'],
                ['🌱 Receive a verified ', b('green certificate'), ' detailing your precise landfill diversion metrics for ESG reporting.'],
              ),
            ),
            link: { label: 'Donate Items', url: '/donate-items', appearance: 'outline', newTab: false },
          },
          {
            title: 'Volunteer',
            body: doc(
              p('Organise a corporate team-building shift or join as an individual at our South East England packing hub. Heavy sorting and processing work that creates instant real human impact.'),
              p('Or simply come along to one of our regular packing Saturday sessions in Croydon!'),
            ),
            link: { label: 'Volunteer', url: '/volunteer', appearance: 'outline', newTab: false },
          },
        ],
        banner: {
          title: 'Donate',
          text: 'Every £5,500 raised completely finances fuel, channel tolls, and customs documentation to route a multi-ton supply truck trip directly into Ukraine.',
          buttons: [{ label: 'Sponsor a Journey', url: '/donate', appearance: 'yellow', newTab: true }],
        },
      },
    ],
  }

  const donate: PageData = {
    title: 'Donate',
    slug: 'donate',
    _status: 'published',
    showFooter: false,
    navButton: ourWork,
    layout: [
      {
        blockType: 'imageContent',
        image: await upload('our_work-packed_lorry_ready_to_set_off_to_Ukraine-landscape.webp', 'Packed lorry ready to set off'),
        eyebrow: 'Direct Bank Transfer',
        heading: 'Donate',
        intro: doc(p('Every £5,500 raised completely finances fuel, channel tolls, and customs documentation to route a multi-ton supply truck trip directly into Ukraine.')),
        details: [
          { label: 'Bank', value: 'Zempler' },
          { label: 'Account Name', value: 'Bridge2Ukraine CIC' },
          { label: 'Account No', value: '15150103' },
          { label: 'Sort Code', value: '08-71-99' },
        ],
        detailsStyle: 'card',
        boxed: true,
      },
      {
        blockType: 'buttonRow',
        intro: 'Want to track where your money goes?',
        divider: true,
        buttons: [
          { label: 'Get Journey Updates', url: JOURNEY_FORM, appearance: 'yellow', newTab: true },
          { label: 'Follow Our Work on Instagram', url: INSTAGRAM, appearance: 'outline', newTab: true },
        ],
      },
    ],
  }

  const donateItems: PageData = {
    title: 'Donate Items',
    slug: 'donate-items',
    _status: 'published',
    showFooter: false,
    navButton: ourWork,
    layout: [
      {
        blockType: 'imageContent',
        image: await upload('our_work-late_nights_paking_the_van.webp', 'Volunteers packing the van late at night'),
        heading: 'Donate Items',
        detailsIntro: 'Get in touch with us:',
        details: [
          { label: 'Phone', value: '079 7747 4326' },
          { label: 'Email', value: 'sachauk@gmail.com' },
        ],
        detailsStyle: 'plain',
        boxed: false,
        centred: false,
        body: doc(
          h3('We are accepting:'),
          ul(['Clothing'], ['Food'], ['Medical supplies'], ['Hygiene products'], ['Blankets and bedding'], ['Furniture'], ['Items to help rebuild everyday life']),
        ),
      },
      {
        blockType: 'buttonRow',
        divider: false,
        buttons: [
          { label: 'Follow Our Work', url: INSTAGRAM, appearance: 'primary', newTab: true },
          { label: 'Get Journey Updates', url: JOURNEY_FORM, appearance: 'yellow', newTab: true },
        ],
      },
    ],
  }

  const volunteer: PageData = {
    title: 'Volunteer',
    slug: 'volunteer',
    _status: 'published',
    showFooter: false,
    navButton: ourWork,
    layout: [
      {
        blockType: 'centredIntro',
        heading: 'Volunteer with Us',
        text: 'If you would like to volunteer with Bridge2Ukraine, get in touch or message us directly on social media. We would love to have you on board.',
        details: [
          { label: 'Email', value: 'sachauk@gmail.com' },
          { label: 'WhatsApp', value: '079 7747 4326' },
        ],
        buttons: [
          { label: 'Get in Touch', url: 'mailto:sachauk@gmail.com?subject=Volunteering Enquiry', appearance: 'yellow', newTab: false },
          { label: 'Message on Instagram', url: INSTAGRAM, appearance: 'outline', newTab: true },
        ],
      },
      {
        blockType: 'imageGallery',
        images: [
          await upload('our_work-UK Volunteers-portrait.webp', 'UK Volunteers prep packing materials'),
          await upload('our_work-Loading the van (mascot for the journey)-square.webp', 'Volunteers loading the transport van with team mascot'),
          await upload('our_work-Volunteers loading cardo 63-portrait.webp', 'UK Volunteers loading cargo 63 heading to Sumy'),
        ],
      },
    ],
  }

  log('Creating pages…')
  for (const page of [home, donate, donateItems, volunteer]) {
    // blockName labels each row in the admin's Layout list (otherwise "Untitled").
    const layout = page.layout?.map((block) => ({
      ...block,
      blockName: 'heading' in block && block.heading ? block.heading : 'title' in block ? block.title : null,
    }))
    await payload.create({ collection: 'pages', data: { ...page, layout }, req })
  }

  log(`Done: ${mediaIds.size} media, ${storyIds.length} stories, ${partnerIds.length} partners, 4 pages.`)
  return { storyIds, partnerIds }
}
