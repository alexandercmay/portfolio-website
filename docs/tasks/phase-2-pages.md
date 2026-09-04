# Phase 2 — Pages

**Goal:** every route renders real data from the content collections. Still using
fixture content.

Reference: `03-information-architecture.md`.

---

## 2.1 Composite components

- [ ] `ProjectCard` — title, tagline, stack chips, status badge; **must look
      right with no cover image** (you will eventually post one without)
- [ ] `UpdateEntry` — date, project badge, title, summary; visual weight varies
      by `kind`
- [ ] `FeedList`
- [ ] `StackChips` — renders taxonomy keys as labels, each linking to
      `/stack/:tech`
- [ ] `DevlogList` — reverse-chronological, `<details>` for "show all", no JS
- [ ] `ResumeSection`, `Timeline`
- [ ] Empty states for every list, each saying what to do next

## 2.2 Landing page (`/`)

The 30-second page. Build it deliberately.

- [ ] Above the fold: name, one-line headline, 2–3 sentences, **View resume** +
      **Email me**
- [ ] Verify on a 375px viewport that all of the above fits without scrolling
- [ ] Featured projects — 3 cards
- [ ] Recent activity — 4 most recent feed entries
- [ ] Skills at a glance — grouped chips linking to `/stack/:tech`
- [ ] No animation, no hero image, nothing delaying first paint
- [ ] **Verify the built HTML ships zero JavaScript** beyond the inline theme
      script

## 2.3 Projects index (`/projects`)

- [ ] Grid: `featured` + `weight` first, then most recently updated
- [ ] Static filter links by status and technology (real URLs, not a JS widget)
- [ ] Status visible on every card, so unfinished work reads as unfinished

## 2.4 Stack pages (`/stack/:tech`)

- [ ] `getStaticPaths()` from `getStackUsage()`
- [ ] Show projects and work roles using that technology
- [ ] Per-page title and description — "Alexander May — PyTorch" is a real page
      a search engine can return
- [ ] Verify every chip across the site links here correctly
- [ ] Confirm a technology with no usage doesn't generate an empty page

## 2.5 Project detail (`/projects/:slug`)

- [ ] Header: title, tagline, status, period, role
- [ ] Link buttons: repo / live / writeup / video
- [ ] Stack chips → `/stack/:tech`
- [ ] MDX overview in a `Prose` container at 68ch
- [ ] Devlog section via `DevlogList`
- [ ] Related projects by shared stack/tags
- [ ] `getStaticPaths()` generates one page per project

## 2.6 Update detail (`/projects/:slug/:update`)

- [ ] Breadcrumb back to the parent project
- [ ] Date, kind, title, MDX body
- [ ] Prev/next within the same project
- [ ] `getStaticPaths()` generates one page per update

## 2.7 Feed (`/feed`)

- [ ] Updates + standalone posts, merged, date-descending
- [ ] Project badge on entries belonging to a project
- [ ] Static filter links by project and tag
- [ ] Dense, log-like layout — the one page where density is the goal

## 2.8 Resume (`/resume`)

- [ ] Render from `content/resume.ts`
- [ ] **Download PDF** button at the top (placeholder file; generation is Phase 4)
- [ ] Work, education, skills, selected projects
- [ ] Role stack entries link to `/stack/:tech`
- [ ] Print stylesheet producing a clean Cmd-P result
- [ ] `schema.org/Person` JSON-LD

## 2.9 About (`/about`)

- [ ] MDX-backed long-form page
- [ ] One photo via `astro:assets`, correct dimensions, real `alt`

## 2.10 Search (`/search`)

- [ ] Add Pagefind as a post-build step over `dist/`
- [ ] Search page mounting the Pagefind UI
- [ ] Style it to match the design system
- [ ] Verify content inside MDX components is indexed
- [ ] Confirm nothing loads until the user interacts

## 2.11 Checks

- [ ] Every route present in `dist/` as real HTML
- [ ] Every page has a unique `<title>` and meta description
- [ ] **Audit built output for unexpected `<script>` tags** — grep `dist/`
- [ ] Keyboard-navigate the whole site start to finish
- [ ] 375px and 1440px both pass
- [ ] No console errors
- [ ] Run Lighthouse locally; expect 100 performance on the static pages

---

**Exit criteria:** all routes render fixture content correctly, stack pages and
search work, the site is keyboard-navigable, and the surface pages ship no
JavaScript. Ready for real content.
