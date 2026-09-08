/**
 * Generates src/styles/starfield.css.
 *
 * WHY THIS EXISTS
 *
 * The star field used to be 92 CSS radial-gradients on `body`. It scrolls with
 * the page, so the background layer is the size of the whole DOCUMENT — around
 * 1440x4600, or 6.7 million pixels — and the browser rasterizes fresh tiles of
 * it as you scroll. Every one of those tiles had to evaluate all 92 gradient
 * layers. That is what made scrolling feel heavy; it was measured as a
 * scrolling symptom, not a load or hover one.
 *
 * Baking each tier into ONE tiled SVG collapses that to five image layers. An
 * image is decoded once and then blitted, rather than 92 gradients being
 * evaluated per pixel per tile.
 *
 * The colours are read out of tokens.css at generate time, so the tokens stay
 * the single source of truth. The one thing that could NOT survive the move is
 * light mode: it used to work by resolving every star token to `transparent`,
 * which silently made the gradients render nothing. A baked image cannot read
 * a custom property, so the generated file turns the field off explicitly with
 * the same selectors tokens.css uses.
 *
 * Run: npm run gen:starfield
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const TOKENS = join(root, 'src/styles/tokens.css')
const OUT = join(root, 'src/styles/starfield.css')

/**
 * Dark-mode token values.
 *
 * The dark `:root` block comes first in tokens.css and the light overrides
 * follow it, so the FIRST occurrence of each name is the dark one.
 */
function readTokens(): Record<string, string> {
  const css = readFileSync(TOKENS, 'utf8')
  const out: Record<string, string> = {}
  for (const m of css.matchAll(/(--c-[a-z-]+):\s*([^;]+);/g)) {
    if (!(m[1] in out)) out[m[1]] = m[2].trim()
  }
  return out
}

const T = readTokens()

/** `#rrggbb` or `rgb(r g b / a%)` → an SVG stop-color + stop-opacity pair. */
function stop(token: string): { color: string; opacity: number } {
  const v = T[token]
  if (!v) throw new Error(`missing token ${token} in tokens.css`)
  const rgba = v.match(/rgb\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\/\s*([\d.]+)%\s*\)/)
  if (rgba) {
    const hex = [rgba[1], rgba[2], rgba[3]]
      .map((n) => Number(n).toString(16).padStart(2, '0'))
      .join('')
    return { color: `#${hex}`, opacity: Number(rgba[4]) / 100 }
  }
  return { color: v, opacity: 1 }
}

/**
 * Blue-noise points in a unit square, deterministic per seed.
 *
 * Distances are WRAPPED, because the tile repeats: without that, points clump
 * against their own seam and the repeat becomes visible as a grid of clusters.
 */
function field(seed: number, n: number, minDist: number): [number, number][] {
  let s = seed >>> 0
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296
  const pts: [number, number][] = []
  for (let tries = 0; pts.length < n && tries < n * 4000; tries++) {
    const p: [number, number] = [rnd(), rnd()]
    const ok = pts.every((q) => {
      const dx = Math.min(Math.abs(p[0] - q[0]), 1 - Math.abs(p[0] - q[0]))
      const dy = Math.min(Math.abs(p[1] - q[1]), 1 - Math.abs(p[1] - q[1]))
      return Math.hypot(dx, dy) >= minDist
    })
    if (ok) pts.push(p)
  }
  return pts
}

const r2 = (n: number) => +n.toFixed(2)

/**
 * One tier → a `url("data:image/svg+xml,...")` background layer.
 *
 * The SVG is written with plain `#` in its internal `url(#id)` gradient
 * references and encoded ONCE here. Pre-escaping those to `%23` by hand and
 * then encoding produced `%2523`, every gradient reference dangled, and the
 * whole field rendered empty — with no error anywhere.
 */
function tier(opts: { tile: number; defs: string; body: string }): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${opts.tile}' height='${opts.tile}' ` +
    `viewBox='0 0 ${opts.tile} ${opts.tile}'>` +
    `<defs>${opts.defs}</defs>${opts.body}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

/** A soft dot: opaque at the centre, gone at the edge — a CSS radial-gradient. */
function softGradient(id: string, token: string, fadeAt = 1): string {
  const { color, opacity } = stop(token)
  return (
    `<radialGradient id='${id}'>` +
    `<stop offset='0' stop-color='${color}' stop-opacity='${opacity}'/>` +
    (fadeAt < 1
      ? `<stop offset='${fadeAt}' stop-color='${color}' stop-opacity='0'/>` +
        `<stop offset='1' stop-color='${color}' stop-opacity='0'/>`
      : `<stop offset='1' stop-color='${color}' stop-opacity='0'/>`) +
    `</radialGradient>`
  )
}

const layers: { css: string; size: number }[] = []

// ── hero: halo, hard core, and the diffraction spikes a bright star throws
//    through a lens. Rare on purpose. ──────────────────────────────────────
{
  const tile = 1500
  const heroes = [
    { spike: 26, spikeTok: '--c-spike-blue', halo: 9, haloTok: '--c-halo-blue', core: 2 },
    {
      spike: 22,
      spikeTok: '--c-spike-gold',
      halo: 8,
      haloTok: '--c-halo-gold',
      core: 1.8,
    },
    {
      spike: 20,
      spikeTok: '--c-spike-cyan',
      halo: 8,
      haloTok: '--c-halo-cyan',
      core: 1.7,
    },
  ]
  const pts = field(7, 3, 0.34)
  let defs = softGradient('c', '--c-star-core')
  let body = ''
  heroes.forEach((h, i) => {
    const [px, py] = pts[i]
    const x = r2(px * tile)
    const y = r2(py * tile)
    defs += softGradient(`s${i}`, h.spikeTok) + softGradient(`h${i}`, h.haloTok, 0.7)
    body +=
      `<ellipse cx='${x}' cy='${y}' rx='${h.spike}' ry='1' fill='url(#s${i})'/>` +
      `<ellipse cx='${x}' cy='${y}' rx='1' ry='${h.spike}' fill='url(#s${i})'/>` +
      `<circle cx='${x}' cy='${y}' r='${h.halo}' fill='url(#h${i})'/>` +
      `<circle cx='${x}' cy='${y}' r='${h.core}' fill='url(#c)'/>`
  })
  layers.push({ css: tier({ tile, defs, body }), size: tile })
}

// ── bright: halo then core. Sparse on purpose. ───────────────────────────
{
  const tile = 1100
  const bright = [
    { halo: 9, haloTok: '--c-halo-blue', core: 1.6, coreTok: '--c-star-core' },
    { halo: 11, haloTok: '--c-halo-cyan', core: 1.5, coreTok: '--c-star-cyan' },
    { halo: 9, haloTok: '--c-halo-violet', core: 1.4, coreTok: '--c-star-violet' },
    { halo: 8, haloTok: '--c-halo-gold', core: 1.3, coreTok: '--c-star-gold' },
  ]
  const pts = field(11, 4, 0.3)
  let defs = ''
  let body = ''
  bright.forEach((b, i) => {
    const [px, py] = pts[i]
    const x = r2(px * tile)
    const y = r2(py * tile)
    defs += softGradient(`h${i}`, b.haloTok, 0.7) + softGradient(`k${i}`, b.coreTok)
    body +=
      `<circle cx='${x}' cy='${y}' r='${b.halo}' fill='url(#h${i})'/>` +
      `<circle cx='${x}' cy='${y}' r='${b.core}' fill='url(#k${i})'/>`
  })
  layers.push({ css: tier({ tile, defs, body }), size: tile })
}

/** The plain tiers: one soft dot per star, coloured by token. */
function dotTier(
  tile: number,
  seed: number,
  minDist: number,
  spec: { token: string; r: number; n: number }[],
) {
  const total = spec.reduce((n, s) => n + s.n, 0)
  const pts = field(seed, total, minDist)
  const tokens = [...new Set(spec.map((s) => s.token))]
  const defs = tokens.map((t, i) => softGradient(`g${i}`, t)).join('')
  let body = ''
  let k = 0
  for (const s of spec) {
    for (let j = 0; j < s.n; j++, k++) {
      if (!pts[k]) break
      const x = r2(pts[k][0] * tile)
      const y = r2(pts[k][1] * tile)
      body += `<circle cx='${x}' cy='${y}' r='${s.r}' fill='url(#g${tokens.indexOf(s.token)})'/>`
    }
  }
  layers.push({ css: tier({ tile, defs, body }), size: tile })
}

// ── mid field ────────────────────────────────────────────────────────────
dotTier(800, 23, 0.14, [
  { token: '--c-star-blue', r: 1.1, n: 4 },
  { token: '--c-star-gold', r: 1.1, n: 2 },
  { token: '--c-star-mid', r: 1, n: 8 },
])

// ── far field: mostly cool, with the warm ones scattered in ──────────────
dotTier(600, 37, 0.1, [
  { token: '--c-star-far', r: 0.8, n: 14 },
  { token: '--c-star-far-warm', r: 0.7, n: 8 },
  { token: '--c-star-far-rose', r: 0.7, n: 4 },
])

// ── the faintest tier: barely above the ground, and most of the depth ────
dotTier(700, 53, 0.09, [
  { token: '--c-star-dim', r: 0.6, n: 19 },
  { token: '--c-star-dim-warm', r: 0.5, n: 11 },
])

const GRID = [
  'linear-gradient(var(--color-grid) 1px, transparent 1px)',
  'linear-gradient(90deg, var(--color-grid) 1px, transparent 1px)',
]

const images = [...layers.map((l) => l.css), ...GRID]
const sizes = [
  ...layers.map((l) => `${l.size}px ${l.size}px`),
  '128px 128px',
  '128px 128px',
]

const out = `/* GENERATED FILE — do not edit by hand.
   Regenerate with: npm run gen:starfield
   Source of truth for every colour here is src/styles/tokens.css.
   Rationale for baking the field into images lives in the generator,
   scripts/generate-starfield.ts. */

/* ── Deep space ──────────────────────────────────────────────────────────
   Each bright star is a CORE plus a HALO, the halo 5-7x the core radius at
   low alpha. A bare dot at this size reads as dust, which is exactly what the
   first version looked like. The glow is what makes it read as a star.

   Colours span blue-white through gold, because real stars have colour
   temperature and a uniform grey field looks like noise. The WARM ones are
   deliberately in the faint tiers: real skies are mostly dim red dwarfs, and
   blue-white is what a rare bright star looks like.

   FIVE tiers, and the ratio between them is the point. A real deep field is
   thousands of faint stars and a handful of bright ones; an early version was
   roughly flat — 13 bright per 1440x900 screen against 27 faint — which reads
   as confetti rather than as distance.

   TILE SIZES are set against the VIEWPORT, and star counts scale WITH them.
   The far field once repeated every 230px: six copies of the same five dots
   across one screen, and the eye finds that immediately. Nothing now repeats
   more than about twice across a wide screen. Growing a tile without growing
   its star count just thins the sky out — that mistake made the field five
   times sparser and read as emptier rather than deeper.

   EVERYTHING here scrolls with the page. The spiked hero stars were briefly a
   separate fixed layer that held still while the rest of the sky moved, which
   read as smudges on the screen rather than as stars behind it.

   Stars are HIGH-CONTRAST POINTS, unlike a uniform grid — small text over the
   brightest one measures 1.11:1 — so the bright tiers stay sparse and all
   sustained reading sits on an opaque \`.reading-surface\` or \`.module\`. Depth
   is bought in the faint tiers, which cost almost no contrast.
   ─────────────────────────────────────────────────────────────────────── */
body {
  background-image:
    ${images.join(',\n    ')};
  background-size:
    ${sizes.join(',\n    ')};
}

/* Light mode has no starfield — dark specks on white read as dirt, not as
   space. This used to fall out of the star tokens resolving to transparent;
   a baked image cannot read a custom property, so it is explicit now. Only
   the coordinate grid survives. Selectors mirror tokens.css exactly. */
@media (prefers-color-scheme: light) {
  :root:not([data-theme='dark']) body {
    background-image:
      ${GRID.join(',\n      ')};
    background-size:
      128px 128px,
      128px 128px;
  }
}

:root[data-theme='light'] body {
  background-image:
    ${GRID.join(',\n    ')};
  background-size:
    128px 128px,
    128px 128px;
}
`

writeFileSync(OUT, out)
const kb = (out.length / 1024).toFixed(1)
console.log(`wrote ${OUT} — ${layers.length} image layers + ${GRID.length} grid, ${kb}kB`)
