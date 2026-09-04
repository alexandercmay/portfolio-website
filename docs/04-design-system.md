# Design System

**Direction: editorial.** Large display type, generous whitespace, a strong grid,
restrained color, accomplishments treated as pull quotes. The reference points
are well-made publications, not dev portfolios.

This is the right call for a specific reason: the terminal-inflected dark-mode
developer aesthetic is the most common look in this category, so it blends in.
An editorial treatment stands out by contrast, ages better, and signals judgment
rather than novelty.

Because the site ships essentially no JavaScript, **typography and layout are
the entire product.** This document is load-bearing.

## Design principles

1. **Type carries the design.** Hierarchy, scale, and rhythm do the work. Effects
   don't.
2. **One accent color.** A restrained palette reads as considered. A rainbow of
   tag colors reads as a student project.
3. **Whitespace is structure, not leftover.** Editorial layouts breathe. Cramped
   is the most common failure of self-designed sites.
4. **The strongest sentence gets the largest type.** Accomplishments are set as
   decks and pull quotes, not buried in bullets.
5. **Motion responds to the reader; it never performs for them.** Scroll-linked,
   subtle, always optional.
6. **Content sets the layout.** No layout that requires a cover image to look
   right — you will eventually add a project without one.
7. **Dark mode is a first-class mode, not an inversion.**

## Tokens

CSS custom properties in `src/styles/tokens.css`, exposed to Tailwind v4 via
`@theme`. One source, both systems.

### Color

An editorial palette: warm off-white paper, near-black ink, one accent. Warmer
and lower-contrast-at-the-extremes than a typical developer site — it reads as
printed rather than emitted.

```css
:root {
  --color-bg:           #fbfaf7;   /* warm paper, not pure white */
  --color-surface:      #ffffff;
  --color-surface-sunk: #f2f0ea;
  --color-border:       #e2ded4;
  --color-rule:         #1c1917;   /* hairlines and structural rules */
  --color-text:         #1a1714;   /* warm near-black ink — 15.2:1 on bg */
  --color-text-muted:   #57514a;   /*  7.1:1 */
  --color-text-subtle:  #736c63;   /*  4.7:1 — the floor */
  --color-accent:       #9a3412;   /* burnt sienna — editorial, not tech-blue */
  --color-accent-hover: #7c2d12;
  --color-accent-quiet: #fdf3ee;
}

:root[data-theme='dark'] {
  --color-bg:           #12100e;
  --color-surface:      #1a1714;
  --color-surface-sunk: #241f1a;
  --color-border:       #332d26;
  --color-rule:         #f5f2ec;
  --color-text:         #f5f2ec;
  --color-text-muted:   #b8afa4;
  --color-text-subtle:  #918880;
  --color-accent:       #f4a582;   /* lightened — the light-mode sienna fails on dark */
  --color-accent-hover: #f7bfa4;
  --color-accent-quiet: #2a1a12;
}
```

Every pair meets **WCAG AA (4.5:1)** for body text — verified in Phase 1
against all three light grounds and all three dark ones, not just against `bg`.

`--color-text-subtle` is the floor and is the pair that binds: an earlier value
(`#777067`) cleared 4.5:1 on `bg` but landed at **4.29:1 on `surface-sunk`**,
which is exactly the kind of failure that survives a spot-check against one
background. Use it for genuinely secondary metadata only — never for anything a
recruiter needs to read.

The accent is deliberately not blue. Tech-blue is the default of the category;
a warm accent supports the editorial register and is instantly more distinctive.
Swap it if you dislike it, but keep it to one.

Project states carry meaning and get color: `active` (accent), `shipped`
(neutral-positive), `archived` / `exploration` (muted). **Tags and stack chips
stay neutral.**

### Theme switching

Default to `prefers-color-scheme`; a toggle writes to `localStorage`. An
**inline blocking script in `<head>`** sets `data-theme` before first paint —
without it the page flashes light before switching, which is the most visible
possible bug on a site meant to look polished.

That ~15 lines is the only JavaScript on most pages, and it earns its place.

### Type — the centerpiece

**Two roles, one loaded face.**

**Display** (name, section headers, deck lines, pull quotes, metrics): a
self-hosted serif with real character. This is where the editorial identity
lives, and it is now a requirement rather than optional.

Candidates, all free and self-hostable:

| Face | Character |
| --- | --- |
| **Fraunces** | Variable, with an optical-size axis genuinely useful at display sizes. Warm, slightly quirky. Strong default. |
| **Instrument Serif** | High contrast, elegant, very editorial. Single weight keeps it light. |
| **Newsreader** | Cleaner and more neutral. Safer, less distinctive. |

**Body**: the system stack. Renders instantly, no request, no layout shift, and
in a well-set editorial layout the body face is close to invisible — the display
type and spacing carry the impression.

```
--font-display: 'Fraunces', Georgia, 'Times New Roman', serif;
--font-sans:    ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto,
                'Helvetica Neue', Arial, sans-serif;
--font-mono:    ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
```

Rules for the display face:

- **Self-hosted**, subsetted to Latin. Never Google Fonts' CDN — extra
  connection, worse privacy.
- One variable file, or one static weight. Not a family.
- `font-display: swap`, with `size-adjust` / `ascent-override` tuned on the
  fallback so the swap doesn't shift layout.
- `<link rel="preload">` it — it's above the fold in the hero.
- Headings and display elements only. **Body text stays on the system stack.**

If, after building, the page still feels generic, add a body face in Phase 4 and
measure the cost. Don't spend that budget before you know you need it.

#### Scale

Editorial needs more range than a typical app — the gap between body and display
is where the drama lives. Fluid, `clamp()`-based.

| Token | Size | Use |
| --- | --- | --- |
| `--text-xs` | 0.79rem | Metadata, dates, role labels |
| `--text-sm` | 0.889rem | Chips, captions |
| `--text-base` | 1.0625rem | Body — slightly above 16px, editorial convention |
| `--text-lg` | 1.2rem | Lead paragraphs |
| `--text-xl` | 1.5rem | Card titles, h3 |
| `--text-2xl` | 1.9rem | h2 |
| `--text-3xl` | clamp(2.2rem, 4vw, 3rem) | Page titles, section headers |
| `--text-deck` | clamp(1.5rem, 3.2vw, 2.4rem) | **Role headline accomplishments** |
| `--text-display` | clamp(3rem, 8vw, 5.5rem) | Name in hero, metric figures |

`--text-deck` is the token that makes the editorial treatment work. Every
featured role's `headline` is set at this size — large enough to read as a
statement, not a bullet.

Prose measure capped at **68 characters**. Deck lines can run wider (~28–34
characters) because they're display type, set short by nature.

### Spacing, grid, rhythm

4px base. Editorial layouts want larger section rhythm than app layouts —
`--space-section: clamp(4rem, 10vw, 8rem)` between major landing sections.

Containers:

- `--w-prose: 68ch` — MDX body content
- `--w-content: 1100px` — cards, grids, resume
- `--w-wide: 1400px` — full-bleed moments

A 12-column grid on the landing page enables deliberate asymmetry: metadata in a
narrow left column, deck and body in a wider right column. That asymmetry is a
large part of what reads as "designed" rather than "stacked divs."

Hairline rules (`--color-rule` at low opacity) separate sections. Cheap, and very
editorial.

Breakpoints: 640 / 768 / 1024 / 1280. Mobile-first — the hero must be excellent
at 375px, because a meaningful share of recruiters open the link on a phone
between meetings.

## Motion

Editorial motion is restrained and reader-driven. Nothing performs.

### Scroll-driven animation — CSS only

Native CSS scroll-driven animations (`animation-timeline: view()` / `scroll()`)
provide scroll-linked reveals, the career-timeline progress rule, and section
transitions **with zero JavaScript**. No IntersectionObserver, no library.

**The pattern is opt-in, never opt-out.** This matters more than anything else in
this section:

```css
/* Visible by default. Always. */
.reveal { opacity: 1; transform: none; }

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal {
      animation: reveal linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 50%;
    }
  }
}

@keyframes reveal {
  from { opacity: 0; transform: translateY(1rem); }
  to   { opacity: 1; transform: none; }
}
```

Writing this backwards — hiding content by default and revealing it with the
animation — makes your content **invisible** in any browser without support, and
for anyone with reduced-motion enabled. That is a catastrophic, silent failure on
a site whose purpose is being read. Never author it that way.

Support is real but not universal (Chromium and Safari; Firefox has lagged).
That's acceptable precisely because it's progressive enhancement: unsupported
browsers get a clean static page, which is the baseline anyway.

Constraints:

- **Never on the hero.** Name, headline, and contact render immediately at full
  opacity on first paint.
- Subtle: ≤1rem of movement, opacity from 0.
- `transform` and `opacity` only.
- Never on primary text a reader is trying to scan.

### Other motion

- Durations: 150ms (state), 250ms (enter/exit). Nothing over 300ms.
- Easing: `cubic-bezier(0.2, 0, 0, 1)`
- `prefers-reduced-motion: reduce` disables all non-essential motion as a global
  base-stylesheet rule, not per component.

### Still excluded

Relaxing the scroll-animation ban does **not** relax these:

- **Scroll-jacking** — hijacking scroll speed or position. Distinct from
  scroll-*linked* animation, which responds to natural scrolling. The first
  takes control from the reader; the second doesn't.
- Hero animations that delay the name, headline, or contact
- Typewriter effects on your job title
- Custom cursors and cursor-follow effects
- Horizontal scroll sections
- Preloader screens
- Sound
- 3D backgrounds

## Components

**`src/components/` — `.astro`, zero JS.** Nearly everything:

`Button`, `Link`, `Chip`, `Badge`, `Card`, `Prose`, `Icon`, `VisuallyHidden`,
`Rule`, `SectionHeader`, `Deck`, `MetricFigure`, `ExperienceEntry`,
`ProjectCard`, `StackChips`, `SkillsComposition`, `ResumeSection`,
`Header`, `Footer`, `SEO`

**MDX-mapped** — available in content with no imports: `Callout`, `Figure`,
`CodeBlock`, `Comparison`, `Metric`, `Aside`, `DemoFrame`

**`src/islands/` — `.tsx`, ships JS.** Should stay nearly empty.

Astro scopes component styles by default, so components own their CSS with no
naming convention and no leakage.

## Accessibility

A build requirement, not a final pass. On a site aimed at engineering employers,
an inaccessible portfolio is a visible technical failure.

- **Contrast**: WCAG AA minimum, verified in CI
- **Keyboard**: everything reachable and operable; visible `:focus-visible` ring
- **Semantics**: real landmarks, one `<h1>`, no skipped heading levels
- **Skip link** as the first focusable element
- **Images**: meaningful `alt`, or `alt=""` when decorative
- **Display type must still meet contrast** — large type lowers the *required*
  ratio, but the palette above clears the stricter bar anyway
- **Reduced-motion produces a complete, correct page**, not a degraded one
- CI runs `axe-core` against every built route and fails on violations

## Performance budget

Enforced in CI. Violations fail the build.

| Metric | Budget |
| --- | --- |
| JS — landing, resume, project index, stack (gzip) | **≤ 2KB** (inline theme script only) |
| JS — a project page with an island | ≤ 100KB |
| CSS (gzip) | ≤ 30KB |
| Font payload | **≤ 45KB** (one subsetted variable display face) |
| LCP (mid-tier mobile, 4G) | ≤ 1.4s |
| CLS | ≤ 0.02 |
| Lighthouse Performance | 100 |
| Lighthouse Accessibility | 100 |

Two budgets moved to pay for the editorial direction: fonts 30 → 45KB, LCP
1.2 → 1.4s. That is the entire cost of it — because the motion is CSS and the
layout is static, **"flashy" here costs one font file and nothing else.**

The JavaScript budget did not move and will not. If a page starts shipping
unexpected JS, something was accidentally made an island — that's a bug, not a
tradeoff.

The budget protects a specific outcome: a recruiter on hotel wifi sees your name
and headline immediately. Everything else is negotiable; that is not.
