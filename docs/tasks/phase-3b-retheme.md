# Phase 3b — Retheme: instrument panel

**Goal:** replace the editorial visual direction with the dark-first,
instrument-panel direction. Content, routes, and data model are unchanged.

Reference: `04-design-system.md` (rewritten), `06-decisions.md` D-015.

**Why this is 3b and not a Phase 4 item:** it touches every component, and the
site should not go into applications looking one way and then change. Do it
before the milestone, not after.

---

## 3b.1 Tokens

- [x] Rewrite `src/styles/tokens.css` dark-first: **dark on bare `:root`**,
      light under `[data-theme='light']`
- [x] Add a `prefers-color-scheme: light` block guarded by
      `:not([data-theme='dark'])`, so a light-preferring visitor gets light
      with no JavaScript
- [x] Four semantic accents: `cyan` / `lime` / `violet` / `amber`, each meaning
      one thing (see the accent-semantics table)
- [x] Radii: 6 / 10 / 14 / 20 / full
- [x] Add `--c-grid` for the measured background
- [x] Retune the type scale — mono is wider per character, so display sizes
      come **down** from the editorial values or the name overflows a phone
- [x] Re-verify **all 42 colour pairs** against all three grounds in both
      themes. Do not check against `--c-bg` alone; that is the check that
      missed two failures during design.

## 3b.2 Type

- [x] Install `@fontsource-variable/jetbrains-mono`, remove Fraunces
- [x] Copy the Latin `wght` subset to `public/fonts/` (40KB)
- [x] Update the preload in `BaseLayout` to the new file — a stale preload
      silently fetches a font nothing uses
- [x] Metric-matched fallback: measure JetBrains Mono against the system mono
      stack with fontkit, do not guess `size-adjust`
- [x] `letter-spacing: -0.02em` on mono headings — untightened mono at display
      size reads as a code listing
- [x] Body prose stays on the **system sans stack**
- [x] Verify the font payload stays ≤45KB and CLS ≤0.02

## 3b.3 Instrument language

- [x] Measured grid behind the page, masked out behind prose containers
- [x] `Label` component — uppercase mono micro-label, wide tracking
- [x] `StatusDot` — filled circle in the status accent; `lime` pulses for
      `active`
- [x] Section indexes (`01 /`, `02 /`) on landing sections
- [x] Units rendered as distinct, dimmer spans on metric readouts
- [x] Tick marks where a scale is implied (metrics band, experience rail)
- [x] **Verify the grid does not reduce text contrast** — it is decorative and
      must not cost a single AA pair

## 3b.4 Components

Restyle, do not rewrite. Structure and accessibility work from Phases 1–2 stays.

- [x] `Button` — rounded, hard border, cyan primary, glow on hover
- [x] `Chip` / `Badge` — `--radius-sm`, mono, dimmer border
- [x] `Card` — `--radius-lg`, 1px border, no soft shadow
- [x] `StatusDot` wired into `Badge` so status is a dot **and** a label
- [x] `MetricFigure` — mono readout, unit span, tick marks
- [x] `ExperienceEntry` — mono metadata column, scroll-linked rail
- [x] `Deck` — mono, tightened, retuned size
- [x] `SectionHeader` — index prefix, rule
- [x] `Header` / `Footer` — mono nav, grid-aware borders
- [x] `Prose` — sans body, mono headings, styled code blocks
- [x] Delete anything editorial-only that no longer earns its place

## 3b.5 Motion

- [x] `.reveal` — **keep the opt-in contract exactly as it is**
- [x] `.reveal-stagger` — sequenced children via `animation-delay`
- [x] Scroll progress rail on the experience section, via `scroll()`
- [x] Metric readouts settle in on entry
- [x] Hover transitions ≤150ms, `transform`/`opacity`/`border-color` only
- [x] **Nothing on the hero** — full opacity, first paint
- [x] Re-verify the reveal guard still catches an inverted `.reveal`
- [x] Test with `prefers-reduced-motion: reduce` — complete, correct page
- [x] Test without `animation-timeline` support — **all content visible**

## 3b.6 Verification

- [x] All 42 colour pairs AA, computationally
- [x] Contrast holds **over the grid**, not just over flat backgrounds
- [x] Status is never colour-only
- [x] Zero JS: still 1 inline script, 0 external, 0 orphaned assets
- [x] Budgets: CSS ≤30KB gzip, font ≤45KB
- [x] Scan test at 375px still passes — name, headline, contact, no scroll
- [x] Landmarks intact: one `<header>`, one `<h1>`, skip link, named sections
- [x] Both themes visually checked — *verified at the paint level.* The
      browser pane's screenshot pipeline returned stale frames that showed
      dark while computed styles said light, so both themes were confirmed by
      reading resolved `background-color` / `color` instead of trusting the
      capture: light `rgb(246,248,250)` / dark `rgb(10,13,18)`, cyan headline
      correct in each.
- [x] Full gate: lint, format, typecheck, build, test, deploy dry-run

---

**Exit criteria:** the site reads as an instrument panel, every AA pair verified
in both themes, zero JavaScript, and the scan test still passes at 375px.

---

## 3b.7 Glow and lab atmosphere *(added after first review)*

Requested: more physics-lab feel, more glow, more scroll animation.

- [x] Glow tokens — cyan / cyan-lg / lime / violet
- [x] **Glow never on body text** — accents, borders, large display type only
- [x] Ambient radial wash behind the hero, `z-index: -1`
- [x] Vignette at the page edges, `pointer-events: none`
- [x] Lit grid intersection nodes on a coarser pitch
- [x] Registration marks on cards
- [x] Glow on: primary button, card/chip hover, status LEDs, scroll rail,
      metric ticks and units, section indexes, hero name
- [x] `.reveal-x`, `.charge`, `.draw-x` motion utilities
- [x] Page scroll-progress trace via `scroll()` timeline
- [x] Stagger extended past four children
- [x] **Every content motion utility added to the opt-in guard**, each verified
      by inverting it and watching the suite fail
- [x] `.draw-x` given its own `scaleX(0)` guard, since it is transform-only
- [x] Removed `background-attachment: fixed` — full repaint per scroll frame,
      known jank on mobile Safari, not worth it against the budget
- [x] Verified no animated element is hidden while in view (25 tracked, 0 hidden)

## 3b.8 Hero copy *(added after first review)*

- [x] Rewrite `basics.summary` to lead with what he builds and wants, not where
      he built it. The previous version opened with "I spent two years at Dell"
      — the first thing a reader saw was an employer, not a capability.
