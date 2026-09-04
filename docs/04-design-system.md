# Design System

Presentation is a stated top priority, so this document is load-bearing. On a
site that ships almost no JavaScript, **typography and spacing are the product.**

## Design principles

1. **Typography over decoration.** Text-heavy site, read by people in a hurry.
   Excellent type hierarchy does more than any visual effect.
2. **One accent color.** A restrained palette reads as considered. A rainbow of
   tag colors reads as a student project.
3. **Content sets the layout.** No layout that requires a cover image to look
   right — you will eventually post an update without one.
4. **Motion clarifies, never announces.** Nothing animates purely to be noticed.
5. **Dark mode is a first-class mode, not an inversion.** A large share of
   engineers browse in dark mode; a site that looks bad there looks careless.

## Tokens

CSS custom properties in `src/styles/tokens.css`, exposed to Tailwind v4 via
`@theme`. One source, both systems.

### Color

Semantic names, not literal ones — `--color-surface`, never `--color-gray-50` —
so dark mode redefines meaning rather than fighting the name.

```css
:root {
  --color-bg:           #fdfdfc;
  --color-surface:      #ffffff;
  --color-surface-sunk: #f5f5f4;
  --color-border:       #e7e5e4;
  --color-text:         #1c1917;   /* 15.8:1 on bg */
  --color-text-muted:   #57534e;   /*  7.4:1 on bg */
  --color-text-subtle:  #78716c;   /*  4.9:1 on bg — smallest allowed */
  --color-accent:       #0f62d6;
  --color-accent-hover: #0b4fae;
  --color-accent-quiet: #eff4fe;
}

:root[data-theme='dark'] {
  --color-bg:           #0c0a09;
  --color-surface:      #16130f;
  --color-surface-sunk: #211d18;
  --color-border:       #2c2723;
  --color-text:         #f5f5f4;
  --color-text-muted:   #b5aca4;
  --color-text-subtle:  #8f8781;
  --color-accent:       #6aa6ff;   /* lightened — the light-mode blue fails on dark */
  --color-accent-hover: #8dbcff;
  --color-accent-quiet: #14203a;
}
```

Every pair meets **WCAG AA (4.5:1)** for body text. `--color-text-subtle` is the
floor and is only for genuinely secondary metadata — never for anything a
recruiter needs to read.

Three project states carry meaning and get color: `active` (accent), `shipped`
(neutral-positive), `archived` / `exploration` (muted). **Tags and stack chips
are neutral** — twelve arbitrary tag colors is noise and defeats the single
accent.

### Theme switching

Default to `prefers-color-scheme`; a toggle writes to `localStorage`.

An **inline blocking script in `<head>`** sets `data-theme` before first paint.
Without it the page flashes light before switching to dark — the most visible
possible bug on a site meant to look polished.

This ~15 lines of inline JS is the *only* JavaScript on most pages, and it is
worth it. It is inline rather than an island specifically because it must run
before paint.

### Type

Body: a system stack. Renders instantly, no network request, no layout shift, no
FOUT, looks native everywhere.

```
--font-sans: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto,
             'Helvetica Neue', Arial, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
```

Because presentation is a priority, **one self-hosted display face for headings
is permitted** — a single subsetted `woff2` weight, preloaded, `font-display:
swap`, headings only. Something with real character (Inter Display, General
Sans, Instrument Serif) meaningfully lifts the site's feel at a cost of ~15–25KB.

Hard rules: self-hosted (never Google Fonts' CDN — extra connection, worse
privacy), one weight, headings only, `size-adjust` tuned so the fallback swap
doesn't shift layout. **Body text stays on the system stack.**

Scale — fluid, `clamp()`-based, 1.25 ratio:

| Token | Size | Use |
| --- | --- | --- |
| `--text-xs` | 0.79rem | Metadata, timestamps |
| `--text-sm` | 0.889rem | Chips, captions |
| `--text-base` | 1rem | Body |
| `--text-lg` | 1.125rem | Lead paragraphs |
| `--text-xl` | 1.406rem | Card titles, h3 |
| `--text-2xl` | 1.758rem | h2 |
| `--text-3xl` | 2.197rem | Page titles |
| `--text-4xl` | clamp(2.5rem, 6vw, 3.5rem) | Landing name |

Prose measure capped at **68 characters**. Long-form content in a full-width
container is genuinely hard to read and is one of the most common flaws in
developer portfolios.

### Spacing and layout

4px base scale. Three containers:

- `--w-prose: 68ch` — MDX body content
- `--w-content: 1100px` — cards, grids, resume
- `--w-wide: 1400px` — full-bleed, rare

Breakpoints: 640 / 768 / 1024 / 1280. Mobile-first — the landing page and resume
must be excellent at 375px, because a meaningful share of recruiters open the
link on a phone between meetings.

## Components

**`src/components/` — `.astro`, zero JS.** This is nearly everything:

`Button`, `Link`, `Chip`, `Badge`, `Card`, `Prose`, `Icon`, `VisuallyHidden`,
`ProjectCard`, `UpdateEntry`, `FeedList`, `StackChips`, `Timeline`,
`ResumeSection`, `DevlogList`, `Header`, `Footer`, `SEO`

**MDX-mapped components** — available in content with no imports:

`Callout`, `Figure`, `CodeBlock`, `Comparison`, `Metric`, `Aside`, `DemoFrame`

**`src/islands/` — `.tsx`, ships JS.** Should stay nearly empty. A component
moves here only after passing the bar in `05-interactivity.md`.

Astro scopes component styles by default, so components can own their CSS without
a naming convention or leakage.

## Motion

- Durations: 150ms (state), 250ms (enter/exit). Nothing over 300ms.
- Easing: `cubic-bezier(0.2, 0, 0, 1)`
- Animate only `transform` and `opacity`
- No scroll-jacking, no parallax, **no scroll-triggered reveal on primary
  content** — it hides content a scanning reader is trying to read, and it breaks
  in-page search

**View Transitions**: Astro's `<ClientRouter />` gives smooth cross-page
transitions for ~3KB. This is the one place a small JS cost buys real perceived
polish — navigation feels instant and app-like without an SPA.

Adopt it **in Phase 4, after measuring**, and only if it doesn't regress the
budget. Native CSS view transitions may cover enough of this without the script.

`prefers-reduced-motion: reduce` disables all non-essential motion, as a global
base-stylesheet rule rather than something remembered per component.

## Accessibility

A build requirement, not a final pass. On a site aimed at engineering employers,
an inaccessible portfolio is a visible technical failure.

- **Contrast**: WCAG AA minimum, verified in CI
- **Keyboard**: everything reachable and operable; visible `:focus-visible` ring;
  never `outline: none` without a replacement
- **Semantics**: real landmarks, one `<h1>` per page, no skipped heading levels,
  `<button>` for actions and `<a>` for navigation
- **Skip link** as the first focusable element
- **Images**: meaningful `alt`, or `alt=""` when decorative
- CI runs `axe-core` against every built route and fails on violations

Static HTML helps here structurally — most accessibility bugs come from
JavaScript-driven state that isn't announced, and there is very little of that.

## Performance budget

Enforced in CI. Violations fail the build.

| Metric | Budget |
| --- | --- |
| JS — landing, resume, feed, index (gzip) | **≤ 2KB** (inline theme script only) |
| JS — a project page with an island | ≤ 100KB |
| CSS (gzip) | ≤ 25KB |
| Font payload | ≤ 30KB |
| LCP (mid-tier mobile, 4G) | ≤ 1.2s |
| CLS | ≤ 0.02 |
| Lighthouse Performance | 100 |
| Lighthouse Accessibility | 100 |

These are much tighter than the earlier React-based plan because the framework
makes them achievable rather than aspirational. **A regression here is a bug**,
not a tradeoff — if a page starts shipping unexpected JavaScript, something was
accidentally made an island.

Enabling techniques: static HTML, system fonts for body, `astro:assets` for
images, islands only where earned, Pagefind loaded on demand, immutable cache
headers on `/_astro/*`.

The budget protects a specific outcome: a recruiter on hotel wifi sees your name
and headline immediately. Everything else is negotiable; that is not.
