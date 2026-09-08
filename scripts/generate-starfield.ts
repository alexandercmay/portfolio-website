/**
 * Generates src/styles/starfield.css.
 *
 * WHY THIS EXISTS
 *
 * The star field used to be 92 CSS radial-gradients on `body`. It scrolls with
 * the page, so the background layer is the size of the whole DOCUMENT — around
 * 1440x4600, or 6.7 million pixels — and the browser rasterizes fresh tiles of
 * it as you scroll. Every one of those tiles had to evaluate all 92 gradient
 * layers. That is what made scrolling feel heavy.
 *
 * Baking each tier into ONE tiled image collapses that to five image layers.
 * An image is decoded once and then blitted.
 *
 * WHY THE TILES ARE PNG AND NOT SVG
 *
 * The first version of this fix baked them as inline SVG, which fixed the
 * gradient-evaluation cost and introduced a worse one. An SVG background is a
 * VECTOR source: the browser has no cached bitmap for it, so it rasterizes at
 * the DESTINATION device scale, and re-rasterizes whenever that scale changes
 * or the cache entry is evicted. These tiles are large — the biggest is
 * 1500x1500 CSS px — and raster cost is quadratic in tile size. On a Retina
 * display the five tiers came to 19.8 MEGAPIXELS, about 76MB of raster, to
 * carry roughly 77 stars. The hero tier alone was a 3000x3000 bitmap holding
 * THREE stars.
 *
 * That overruns the image cache, so tiles get evicted and re-rasterized mid
 * scroll. Measured on the real page it produced 500ms frames with a 1.3s
 * worst case, in dark mode only — light mode has no star images at all, and
 * held a locked 60fps through the identical scroll. That asymmetry is the
 * whole diagnosis.
 *
 * A PNG is a RASTER source. It is decoded once at its own intrinsic size and
 * the GPU scales it, so cost stops depending on the display's pixel ratio and
 * the same five tiers come to 5 megapixels instead of 19.8.
 *
 * Nothing in this field has a hard edge — every shape is a radial gradient
 * that fades to zero — so there is no high-frequency detail for a fixed
 * resolution to lose. That is precisely why this content can afford to be a
 * bitmap and, say, body text could not.
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
import { deflateSync } from 'node:zlib'
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

type Paint = { r: number; g: number; b: number; a: number }

/** `#rrggbb` or `rgb(r g b / a%)` → 0-255 channels plus a 0-1 alpha. */
function paint(token: string): Paint {
  const v = T[token]
  if (!v) throw new Error(`missing token ${token} in tokens.css`)
  const rgba = v.match(/rgb\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\/\s*([\d.]+)%\s*\)/)
  if (rgba) {
    return {
      r: Number(rgba[1]),
      g: Number(rgba[2]),
      b: Number(rgba[3]),
      a: Number(rgba[4]) / 100,
    }
  }
  const hex = v.match(/^#([0-9a-f]{6})$/i)
  if (!hex) throw new Error(`token ${token} is neither #rrggbb nor rgb(... / ...%): ${v}`)
  const n = parseInt(hex[1], 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 }
}

/* ── PNG ──────────────────────────────────────────────────────────────────
   A minimal 8-bit RGBA encoder. Node ships the only hard part (deflate) in
   node:zlib, so this needs no dependency.

   Every scanline uses filter 0 (None). The usual reason to pick a smarter
   filter is to turn gradients into small deltas, but these tiles are ~99%
   fully transparent black, and long runs of zero are what deflate is best at
   — the filtered forms measure larger here, not smaller.
   ─────────────────────────────────────────────────────────────────────── */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 255] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data])
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePNG(w: number, h: number, rgba: Uint8Array): Buffer {
  const stride = w * 4
  const raw = Buffer.alloc(h * (stride + 1))
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0
    raw.set(rgba.subarray(y * stride, y * stride + stride), y * (stride + 1) + 1)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', new Uint8Array(0)),
  ])
}

/* ── Rasterizer ───────────────────────────────────────────────────────────
   Small enough to be worth having rather than pulling in a canvas.

   A tile is a premultiplied RGBA float buffer that shapes composite into
   source-over, in draw order — same as the SVG it replaces, so a hero's
   spikes, halo and core still stack correctly.

   Shapes are drawn 4x4 SUPERSAMPLED, and only inside their own bounding box.
   The faint tiers are sub-pixel dots (r as low as 0.5), so point sampling
   turns them into a flickering mess of on/off pixels; and since every shape is
   tiny next to the tile, restricting to the bbox is what keeps a 1500x1500
   tile in the tens of milliseconds rather than the tens of seconds.
   ─────────────────────────────────────────────────────────────────────── */
const SS = 4

class Tile {
  readonly buf: Float32Array // premultiplied r,g,b,a in 0-1
  readonly size: number
  constructor(size: number) {
    this.size = size
    this.buf = new Float32Array(size * size * 4)
  }

  /**
   * Composite one radial-gradient shape.
   *
   * `norm` maps a point to gradient position: 0 at the centre, 1 at the shape
   * edge, >1 outside (and clipped away, exactly as the SVG shape clipped it).
   *
   * `fadeAt` mirrors the SVG stop layout: alpha runs from the paint's own
   * alpha at 0 down to zero at `fadeAt`, and stays zero out to the edge. The
   * halos use it to hold their glow tighter than their radius.
   */
  private shape(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    p: Paint,
    fadeAt: number,
    norm: (x: number, y: number) => number,
  ) {
    const lo = (v: number) => Math.max(0, Math.floor(v))
    const hi = (v: number, m: number) => Math.min(m, Math.ceil(v))
    const R = p.r / 255
    const G = p.g / 255
    const B = p.b / 255
    for (let py = lo(y0); py < hi(y1, this.size); py++) {
      for (let px = lo(x0); px < hi(x1, this.size); px++) {
        let acc = 0
        for (let sy = 0; sy < SS; sy++) {
          for (let sx = 0; sx < SS; sx++) {
            const t = norm(px + (sx + 0.5) / SS, py + (sy + 0.5) / SS)
            if (t >= 1) continue
            acc += t < fadeAt ? p.a * (1 - t / fadeAt) : 0
          }
        }
        if (acc === 0) continue
        const a = acc / (SS * SS)
        const i = (py * this.size + px) * 4
        // source-over, premultiplied
        this.buf[i] = R * a + this.buf[i] * (1 - a)
        this.buf[i + 1] = G * a + this.buf[i + 1] * (1 - a)
        this.buf[i + 2] = B * a + this.buf[i + 2] * (1 - a)
        this.buf[i + 3] = a + this.buf[i + 3] * (1 - a)
      }
    }
  }

  /** A soft disc: `p`'s alpha at the centre, zero at radius `r`. */
  circle(cx: number, cy: number, r: number, p: Paint, fadeAt = 1) {
    this.shape(cx - r, cy - r, cx + r, cy + r, p, fadeAt, (x, y) =>
      Math.hypot((x - cx) / r, (y - cy) / r),
    )
  }

  /** The same, stretched — this is how a diffraction spike is drawn. */
  ellipse(cx: number, cy: number, rx: number, ry: number, p: Paint, fadeAt = 1) {
    this.shape(cx - rx, cy - ry, cx + rx, cy + ry, p, fadeAt, (x, y) =>
      Math.hypot((x - cx) / rx, (y - cy) / ry),
    )
  }

  /** Premultiplied floats → straight 8-bit RGBA, which is what PNG stores. */
  toRGBA(): Uint8Array {
    const out = new Uint8Array(this.size * this.size * 4)
    for (let i = 0; i < out.length; i += 4) {
      const a = this.buf[i + 3]
      if (a <= 0) continue
      out[i] = Math.round(Math.min(1, this.buf[i] / a) * 255)
      out[i + 1] = Math.round(Math.min(1, this.buf[i + 1] / a) * 255)
      out[i + 2] = Math.round(Math.min(1, this.buf[i + 2] / a) * 255)
      out[i + 3] = Math.round(a * 255)
    }
    return out
  }
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

const layers: { css: string; size: number; bytes: number }[] = []

function emit(tile: Tile) {
  const png = encodePNG(tile.size, tile.size, tile.toRGBA())
  layers.push({
    // Single quotes because that is what Prettier normalises a url() to when
    // its contents contain no apostrophe. The SVG payloads this replaced were
    // full of them, so they kept double quotes and the check passed either way.
    css: `url('data:image/png;base64,${png.toString('base64')}')`,
    size: tile.size,
    bytes: png.length,
  })
}

// ── hero: halo, hard core, and the diffraction spikes a bright star throws
//    through a lens. Rare on purpose. ──────────────────────────────────────
{
  const tile = new Tile(1500)
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
  const core = paint('--c-star-core')
  field(7, 3, 0.34).forEach(([px, py], i) => {
    const h = heroes[i]
    const x = px * tile.size
    const y = py * tile.size
    const sp = paint(h.spikeTok)
    tile.ellipse(x, y, h.spike, 1, sp)
    tile.ellipse(x, y, 1, h.spike, sp)
    tile.circle(x, y, h.halo, paint(h.haloTok), 0.7)
    tile.circle(x, y, h.core, core)
  })
  emit(tile)
}

// ── bright: halo then core. Sparse on purpose. ───────────────────────────
{
  const tile = new Tile(1100)
  const bright = [
    { halo: 9, haloTok: '--c-halo-blue', core: 1.6, coreTok: '--c-star-core' },
    { halo: 11, haloTok: '--c-halo-cyan', core: 1.5, coreTok: '--c-star-cyan' },
    { halo: 9, haloTok: '--c-halo-violet', core: 1.4, coreTok: '--c-star-violet' },
    { halo: 8, haloTok: '--c-halo-gold', core: 1.3, coreTok: '--c-star-gold' },
  ]
  field(11, 4, 0.3).forEach(([px, py], i) => {
    const b = bright[i]
    const x = px * tile.size
    const y = py * tile.size
    tile.circle(x, y, b.halo, paint(b.haloTok), 0.7)
    tile.circle(x, y, b.core, paint(b.coreTok))
  })
  emit(tile)
}

/** The plain tiers: one soft dot per star, coloured by token. */
function dotTier(
  size: number,
  seed: number,
  minDist: number,
  spec: { token: string; r: number; n: number }[],
) {
  const tile = new Tile(size)
  const pts = field(
    seed,
    spec.reduce((n, s) => n + s.n, 0),
    minDist,
  )
  let k = 0
  for (const s of spec) {
    const p = paint(s.token)
    for (let j = 0; j < s.n; j++, k++) {
      if (!pts[k]) break
      tile.circle(pts[k][0] * size, pts[k][1] * size, s.r, p)
    }
  }
  emit(tile)
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
   Rationale for baking the field into PNG tiles lives in the generator,
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

   These are PNG, not SVG, and that is a PERFORMANCE constraint on the tile
   sizes above: a vector tile is re-rasterized at the display's pixel ratio, so
   on Retina these five came to 76MB of raster for ~77 stars and blew the image
   cache, which is what made dark-mode scrolling stutter. A raster tile decodes
   once at its own size. If you grow a tile here, you are growing a bitmap
   quadratically — check the reported size when you regenerate.

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
const mp = layers.reduce((n, l) => n + l.size * l.size, 0) / 1e6
console.log(
  `wrote ${OUT} — ${layers.length} PNG tiles + ${GRID.length} grid, ${(out.length / 1024).toFixed(1)}kB css`,
)
for (const l of layers) {
  console.log(`  ${l.size}x${l.size}  ${(l.bytes / 1024).toFixed(1)}kB png`)
}
console.log(
  `  raster total: ${mp.toFixed(1)} megapixels (${(mp * 4).toFixed(0)}MB), scale-independent`,
)
