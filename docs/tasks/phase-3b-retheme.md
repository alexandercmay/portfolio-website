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

## 3b.9 Deep space and section restructure *(added after second review)*

Requested: less grid, more space/NASA; sections looked dull and awkwardly
formatted on their own.

- [x] Replace the 32px graph grid with a **three-layer starfield** at
      520/340/210px pitches
- [x] Fixed **nebula wash** in violet and cyan behind everything
- [x] Deeper, bluer ground (`#0a0d12` → `#060910`)
- [x] Keep one faint coordinate grid at 128px — a hint of measurement, not a
      technical drawing
- [x] **Light mode has no starfield** — star tokens resolve to `transparent`,
      because dark specks on white read as dirt, not space
- [x] **Re-verify contrast against the new ground** — all 56 pairs AA, floor
      4.68; test regex updated to track the changed `--c-bg`
- [x] Measure the star worst case: small text on the brightest star is
      **1.11:1**, so sustained reading moved onto opaque surfaces
- [x] `.reading-surface` on project bodies, about, and the resume
- [x] `.module` console panels — titled header bar over a body
- [x] **Merge Skills and Education into one two-column module band.** A single
      degree in a full-width section read as lonely; paired it reads as an
      instrument panel.
- [x] Renumber sections consecutively after the merge (01–04)
- [x] Verify landmarks survived the restructure — all pages: one `<header>`,
      one `<h1>`, zero unnamed sections, skip link present
- [x] Scan test still passes at 375px with the longer summary

## 3b.10 Cosmic starfield and content restructure *(third review)*

- [x] **Starfield read as dust.** Every bright star is now a core plus a halo
      (5–7× the core radius, low alpha) with real stellar colour — blue-white,
      cyan, violet, gold. The glow is what makes a 1.4px dot read as a star
      rather than a speck.
- [x] **Remove the metrics band.** 1M+ / <7s / 50+ standing alone had no
      surrounding explanation; a number without context is not evidence. The
      same figures still do work inside the experience highlights, where the
      sentence supplies the meaning. `metrics` removed from the model and
      `MetricFigure` deleted rather than left as dead code.
- [x] "Selected experience" → **Experience**
- [x] "Selected work" → **Projects**
- [x] Full-timeline link moved to the END of Experience and relabelled
      "View the full detailed timeline" — it targets `/resume`, which already
      lists every role in reverse-chronological order with full highlights
- [x] **Education split into its own section** with a relevant-coursework grid,
      rather than a narrow column in a combined "Systems & credentials" band
- [x] Placeholder coursework added and flagged as placeholder in
      `content/resume.ts`
- [x] Sections renumbered 01–05

### A bug worth recording

The edit that split Education **silently deleted the entire Contact section**.
The build passed, types passed, and all 125 tests passed — nothing asserted the
page's shape, so a whole section vanished without a single failure. Only a
manual DOM check caught it.

- [x] Added a structure test asserting all five sections exist, in order, with
      consecutive indexes, and that the page still reaches a `mailto:` link

## 3b.11 Skill galaxy *(fourth review)*

Requested: interactive skills with hover feedback, clustered like a galaxy with
one cluster per category.

- [x] `SkillGalaxy` — one constellation per category, spokes from the centroid
- [x] Positions solved at BUILD time; zero JavaScript shipped
- [x] Hover: star scales, dot glows, name goes cyan, other stars dim to 0.35
      and cluster labels to 0.4 (`:has()`)
- [x] **Hover is emphasis only** — every skill name is visible at all times, so
      keyboard and touch users lose nothing
- [x] Scatter is `aria-hidden`; a plain grouped list is the screen-reader path
      and the render below 60rem
- [x] Verified hover with a real pointer move, reading computed styles after
      the transition settled — name `rgb(34,211,238)`, dot `scale(1.5)`, star
      `scale(1.12)`, others `0.35`

### The bug, and the guard

The first placement scattered stars on a jittered ring and produced **eleven
overlapping label pairs**. Because labels are monospace their widths are
exactly predictable, so the layout now runs ~90 iterations of pairwise
repulsion against real box sizes. Zero overlaps across all 30 elements.

- [x] Regression test recomputes boxes from the rendered markup and asserts no
      collisions — **verified to fail** by collapsing clusters to a point and
      disabling relaxation

**Stated cost:** a scatter is harder to scan than a column. `/resume` keeps the
plain grouped list so a scannable version always exists.
