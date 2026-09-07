# Design System

**Direction: instrument panel.** Dark by default, monospace-forward, vibrant
accents used as data channels, rounded corners, motion driven by scroll.

The reference is a piece of **lab or measurement equipment** — an oscilloscope,
a telemetry dashboard, a plotted experiment — not a hacker terminal. That
distinction is the whole point of the direction and it is worth stating plainly:

> The dark terminal-dev aesthetic is the single most common look in this
> category. Green-on-black, a blinking cursor, ASCII art, `~$ whoami` — a
> reviewer has seen fifty of them. Doing that generically means blending in.

What differentiates here is the **scientific instrumentation** layer: a measured
grid, monospace readouts with real units, status LEDs, tick marks, indexed
specimens, values that look plotted rather than typed. It reads as *someone who
builds systems and measures them*, which is the actual claim.

See `06-decisions.md` D-015 for how this supersedes the editorial direction.

## Design principles

1. **Monospace is the voice; sans is for reading.** Headings, labels, metadata,
   and every number are mono. Long prose is not — a full-mono project writeup is
   a wall.
2. **Accents are data channels, not decoration.** Each accent means one thing
   consistently. Cyan is the primary signal, lime is live/active, violet is a
   secondary series, amber is degraded or archived. If a color appears without
   meaning something, it is wrong.
3. **Everything reads as measured.** Units on numbers, indexes on sections,
   tick marks where a scale is implied. The site should feel like it was
   instrumented rather than styled.
4. **Rounded, not soft.** Consistent radii on every surface. Rounded corners
   with hard, thin borders read as hardware; rounded with fuzzy shadows reads
   as a consumer app.
5. **Motion is scroll-driven and physical.** Things enter as you scroll to them,
   at a rate you control. Nothing performs on a timer.
6. **Dark is the default, light is complete.** Not an afterthought inversion —
   both palettes are verified independently.
7. **Content still sets the layout.** No layout that requires a cover image.

## Tokens

CSS custom properties in `src/styles/tokens.css`, exposed to Tailwind v4 via
`@theme`. Colors go through one level of indirection so themes can swap them.

### Color

**Dark is the default.** Light is the explicit alternative.

```css
/* Dark — default. Deep blue-black, like an unlit instrument panel. */
:root {
  --c-bg: #0a0d12;
  --c-surface: #11161d;
  --c-raised: #171d26;
  --c-border: #232b36;
  --c-grid: #1a212b; /* the measured background grid */
  --c-text: #e6edf3; /* 16.47:1 on bg */
  --c-text-muted: #9aa7b4; /*  7.93:1 */
  --c-text-subtle: #7d8b9a; /*  5.59:1 — the floor */

  --c-cyan: #22d3ee; /* primary signal   10.77:1 */
  --c-lime: #a3e635; /* live / active    12.91:1 */
  --c-violet: #c4b5fd; /* secondary series 10.54:1 */
  --c-amber: #fbbf24; /* degraded         11.66:1 */
}

:root[data-theme='light'] {
  --c-bg: #f6f8fa;
  --c-surface: #ffffff;
  --c-raised: #eef2f6;
  --c-border: #d5dde5;
  --c-grid: #e6ecf2;
  --c-text: #0d1117;
  --c-text-muted: #4a5763;
  --c-text-subtle: #5c6b7a;

  --c-cyan: #0e7490;
  --c-lime: #446d0c;
  --c-violet: #6d28d9;
  --c-amber: #945708;
}
```

**All 42 pairs — every foreground against every ground, in both themes — were
verified to meet WCAG AA (4.5:1) before these values were written down. The
lowest ratio is 4.76.** The light-mode lime and amber were darkened twice
during that check; the first two candidates failed against `--c-raised` while
passing against `--c-bg`, which is exactly the failure a spot-check against one
background misses.

`--c-text-subtle` is the floor and is for genuinely secondary metadata only.

#### Accent semantics

| Token | Means | Used by |
| --- | --- | --- |
| `cyan` | primary signal, interactive | links, primary actions, focus |
| `lime` | live, active, running | `status: active`, live indicators |
| `violet` | secondary series | secondary data, AI/ML category tags |
| `amber` | degraded, paused, archived | `status: archived` / `exploration` |

`shipped` deliberately gets no accent — it is the neutral resting state.

### Theme switching

**Dark is the default with no attribute set.** Light applies only under
`[data-theme='light']`, plus a `prefers-color-scheme: light` block guarded by
`:not([data-theme='dark'])` so a light-preferring visitor gets light without
JavaScript.

The inline blocking script in `<head>` stamps a stored choice before first
paint. Without it a stored preference flashes the wrong theme.

### Type

**One loaded face: JetBrains Mono (variable, weight axis, 40KB).**

It carries the entire identity — headings, labels, metadata, numbers, status
readouts. It is the most recognizable developer typeface there is, which is the
point of the direction, and the variable axis matters because mono is doing work
at many sizes and weights here.

Body prose stays on the **system sans stack**: no request, no layout shift, and
genuinely more readable for a 600-word project writeup than mono would be.

```
--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
--font-sans: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
```

Rules: self-hosted, Latin subset, `font-display: swap`, preloaded (it is above
the fold), with a metric-matched fallback so the swap does not shift layout.

#### Scale

| Token | Size | Use |
| --- | --- | --- |
| `--text-xs` | 0.75rem | Labels, units, indexes |
| `--text-sm` | 0.875rem | Metadata, chips, captions |
| `--text-base` | 1rem | Body |
| `--text-lg` | 1.125rem | Lead paragraphs |
| `--text-xl` | 1.375rem | Card titles |
| `--text-2xl` | 1.75rem | h2 |
| `--text-3xl` | clamp(2rem, 4vw, 2.75rem) | Page titles |
| `--text-deck` | clamp(1.35rem, 2.8vw, 2rem) | Role headline accomplishments |
| `--text-display` | clamp(2.5rem, 7vw, 4.5rem) | Name in hero, metric readouts |

Display sizes are **smaller than the editorial system used**. Mono is wider per
character; the same nominal size occupies far more horizontal space, and a name
set at 5.5rem in mono overflows a phone.

Mono headings get `letter-spacing: -0.02em` — mono is loose by default and
tightening it is what stops large headings looking like a code listing.

Prose measure is capped at **68ch**.

### Shape

Rounded corners are a stated requirement of this direction.

```
--radius-sm: 6px    /* chips, badges, inline code */
--radius-md: 10px   /* buttons, inputs */
--radius-lg: 14px   /* cards, panels */
--radius-xl: 20px   /* large containers */
--radius-full: 999px /* status dots, pills */
```

Paired with **1px hard borders, no soft shadows.** Rounded plus a crisp border
reads as a hardware panel; rounded plus a blurred drop shadow reads as a
consumer app, which is the wrong register.

### The measured grid

A faint grid sits behind the page — the single strongest carrier of the
instrument feel, for almost nothing:

```css
background-image:
  linear-gradient(var(--color-grid) 1px, transparent 1px),
  linear-gradient(90deg, var(--color-grid) 1px, transparent 1px);
background-size: 32px 32px;
```

It must stay **barely visible** — if you notice it as a grid rather than as
texture, it is too strong. It is masked out behind text containers so it never
competes with reading.

## Motion

Scroll-driven, CSS only, zero JavaScript. `animation-timeline: view()` and
`scroll()` are native.

**The pattern is opt-in, never opt-out — this is non-negotiable:**

```css
.reveal {
  opacity: 1;
  transform: none;
} /* visible by default, always */

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal {
      animation: reveal linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 50%;
    }
  }
}
```

Authoring this backwards — hiding content and revealing it on scroll — makes the
page **blank** in any browser without `animation-timeline` and for every visitor
with reduced motion. On a site whose purpose is being read, that is a silent,
total failure. A test asserts the base rule stays visible, and that test has been
verified to actually catch the inversion.

Motion vocabulary:

- **`.reveal`** — fade and rise, on entry
- **`.reveal-stagger`** — children enter in sequence via `animation-delay`
- **Scroll progress rail** — a scroll-linked accent line down the experience
  section, drawn with `scroll()`
- **Readout count-in** — metric figures scale up slightly on entry, like a gauge
  settling
- **Hover** — 150ms border and glow transitions only

Never on the hero. Name, headline, and contact render at full opacity on first
paint, always. Durations 150ms (state) / 300ms (entry). `transform` and `opacity`
only.

Still excluded: scroll-jacking (hijacking scroll position or speed — distinct
from scroll-*linked* animation), typewriter effects, fake terminal prompts,
matrix rain, particle fields, custom cursors, preloaders, sound.

## Components

**`src/components/` — `.astro`, zero JS.**

`Button`, `Chip`, `Badge`, `Card`, `Prose`, `Rule`, `SectionHeader`, `Deck`,
`MetricFigure`, `StatusDot`, `Label`, `ProjectCard`, `ExperienceEntry`,
`SkillsComposition`, `StackChips`, `EmptyState`, `Header`, `Footer`, `SEO`

Direction-specific additions:

- **`StatusDot`** — a small filled circle in the status accent, optionally with
  a `lime` pulse for `active`. The LED.
- **`Label`** — uppercase mono micro-label with wide tracking, for the
  `SECTION 01 /` and `STATUS /` style annotations that carry the instrument feel.

**`src/islands/` — `.tsx`, ships JS.** Currently empty, and `@astrojs/react` is
not installed: it emitted a 187KB client runtime into `dist/` referenced by zero
pages. It returns in Phase 5 with the first real island.

## Accessibility

- **Contrast**: WCAG AA, verified computationally in both themes
- **Vibrant accents on dark are exactly where contrast quietly fails** — every
  accent was checked against all three grounds, not just `--c-bg`
- **Color is never the only signal.** Status is a dot *and* a text label; a
  reader who cannot distinguish lime from amber still reads "Active".
- Visible `:focus-visible` ring in both themes; never `outline: none` bare
- One `<h1>` per page, no skipped levels, skip link first, named landmarks
- Reduced motion produces a complete, correct page
- The background grid is decorative and must not reduce text contrast
- CI runs `axe-core` against every built route

## Performance budget

| Metric | Budget |
| --- | --- |
| JS — every page (gzip) | **≤ 2KB** (inline theme script only) |
| CSS (gzip) | ≤ 30KB |
| Font payload | ≤ 45KB (JetBrains Mono variable, 40KB) |
| LCP (mid-tier mobile, 4G) | ≤ 1.4s |
| CLS | ≤ 0.02 |
| Lighthouse Performance | 100 |
| Lighthouse Accessibility | 100 |

Unchanged by the retheme. The direction costs one font file; the grid, the
rounded corners, the accents, and every scroll animation are CSS. **If a page
starts shipping JavaScript, something was accidentally made an island — that is
a bug, not a tradeoff.**
