# Architecture, editorial workflow and trade-offs

## Starting point

The live site is four hand-written HTML files, one `style.css`, a `photos/`
folder and 40 lines of inline JavaScript (play videos on hover, "View All
Stories"). There's no build step and no package dependencies. GitHub Pages
serves it from the repository root.

Any content change means editing HTML, so only someone comfortable with Git can
update the site. That's what the CMS is for.

## Why Payload inside Next.js

Payload 3 is a Next.js app. The admin, the REST/GraphQL API and the public site
all run in one Node process and one container. Pages read content through
Payload's Local API, which is a function call into the same process, not an
HTTP request.

I considered two alternatives:

- **Payload as a headless API with the static HTML filled in at build time.**
  This keeps GitHub Pages, but it needs a second build pipeline, a webhook to
  rebuild on publish, and a separate setup for draft previews. That's more
  moving parts than the site justifies.
- **Another CMS.** That wasn't the question being asked.

Porting to React was cheap. The HTML maps almost 1:1 to JSX, and the inline
script became two small client components. `style.css` is copied in unchanged
(`src/app/(frontend)/site.css`). The inline `<style>` blocks from
`donate.html` and `volunteer.html` moved to `page-sections.css`, scoped so they
can't leak onto the home page.

Next.js versions: Payload 3.93 (latest stable on npm at the time, 2026-11)
with Next.js 16.4. Payload 4 is in beta and its templates on `main` already use
it. Upgrading should be a separate step once 4.0 is released.

## Content model

```text
Pages ──layout──▶ [ blocks … ]          one ordered list of sections per page
  │                 ├─ storiesMosaic ──relationship──▶ Stories ──▶ Media
  │                 ├─ partners ───────relationship──▶ Partners ─▶ Media
  │                 └─ hero, mission, stats, … ──upload──▶ Media
  └─ navButton, showFooter, metaDescription

SiteSettings (global): brand name, logo, footer contacts
```

**Pages** have a `slug` (`home` is `/`, everything else is `/<slug>`), a
`layout` field of blocks, and page settings. The old URLs (`/donate.html` and
so on) redirect permanently to the new ones.

**Blocks** are the reusable sections. Each one matches a section of the
original HTML and renders with the original class names:

| Block | Original section | Used on |
| --- | --- | --- |
| Hero | hero image with blue card | home |
| Mission statement | dark "The Mission" band | home (test: volunteer) |
| Feature cards | sustainability cards + infographic | home |
| Stories mosaic | "Stories of Impact" grid + View All | home |
| Text with photo grid | "Our Work" | home |
| Journey stats | map + metric cards | home |
| Partner logos | scrolling carousel | home |
| Ways to help | action cards + donate banner | home |
| Image with text | split image/text | donate, donate items |
| Button row | buttons with optional intro line | donate, donate items |
| Centred intro | volunteer heading, contacts, buttons | volunteer |
| Image gallery | three-photo grid | volunteer |

Any block can go on any page, in any order, any number of times.

**Stories** and **Partners** are collections, not block content. A story is a
photo, a video or a coloured text card, plus its grid size. The Stories mosaic
block holds an ordered list of references to stories. Editors reorder stories by
dragging them in that list, and a story edited in the library updates every
page that shows it. Partners work the same way for the logo carousel.

**Rich text** (Lexical) appears where the original had paragraphs, lists or
bold text: the "Our Work" body, the action cards and the donate pages. The rest
are plain fields. That limits how much can go wrong in the layout.

**Media** is one upload collection for images and videos. Files sit on local
disk (a Docker volume in production). Videos stream with HTTP range requests, so
seeking works.

## Editorial workflow

1. An editor logs in at `/admin`.
2. They open a page and edit fields or blocks. Payload autosaves to a **draft**
   every few hundred milliseconds. The live site doesn't change.
3. With **Live Preview** on, the right-hand pane shows the real page rendered
   from the draft, at mobile, tablet or desktop width. The pane is the actual
   frontend in Next.js draft mode, so the preview and the published page match
   exactly.
4. **Publish changes** makes the draft live. The next request serves it; there
   is no cache to clear.
5. **Versions** keeps the last 25 versions per page. Editors can compare and
   restore them.

Draft mode is turned on by `/next/preview`, which first checks for a valid
admin session. Anonymous visitors get a 403. A page that was never published is
invisible to the public through access control. The integration tests cover
both.

## How changes reach the site

Every public page renders on each request (`dynamic = 'force-dynamic'`). In the
dev server a page took 50 to 100 ms to render, database included, and a
published change shows up on the next page load.

## Trade-offs and known gaps

- **Per-request rendering instead of static pages.** It's simple and always
  fresh, and `next build` never needs a database, which keeps the Docker build
  self-contained. The cost is a database query per page view. That's fine at
  this site's traffic. If it ever matters, add `revalidatePath` in an
  `afterChange` hook and drop `force-dynamic`.
- **No image resizing.** The photos are already WebP. The admin shows full-size
  images, and pages serve the originals. Payload's `sharp` integration would
  add generated sizes and `srcset` later.
- **`.mov` videos.** They're served as uploaded, same as today. Safari plays
  them; some Chrome/Firefox builds may not, depending on the codec. That's an
  existing issue, not one the CMS introduced. Uploading MP4 would fix it.
- **One editor role.** Every logged-in user can do everything. Payload supports
  roles through access functions when needed.
- **No email.** Password reset emails go to the server log. Add a Payload email
  adapter (SMTP) before inviting editors.
- **The seed duplicates content.** It's a one-off import of the HTML. After the
  first production deploy, the CMS is the source of truth.
- **`style.css` exists twice** while both sites live side by side. If the CMS
  replaces the static site, delete the root copy.

## Things the prototype surfaced

- **Deleting media that a required field still uses fails, and the file
  deletion isn't rolled back.** Postgres refuses to null the site logo, so the
  database transaction rolls back, but Payload has already removed the file
  from disk. Back up the database and media together and restore them together
  (the scripts do).
- **Required fields stay nullable in the database when drafts are enabled.**
  Drafts must be savable while incomplete, so "required" is enforced on
  publish, not by Postgres.
- **Never restore the local dev database into production.** Dev uses schema
  push. Payload marks such databases, and on production start-up it stops at an
  interactive prompt. In a container with no TTY that becomes a silent
  `exit(0)`. Production data must come from migrations, which is why
  `pnpm content:export` exists.

## Where to go next

- Decide whether the CMS replaces the static site. If so, move the domain from
  GitHub Pages to Plesk and delete the root HTML.
- Add image sizes via `sharp`, and an email adapter.
- Add an editor role that can publish but can't manage users.
- Consider dropping `force-dynamic` for on-demand revalidation if traffic grows.
