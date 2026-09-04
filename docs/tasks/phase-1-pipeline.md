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

## 1.2 Typography decision

- [ ] Decide: system stack only, or one self-hosted display face for headings
- [ ] If a display face: self-host a single subsetted `woff2`, preload it,
      `font-display: swap`, headings only, tune `size-adjust` on the fallback so
      the swap doesn't shift layout
- [ ] **Body text stays on the system stack** either way
- [ ] Verify the font payload stays under 30KB

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
- [ ] `src/content.config.ts` — `projects`, `updates`, `posts` collections using
      the `glob()` loader with `base: './content/...'` (keeps content out of
      `src/`)
- [ ] Zod schemas per `02-content-model.md`; build `z.enum` from taxonomy keys
      so an unknown technology fails the build
- [ ] Use the `image()` helper for `cover` so covers get optimized automatically
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

- [ ] `src/lib/content.ts`: `getProjects`, `getFeaturedProjects`, `getFeed`,
      `getUpdatesFor`, `getRelated`, `getStackUsage`
- [ ] Derive owning project and update slug from the collection entry `id`
- [ ] Assert filename date matches frontmatter date on updates
- [ ] Exclude `draft: true` in production builds only
- [ ] Unit tests over the helpers using fixture content

## 1.7 Authoring ergonomics

- [ ] `scripts/new-project.ts`, `scripts/new-update.ts`
- [ ] Wire as `npm run new:project` / `npm run new:update`
- [ ] Auto-slug from title, auto-date, valid frontmatter pre-filled
- [ ] Create 2–3 fixture projects with updates to build against

---

**Exit criteria:** tokens drive both themes with no flash. `getFeed()` returns
typed entries from real MDX files. A bad frontmatter key fails the build with a
useful message. `npm run new:update` scaffolds a valid file. Built pages still
contain no unexpected scripts.
