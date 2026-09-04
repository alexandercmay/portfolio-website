# Information Architecture

## Routes

All routes are prerendered to static HTML. The **JS** column is the JavaScript
actually shipped to the browser — the number that determines how the site feels.

| Route | Page | JS shipped |
| --- | --- | --- |
| `/` | Landing | **0KB** |
| `/resume` | Resume | **0KB** |
| `/projects` | Project index | **0KB** |
| `/projects/:slug` | Project detail | 0KB, unless it contains an island |
| `/projects/:slug/:update` | Single update | **0KB** |
| `/feed` | All updates merged | **0KB** |
| `/about` | About | **0KB** |
| `/stack/:tech` | Everything using one technology | **0KB** |
| `/search` | Search | Pagefind, loaded on interaction |
| `/404` | Not found | **0KB** |

The only pages that ship JavaScript are ones with a deliberate interactive
island, plus a ~1KB inline theme script. Nothing else has a runtime.

Deliberately absent: tag archives, year archives, pagination. Content volume
doesn't justify them, and each is another page that can look empty.

### `/stack/:tech` — a consequence of the framework choice

In the React plan, "show me everything you built with PyTorch" was a client-side
filter: shipped JS, needed URL state syncing, needed an ARIA live region for
result counts.

With Astro it is a **prerendered page per technology**, generated from
`getStackUsage()` via `getStaticPaths()`. It loads instantly, works without JS,
is independently linkable and shareable, and gets its own social preview. It is
also better for SEO — a real page for "Alexander May PyTorch" rather than a query
string.

This is the single clearest example of the stack change making the site both
simpler and better. Every technology chip on the site links here.

## Navigation

Persistent header, five items maximum:

```
Alexander May          Projects   Writing   Resume   About      [Search]
```

- "Writing" points at `/feed` — friendlier than "Feed" or "Blog," and it doesn't
  promise a publishing cadence.
- Resume is a link, not a dropdown. The PDF download lives on the resume page so
  there is one obvious path.
- Search is a link to `/search`, not a modal. A modal requires JS on every page
  to open it; a link costs nothing. `⌘K` can be added later as a progressive
  enhancement, but not at the cost of the zero-JS property.

Footer: email, GitHub, LinkedIn, and a "last updated" date derived from the most
recent content commit at build time. That timestamp is a quiet but real signal —
a portfolio obviously updated last week reads very differently from one last
touched two years ago.

## Page specifications

### `/` — Landing

The most important page. Its entire job is to answer, above the fold: *who is
this, what do they do, are they relevant to my open role, where is the resume.*

**Above the fold — no scroll, on a phone:**

- Name
- One-line headline: role and focus. Concrete. "Full-stack engineer building AI
  systems" beats "passionate technologist."
- Two or three sentences of context: what you're working on, what you want next
- Two actions: **View resume** (primary), **Email me** (secondary)
- Nothing else. No hero animation, no scroll indicator, no typewriter effect.

**Below the fold:**

1. **Featured projects** — three cards: title, tagline, stack chips, status
2. **Recent activity** — four most recent feed entries, compact. The "actively
   building" signal.
3. **Skills at a glance** — grouped chips, each linking to `/stack/:tech`. Not
   proficiency bars; nobody believes them, and "React 90%" invites a question you
   can't answer.
4. Footer

Ships zero JavaScript. Should be a single HTML document plus CSS and one image.

### `/resume`

Two audiences: recruiters want the PDF to attach to an application; hiring
managers read the web version.

- **Download PDF** button, prominent, at the top. Generated at build time from
  `content/resume.ts`, so it cannot drift from the web version.
- Work, education, skills, selected projects — all from the same data
- Each role's stack entries link to `/stack/:tech`
- Print stylesheet, so Cmd-P produces something clean for anyone who does that
  instead of using the button
- `schema.org/Person` JSON-LD

### `/projects` — Index

- Grid of cards: `featured` and `weight` first, then most recently updated
- Static filter links by status and by technology (each a real URL), rather than
  a JS filter widget
- Every card shows status, so unfinished work is legible as unfinished

### `/projects/:slug` — Project detail

Where a hiring manager decides whether you can build things. Top to bottom:

1. **Title, tagline, status, period, role**
2. **Links**: repo, live, writeup, video — as buttons, immediately visible
3. **Stack chips** → `/stack/:tech`
4. **Overview** (the MDX body). The substantive part: what the problem was, what
   you built, what was hard, what you'd do differently. MDX means a diagram or an
   explainer can sit inline exactly where it explains something.
5. **Devlog** — this project's updates, reverse-chronological. Show the five most
   recent with a link to the rest; a long devlog must not bury the overview.
   Uses `<details>` for expansion — no JavaScript.
6. **Related projects** — shared stack or tags

This is the only route that may ship JavaScript, and only when the MDX body
contains an island.

### `/projects/:slug/:update` — Single update

A focused page for one update, so updates are individually linkable and get their
own social preview. Header links back to the parent project; footer has prev/next
within that project.

### `/feed` — Writing

All updates and standalone posts, merged, reverse-chronological.

- Each entry: date, project badge (if any), title, summary, styled by `kind`
- Static filter links by project and tag
- The one page where visual density is the goal — it should read like a log, not
  a magazine

### `/about`

Longer-form: background, how you got here, how you work, what you want next. One
photo. Read by people who already like your work and are deciding whether they'd
want to work with you — so it should sound like a person, not a LinkedIn summary.

### `/search`

Pagefind over the built HTML. The index is fetched only when someone types, so
the page costs nothing until used. Because Pagefind indexes rendered output, it
covers MDX bodies and component content automatically.

### `/404`

Useful links, not a dead end. Cloudflare Pages serves this automatically.

## URL rules

- Lowercase, hyphenated. No dates in project URLs — dates go stale, slugs
  shouldn't.
- **Slugs are permanent once published.** If one must change, add a redirect in
  `public/_redirects`. A link in an application you sent three weeks ago must
  not 404.
- Every page sets its own `<title>`, meta description, canonical URL, and social
  image.

## Social previews

Generated at build time with `astro-og-canvas` (or Satori) — one image per
project, update, and top-level page, rendered from title and tagline against a
consistent template. 1200×630.

This matters more than it sounds. Your link gets pasted into Slack channels and
ATS notes by people deciding whether to talk to you. A missing or generic preview
wastes the one piece of visual real estate you get in someone else's inbox.
