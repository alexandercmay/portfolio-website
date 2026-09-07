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

## 3b.12 Constellation identity and celestial backdrop *(fifth review)*

Requested: cluster names too alike, hovering a name should light its cluster,
and the background's "random splotches of colour" looked funky.

- [x] **Spectral-class palette for clusters**, deliberately separate from the
      semantic accents — cyan/lime/violet/amber each mean one thing, and
      spending them on skill categories would make them mean nothing. The
      cluster hues follow stellar spectral classes (O/B blue, A white, F gold,
      K orange, M rose), so the distinction has an astronomical rationale.
- [x] All 30 spectral pairs verified to AA in both themes **before** the values
      were written down. Light gold darkened twice: `#a16207` cleared `--c-bg`
      but failed `--c-raised`.
- [x] Labels gained a **catalog designation** (`NGC 1147`) and a member count,
      so clusters differ by more than hue — necessary for anyone who cannot
      separate them by colour
- [x] Clusters nested into their own containers so a label hover can reach its
      own stars; containers are pointer-transparent, children are not
- [x] **Hovering a category name lights its whole constellation** and recedes
      the others, via `:has()` — verified with a real pointer: dots
      `scale(1.4)`, names in the spectral hue, other clusters at `0.3`
- [x] **Backdrop reworked**: two round colour blobs replaced by a diagonal
      galactic band, concentric orbital rings from an off-screen focus, and a
      low horizon glow. The hero wash became directional rather than two
      spotlights.
- [x] Tests: distinct hue per cluster, designation and count present, the
      label-hover rules survive the build, and the spectral palette is provably
      disjoint from the semantic accents

### Two test bugs found while writing those tests

- A category check compared `Backend & infrastructure` against markup where it
  is `&amp;` — the same escaping trap as earlier.
- The contrast parser sliced hex by fixed offsets, but Lightning CSS minifies
  `#ffffff` to `#fff`, so `--c-surface` parsed as NaN and **every ratio against
  it was silently garbage**. Fixed in both copies of the parser, including the
  older grid-contrast one where it had not yet caused a visible failure.

## 3b.13 Simpler backdrop, uncrowded clusters *(sixth review)*

- [x] **Removed the concentric orbital rings** — they read as geometry drawn on
      the page rather than as sky. The diagonal galactic band went with them.
- [x] Backdrop is now **dust clouds and bright stars only**: four wide,
      desaturated, overlapping ellipses at 5–7% alpha
- [x] **Bright stars** as a separate fixed layer — halo, hard core, and two
      thin elongated gradients forming diffraction spikes (the cross flare).
      The spikes are what make a star read as a star and not a speck.
- [x] Cluster crowding fixed: tighter intra-cluster spread, centres placed
      further apart, a taller canvas (620 → 760), and a per-pass cohesion pull
- [x] The component now **publishes its canvas size** as `data-canvas`, so the
      overlap test reads it instead of duplicating the constant — the
      hardcoded copy broke the moment the canvas grew
- [x] Regression test: mean cluster radius < 95px, closest cross-cluster pair
      > 130px. Measured: ~57px and 208px.

### A causal claim I got wrong

I introduced a larger repulsion margin for different-cluster pairs and wrote
that it was "the fix for cluster crowding." **It isn't.** Varying
`MARGIN_OTHER` from 6 to 46 changes the closest cross-cluster distance not at
all — 208px in every case — because the cohesion pull keeps nodes near their
own centre long before a foreign node gets close.

Measured properly by disabling cohesion instead: mean cluster radius grows
57px → 76px and separation falls 208px → 187px. **Cohesion, tighter spread and
wider centres are what separate the clusters.** The margin is kept only as a
safety net for when the skill list grows, and the comment now says so.

This surfaced because a guard I wrote failed to fail — a test that cannot
detect the thing it claims to protect is worse than no test, so it was worth
chasing down rather than accepting the green run.

## 3b.14 Cluster spacing, retuned *(seventh review)*

Feedback: clusters too far apart, and crowded internally. Both true — the
previous pass over-corrected in both directions at once.

Tuned against measurement rather than guessed:

| | radius | gap |
| --- | --- | --- |
| first pass | 46–57px | 208px |
| **now** | **78–108px** | **57px** |

- [x] Intra-cluster spread `52 + n*9` → `100 + n*14`
- [x] Cohesion `0.012` → `0.003` — this is the dial that controls how tight a
      constellation reads, more than any repulsion margin
- [x] Cluster centres moved inward; canvas 760 → 660
- [x] Regression thresholds rewritten for the new intent

### The tradeoff, stated plainly

Radius and gap **move against each other**. In a fixed canvas, looser clusters
necessarily sit closer to their neighbours; there is no setting that makes
clusters both roomier inside and further apart without enlarging the canvas,
which is what made them feel marooned in the first place.

So clusters are now **adjacent by design**, and what distinguishes them is the
spectral colour and the label — not distance. The guard changed accordingly:
"keep clusters far apart" was the wrong assertion. What matters is that a
cluster does not sprawl across the canvas, that it is not squeezed into a knot,
and that no two labels collide (asserted separately in the overlap test).
