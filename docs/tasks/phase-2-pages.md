# Phase 2 — Pages

**Goal:** every route renders real data from the content collection. Still using
fixture content.

Six routes. Reference: `03-information-architecture.md`.

---

## 2.1 Composite components

- [x] `ProjectCard` — title, tagline, stack chips, status badge, `updated` date;
      **must look right with no cover image** (you will eventually add one
      without)
- [x] `ExperienceEntry` — quiet metadata column, `Deck` headline, supporting
      highlights, stack chips
- [x] `StackChips` — renders taxonomy keys as labels, each linking to
      `/stack/:tech`
- [x] `SkillsComposition` — grouped typographic layout, not a pill row
- [x] `ResumeSection`
- [x] Empty states for every list, each saying what to do next

## 2.2 Landing page (`/`)

The centerpiece — the resume told as an editorial page. The largest single piece
of work in this phase. Build it section by section.

**2.2.1 Hero**

- [x] Name at `--text-display` in the display serif
- [x] Headline: role and focus, concrete
- [x] 2–3 sentences: current work, what you want next
- [x] **Get in touch** (primary), **Download resume** (secondary)
- [x] **Verify at 375px that name, headline, and a contact affordance are visible
      without scrolling** — the scan test, non-negotiable
- [x] No animation on any of it. Full opacity on first paint.

**2.2.2 Selected experience**

- [x] Render `work` entries where `featured: true`, ordered by `weight`
- [x] Asymmetric grid — metadata narrow left, content wider right
- [x] Scroll-linked progress rule down the section (CSS `animation-timeline`)
- [x] **Full work history →** link to `/resume`
- [x] Verify it collapses to a single sensible column on mobile

**2.2.3 Metrics band**

- [x] `MetricFigure` components, 2–4 across, from `resume.metrics`
- [x] **Renders nothing when `metrics` is absent** — omitted entirely, not padded

**2.2.4 Featured projects**

- [x] 3 `ProjectCard`s, editorial treatment
- [x] Verify a card with no cover image still looks deliberate
- [x] Link to `/projects`

**2.2.5 Skills**

- [x] `SkillsComposition`, grouped by category
- [x] Each entry links to `/stack/:tech`
- [x] No proficiency bars, percentages, or star ratings

**2.2.6 Education and contact**

- [x] Education: compact, quiet
- [x] Contact: email, profiles, resume PDF download

**2.2.7 Whole-page checks**

- [x] **Built HTML ships zero JavaScript** beyond the inline theme script
- [x] Test with `prefers-reduced-motion: reduce` — complete, correct page
- [x] Test in a browser without `animation-timeline` support — **all content
      visible**
- [x] Section rhythm holds at 375px, 768px, 1440px
- [x] Lighthouse 100 performance

## 2.3 Projects index (`/projects`)

- [x] Grid ordered `featured` → `weight` → `updated`
- [x] Static filter links by status and technology (real URLs, not a JS widget)
- [x] Status and `updated` visible on every card

## 2.4 Stack pages (`/stack/:tech`)

- [x] `getStaticPaths()` from `getStackUsage()`
- [x] Show projects and work roles using that technology
- [x] Per-page title and description — "Alexander May — PyTorch" is a real page
      a search engine can return
- [x] Verify every chip across the site links here correctly
- [x] Confirm a technology with no usage doesn't generate an empty page
- [x] **Judgment check** — *kept.* With fixture content, 13 stack pages
      generate and most list 2+ items (`/stack/python` shows 2 roles and 2
      projects). Re-evaluate in Phase 3 against real content: if the majority
      end up listing a single project, cut the route rather than ship filler.

## 2.5 Project page (`/projects/:slug`)

- [x] Header: title, tagline, status, period, role, `updated`
- [x] Link buttons: repo / live / writeup / video
- [x] Stack chips → `/stack/:tech`
- [x] MDX body in a `Prose` container at 68ch
- [x] Related projects by shared stack/tags
- [x] `getStaticPaths()` generates one page per project

## 2.6 Resume (`/resume`)

The formal, complete, document-shaped view. Deliberately **not** the editorial
treatment — this page's job is legibility and completeness.

- [x] **Download PDF** prominent at the top; this page's primary purpose
      (placeholder file — generation is Phase 4)
- [x] Render **every** `work` entry with full `highlights`, not just featured
- [x] Complete education and skills
- [x] Dense, document-like typography
- [x] Role stack entries link to `/stack/:tech`
- [x] Print stylesheet producing a clean Cmd-P result
- [x] `schema.org/Person` JSON-LD
- [x] Verify against the homepage: same source data, no contradictions

## 2.7 About (`/about`)

- [x] MDX-backed long-form page
- [x] One photo via `astro:assets`, correct dimensions, real `alt`

## 2.8 Checks

- [x] All six routes present in `dist/` as real HTML
- [x] Every page has a unique `<title>` and meta description
- [x] **Audit built output for unexpected `<script>` tags** — grep `dist/`
- [x] Keyboard-navigate the whole site start to finish
- [x] 375px and 1440px both pass
- [x] No console errors
- [x] Run Lighthouse locally; expect 100 performance

---

**Exit criteria:** all routes render fixture content correctly, stack pages work,
the site is keyboard-navigable, and every page ships no JavaScript. Ready for
real content.
