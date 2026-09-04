# Phase 1 — Design System & Content Collections

**Goal:** tokens and components exist; MDX content loads as validated, typed
collections. No real pages yet.

Reference: `04-design-system.md`, `02-content-model.md`.

---

## 1.1 Design tokens

- [x] `src/styles/tokens.css` — color, type scale, spacing, radii, shadows,
      containers, motion (values in `04-design-system.md`)
- [x] Expose tokens to Tailwind v4 via `@theme`
- [x] Dark mode via `:root[data-theme='dark']`
- [x] **Inline blocking script in `<head>`** reading `localStorage` +
      `prefers-color-scheme`, setting `data-theme` before first paint. This is
      the only JS on most pages — prevents the light-mode flash.
- [x] Base stylesheet: reset, `:focus-visible` ring, global
      `prefers-reduced-motion` override, prose defaults at 68ch
- [x] Verify every token pair meets 4.5:1 in both themes

## 1.2 Typography

The editorial direction makes a display face **required**, not optional — it
carries the visual identity. See `04-design-system.md`.

- [x] Pick the display serif: **Fraunces** (variable, optical-size axis, warm —
      strong default), **Instrument Serif** (high contrast, very editorial), or
      **Newsreader** (cleaner, safer, less distinctive)
- [x] Self-host it — subset to Latin, `woff2`. **Never Google Fonts' CDN.**
- [x] `<link rel="preload">` it; it's above the fold in the hero
- [x] `font-display: swap`, with `size-adjust` / `ascent-override` tuned on the
      fallback so the swap doesn't shift layout — verify CLS stays ≤ 0.02
- [x] **Body text stays on the system stack**
- [x] Verify the font payload stays under 45KB
- [x] Implement the full type scale including `--text-deck` and `--text-display`
- [x] Sanity-check the display face at `--text-display` on a 375px screen — some
      high-contrast serifs get spindly at large sizes on low-DPI displays

## 1.2b Editorial layout primitives

- [x] 12-column grid utility for the landing page's asymmetric layouts
- [x] `--space-section` rhythm between major sections
- [x] `Rule` component — hairline section separators
- [x] `Deck` component — role headline set at `--text-deck`
- [x] `MetricFigure` — large-type number with a label
- [x] Scroll-reveal utility class, **authored opt-in**: visible by default,
      animation added inside `@supports (animation-timeline: view())` and
      `@media (prefers-reduced-motion: no-preference)`
- [x] **Test the reveal utility with animations disabled and in a browser
      without `animation-timeline` support — content must be fully visible.**
      Authored backwards this silently hides your content.

## 1.3 Components (`.astro`, zero JS)

- [x] `Button`, `Link`, `Chip`, `Badge`, `Card`, `Prose`, `Icon`,
      `VisuallyHidden`
- [x] `Header` with nav + skip link
- [x] `Footer` with contact links + build-time "last updated" date
- [x] `ThemeToggle` — CSS/inline-script driven, **not** a React island
- [x] `SEO` component: title, description, canonical, OG, Twitter tags
- [x] Keyboard-check every interactive element
- [x] Confirm no component introduced a `<script>` into the built output

## 1.4 Content collections

- [x] `content/taxonomy.ts` — canonical tech vocabulary, labels + categories
- [x] `src/content.config.ts` — a single `projects` collection using the
      `glob()` loader with `base: './content/projects'` (keeps content out of
      `src/`)
- [x] Zod schemas per `02-content-model.md`; build `z.enum` from taxonomy keys
      so an unknown technology fails the build
- [x] Use the `image()` helper for `cover` so covers get optimized automatically
- [x] Include the `updated` field — it carries the recency signal
- [x] Verify generated types flow through `getCollection()` with no casts
- [x] Confirm a bad frontmatter value fails the build **with the file path**

## 1.5 MDX configuration

- [x] GFM (built into the Sätteri processor)
- [x] ~~`rehype-slug` + `rehype-autolink-headings`~~ — **not needed.** Astro 7's
      default Sätteri processor generates heading ids itself; rehype plugins
      would require installing `@astrojs/markdown-remark` to fall back to the
      slower unified processor. The visible `#` anchor is done in the MDX
      heading component instead.
- [x] Syntax highlighting via Astro's built-in Shiki, dual-themed for light/dark
- [x] Map `Callout`, `Figure`, `CodeBlock`, `Comparison`, `Metric`, `Aside` as
      global MDX components
- [x] Map `h1`–`h6`, `a`, `img`, `pre`, `table` to styled components
- [x] **Verify a content file needs zero imports** — write a sample using every
      mapped component

## 1.6 Content helpers

- [x] `src/lib/content.ts`: `getProjects`, `getFeaturedProjects`, `getRelated`,
      `getStackUsage` — four helpers, no feed logic
- [x] `getProjects()` orders by featured → weight → `updated`
- [x] Exclude `draft: true` in production builds only
- [x] Unit tests over the helpers using fixture content

## 1.7 Authoring ergonomics

- [x] `scripts/new-project.ts`, wired as `npm run new:project`
- [x] Auto-slug from title, auto-dates, valid frontmatter pre-filled
- [x] Create 2–3 fixture projects to build against

---

**Exit criteria:** tokens drive both themes with no flash. `getProjects()`
returns typed entries from real MDX files. A bad frontmatter key fails the build
with a useful message. `npm run new:project` scaffolds a valid file. Built pages
contain no unexpected scripts.
