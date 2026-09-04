# Phase 1 — Design System & Content Collections

**Goal:** tokens and components exist; MDX content loads as validated, typed
collections. No real pages yet.

Reference: `04-design-system.md`, `02-content-model.md`.

---

## 1.1 Design tokens

- [ ] `src/styles/tokens.css` — color, type scale, spacing, radii, shadows,
      containers, motion (values in `04-design-system.md`)
- [ ] Expose tokens to Tailwind v4 via `@theme`
- [ ] Dark mode via `:root[data-theme='dark']`
- [ ] **Inline blocking script in `<head>`** reading `localStorage` +
      `prefers-color-scheme`, setting `data-theme` before first paint. This is
      the only JS on most pages — prevents the light-mode flash.
- [ ] Base stylesheet: reset, `:focus-visible` ring, global
      `prefers-reduced-motion` override, prose defaults at 68ch
- [ ] Verify every token pair meets 4.5:1 in both themes

## 1.2 Typography

The editorial direction makes a display face **required**, not optional — it
carries the visual identity. See `04-design-system.md`.

- [ ] Pick the display serif: **Fraunces** (variable, optical-size axis, warm —
      strong default), **Instrument Serif** (high contrast, very editorial), or
      **Newsreader** (cleaner, safer, less distinctive)
- [ ] Self-host it — subset to Latin, `woff2`. **Never Google Fonts' CDN.**
- [ ] `<link rel="preload">` it; it's above the fold in the hero
- [ ] `font-display: swap`, with `size-adjust` / `ascent-override` tuned on the
      fallback so the swap doesn't shift layout — verify CLS stays ≤ 0.02
- [ ] **Body text stays on the system stack**
- [ ] Verify the font payload stays under 45KB
- [ ] Implement the full type scale including `--text-deck` and `--text-display`
- [ ] Sanity-check the display face at `--text-display` on a 375px screen — some
      high-contrast serifs get spindly at large sizes on low-DPI displays

## 1.2b Editorial layout primitives

- [ ] 12-column grid utility for the landing page's asymmetric layouts
- [ ] `--space-section` rhythm between major sections
- [ ] `Rule` component — hairline section separators
- [ ] `Deck` component — role headline set at `--text-deck`
- [ ] `MetricFigure` — large-type number with a label
- [ ] Scroll-reveal utility class, **authored opt-in**: visible by default,
      animation added inside `@supports (animation-timeline: view())` and
      `@media (prefers-reduced-motion: no-preference)`
- [ ] **Test the reveal utility with animations disabled and in a browser
      without `animation-timeline` support — content must be fully visible.**
      Authored backwards this silently hides your content.

## 1.3 Components (`.astro`, zero JS)

- [ ] `Button`, `Link`, `Chip`, `Badge`, `Card`, `Prose`, `Icon`,
      `VisuallyHidden`
- [ ] `Header` with nav + skip link
- [ ] `Footer` with contact links + build-time "last updated" date
- [ ] `ThemeToggle` — CSS/inline-script driven, **not** a React island
- [ ] `SEO` component: title, description, canonical, OG, Twitter tags
- [ ] Keyboard-check every interactive element
- [ ] Confirm no component introduced a `<script>` into the built output

## 1.4 Content collections

- [ ] `content/taxonomy.ts` — canonical tech vocabulary, labels + categories
- [ ] `src/content.config.ts` — a single `projects` collection using the
      `glob()` loader with `base: './content/projects'` (keeps content out of
      `src/`)
- [ ] Zod schemas per `02-content-model.md`; build `z.enum` from taxonomy keys
      so an unknown technology fails the build
- [ ] Use the `image()` helper for `cover` so covers get optimized automatically
- [ ] Include the `updated` field — it carries the recency signal
- [ ] Verify generated types flow through `getCollection()` with no casts
- [ ] Confirm a bad frontmatter value fails the build **with the file path**

## 1.5 MDX configuration

- [ ] `remark-gfm`
- [ ] `rehype-slug` + `rehype-autolink-headings` (deep links into long writeups)
- [ ] Syntax highlighting via Astro's built-in Shiki, dual-themed for light/dark
- [ ] Map `Callout`, `Figure`, `CodeBlock`, `Comparison`, `Metric`, `Aside` as
      global MDX components
- [ ] Map `h1`–`h6`, `a`, `img`, `pre`, `table` to styled components
- [ ] **Verify a content file needs zero imports** — write a sample using every
      mapped component

## 1.6 Content helpers

- [ ] `src/lib/content.ts`: `getProjects`, `getFeaturedProjects`, `getRelated`,
      `getStackUsage` — four helpers, no feed logic
- [ ] `getProjects()` orders by featured → weight → `updated`
- [ ] Exclude `draft: true` in production builds only
- [ ] Unit tests over the helpers using fixture content

## 1.7 Authoring ergonomics

- [ ] `scripts/new-project.ts`, wired as `npm run new:project`
- [ ] Auto-slug from title, auto-dates, valid frontmatter pre-filled
- [ ] Create 2–3 fixture projects to build against

---

**Exit criteria:** tokens drive both themes with no flash. `getProjects()`
returns typed entries from real MDX files. A bad frontmatter key fails the build
with a useful message. `npm run new:project` scaffolds a valid file. Built pages
contain no unexpected scripts.
