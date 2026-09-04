# Phase 2 — Pages

**Goal:** every route renders real data from the content collection. Still using
fixture content.

Six routes. Reference: `03-information-architecture.md`.

---

## 2.1 Composite components

- [ ] `ProjectCard` — title, tagline, stack chips, status badge, `updated` date;
      **must look right with no cover image** (you will eventually add one
      without)
- [ ] `ExperienceEntry` — quiet metadata column, `Deck` headline, supporting
      highlights, stack chips
- [ ] `StackChips` — renders taxonomy keys as labels, each linking to
      `/stack/:tech`
- [ ] `SkillsComposition` — grouped typographic layout, not a pill row
- [ ] `ResumeSection`
- [ ] Empty states for every list, each saying what to do next

## 2.2 Landing page (`/`)

The centerpiece — the resume told as an editorial page. The largest single piece
of work in this phase. Build it section by section.

**2.2.1 Hero**

- [ ] Name at `--text-display` in the display serif
- [ ] Headline: role and focus, concrete
- [ ] 2–3 sentences: current work, what you want next
- [ ] **Get in touch** (primary), **Download resume** (secondary)
- [ ] **Verify at 375px that name, headline, and a contact affordance are visible
      without scrolling** — the scan test, non-negotiable
- [ ] No animation on any of it. Full opacity on first paint.

**2.2.2 Selected experience**

- [ ] Render `work` entries where `featured: true`, ordered by `weight`
- [ ] Asymmetric grid — metadata narrow left, content wider right
- [ ] Scroll-linked progress rule down the section (CSS `animation-timeline`)
- [ ] **Full work history →** link to `/resume`
- [ ] Verify it collapses to a single sensible column on mobile

**2.2.3 Metrics band**

- [ ] `MetricFigure` components, 2–4 across, from `resume.metrics`
- [ ] **Renders nothing when `metrics` is absent** — omitted entirely, not padded

**2.2.4 Featured projects**

- [ ] 3 `ProjectCard`s, editorial treatment
- [ ] Verify a card with no cover image still looks deliberate
- [ ] Link to `/projects`

**2.2.5 Skills**

- [ ] `SkillsComposition`, grouped by category
- [ ] Each entry links to `/stack/:tech`
- [ ] No proficiency bars, percentages, or star ratings

**2.2.6 Education and contact**

- [ ] Education: compact, quiet
- [ ] Contact: email, profiles, resume PDF download

**2.2.7 Whole-page checks**

- [ ] **Built HTML ships zero JavaScript** beyond the inline theme script
- [ ] Test with `prefers-reduced-motion: reduce` — complete, correct page
- [ ] Test in a browser without `animation-timeline` support — **all content
      visible**
- [ ] Section rhythm holds at 375px, 768px, 1440px
- [ ] Lighthouse 100 performance

## 2.3 Projects index (`/projects`)

- [ ] Grid ordered `featured` → `weight` → `updated`
- [ ] Static filter links by status and technology (real URLs, not a JS widget)
- [ ] Status and `updated` visible on every card

## 2.4 Stack pages (`/stack/:tech`)

- [ ] `getStaticPaths()` from `getStackUsage()`
- [ ] Show projects and work roles using that technology
- [ ] Per-page title and description — "Alexander May — PyTorch" is a real page
      a search engine can return
- [ ] Verify every chip across the site links here correctly
- [ ] Confirm a technology with no usage doesn't generate an empty page
- [ ] **Judgment check:** if most stack pages list only one project, they read as
      thin. Cut the route rather than ship filler — see
      `03-information-architecture.md`.

## 2.5 Project page (`/projects/:slug`)

- [ ] Header: title, tagline, status, period, role, `updated`
- [ ] Link buttons: repo / live / writeup / video
- [ ] Stack chips → `/stack/:tech`
- [ ] MDX body in a `Prose` container at 68ch
- [ ] Related projects by shared stack/tags
- [ ] `getStaticPaths()` generates one page per project

## 2.6 Resume (`/resume`)

The formal, complete, document-shaped view. Deliberately **not** the editorial
treatment — this page's job is legibility and completeness.

- [ ] **Download PDF** prominent at the top; this page's primary purpose
      (placeholder file — generation is Phase 4)
- [ ] Render **every** `work` entry with full `highlights`, not just featured
- [ ] Complete education and skills
- [ ] Dense, document-like typography
- [ ] Role stack entries link to `/stack/:tech`
- [ ] Print stylesheet producing a clean Cmd-P result
- [ ] `schema.org/Person` JSON-LD
- [ ] Verify against the homepage: same source data, no contradictions

## 2.7 About (`/about`)

- [ ] MDX-backed long-form page
- [ ] One photo via `astro:assets`, correct dimensions, real `alt`

## 2.8 Checks

- [ ] All six routes present in `dist/` as real HTML
- [ ] Every page has a unique `<title>` and meta description
- [ ] **Audit built output for unexpected `<script>` tags** — grep `dist/`
- [ ] Keyboard-navigate the whole site start to finish
- [ ] 375px and 1440px both pass
- [ ] No console errors
- [ ] Run Lighthouse locally; expect 100 performance

---

**Exit criteria:** all routes render fixture content correctly, stack pages work,
the site is keyboard-navigable, and every page ships no JavaScript. Ready for
real content.
