import { describe, expect, it } from 'vitest'
import { existsSync, globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { resume } from '../content/resume'
import { TECH } from '../content/taxonomy'

/**
 * Assertions against what actually ships.
 *
 * Astro's content store does not hydrate outside a build, so `getCollection`
 * is empty under vitest. Rather than mock it, collection behaviour is verified
 * against `dist/` — which has the advantage of testing the real output rather
 * than an in-memory abstraction.
 *
 * Requires `npm run build` first; CI orders it that way.
 */

const DIST = join(import.meta.dirname, '..', 'dist')

/** Every built stylesheet, concatenated — the build emits more than one. */
function allCss(): string {
  return globSync('_astro/*.css', { cwd: DIST })
    .map((f) => readFileSync(join(DIST, f), 'utf8'))
    .join('\n')
}
const page = (p: string) => readFileSync(join(DIST, p), 'utf8')

/** Every built stylesheet, concatenated. */
const css = allCss()

describe('projects render from the collection', () => {
  const slugs = ['chalk-talk', 'networked-game-engine']

  it.each(slugs)('%s built a page', (slug) => {
    expect(existsSync(join(DIST, 'projects', slug, 'index.html'))).toBe(true)
  })

  it.each(slugs)('%s renders MDX body content, not just frontmatter', (slug) => {
    expect(page(`projects/${slug}/index.html`)).toMatch(/What was hard/)
  })

  it('gives headings ids so long writeups are deep-linkable', () => {
    expect(page('projects/chalk-talk/index.html')).toMatch(/<h2 id="the-problem"/)
  })

  it.each(slugs)('%s shows an updated date, carrying the recency signal', (slug) => {
    expect(page(`projects/${slug}/index.html`)).toMatch(/Updated \w+ \d{4}/)
  })

  it('has no /stack/ links — that route was cut in Phase 3 (D-014)', () => {
    for (const p of globSync('**/*.html', { cwd: DIST })) {
      expect(readFileSync(join(DIST, p), 'utf8')).not.toMatch(/href="\/stack\//)
    }
  })
})

describe('metadata', () => {
  it('every page has a canonical url', () => {
    for (const p of ['index.html', 'resume/index.html', 'about/index.html']) {
      expect(page(p)).toMatch(/<link rel="canonical" href="https:\/\//)
    }
  })

  it('canonical urls carry no trailing slash', () => {
    // Must match html_handling: "drop-trailing-slash" in wrangler.jsonc, or
    // every internal link 307s and canonicals point at redirect targets.
    expect(page('resume/index.html')).toMatch(/canonical" href="[^"]*\/resume"/)
  })

  it('preloads the mono face — it is above the fold in the hero', () => {
    expect(page('index.html')).toMatch(/rel="preload"[^>]*jetbrains-mono[^>]*as="font"/)
  })

  it('preloads a font that actually exists in the build', () => {
    // A stale preload after a font swap silently fetches a file nothing uses,
    // or 404s. Check the referenced file is really there.
    const href = page('index.html').match(/rel="preload"[^>]*href="([^"]+)"/)?.[1]
    expect(href).toBeTruthy()
    expect(existsSync(join(DIST, href!.replace(/^\//, '')))).toBe(true)
  })
})

describe('the scroll-reveal utility is opt-in, not opt-out', () => {
  /**
   * The single most dangerous rule in the stylesheet.
   *
   * If `.reveal` is ever authored to hide content by default and reveal it via
   * the animation, the site goes BLANK in every browser without
   * `animation-timeline` support and for every visitor with reduced motion
   * enabled. On a site whose entire purpose is being read, that is a silent,
   * total failure — and it would pass a casual local check in Chrome.
   *
   * So: assert the base rule is visible, and that opacity:0 only ever appears
   * inside the guarded keyframes.
   */
  // Every built stylesheet, concatenated. Reading only the first one silently
  // missed tokens as soon as the build emitted more than one file.
  const css = allCss()

  /**
   * Every motion utility that can be applied to CONTENT must be visible by
   * default. `.reveal` was the original; `.reveal-x`, `.settle` and `.charge`
   * were added with the glow pass and apply to metric readouts, section
   * headers and metadata columns — all real content.
   *
   * `.scroll-progress` is deliberately NOT in this list: it is decorative
   * chrome, and a progress bar that renders full-width without a scroll
   * timeline would be actively misleading. Hidden-by-default is correct there
   * and only there.
   */
  const MOTION_UTILITIES = ['reveal', 'reveal-x', 'settle', 'charge']

  it.each(MOTION_UTILITIES)('.%s targets are visible in a base rule', (name) => {
    const rules = css.match(new RegExp(`[^{}]*\\.${name}[^{}]*\\{[^}]*\\}`, 'g')) ?? []
    expect(rules.length, `no rule found for .${name}`).toBeGreaterThan(0)
    expect(rules.some((r) => /opacity:1/.test(r))).toBe(true)
  })

  it.each(MOTION_UTILITIES)('.%s is never set to opacity:0 outside keyframes', (name) => {
    const rules = css.match(new RegExp(`[^{}]*\\.${name}[^{}]*\\{[^}]*\\}`, 'g')) ?? []
    for (const rule of rules) {
      expect(rule, rule).not.toMatch(/opacity:0(?![.\d])/)
    }
  })

  it('.draw-x is never collapsed to scaleX(0) in a base rule', () => {
    // Transform-only, so the opacity guard above does not cover it — but a
    // base scaleX(0) would hide every section rule in any browser without
    // animation-timeline, which is the same class of bug.
    const rules = css.match(/[^{}]*\.draw-x[^{}]*\{[^}]*\}/g) ?? []
    expect(rules.length).toBeGreaterThan(0)
    for (const rule of rules) {
      expect(rule, rule).not.toMatch(/scalex\(0\)/i)
    }
  })

  it('guards the animation behind @supports and prefers-reduced-motion', () => {
    expect(css).toMatch(/@supports\s*\(animation-timeline/)
    expect(css).toMatch(/prefers-reduced-motion:no-preference/)
  })

  it('keeps a global reduced-motion override', () => {
    expect(css).toMatch(/prefers-reduced-motion:reduce/)
  })
})

describe('internal links all resolve', () => {
  /**
   * Catches the class of bug where a page links somewhere that was never
   * generated. This actually happened in Phase 2: SkillsComposition linked
   * every skill to /stack/:tech, but stack pages are only generated for
   * technologies with real usage — so seven resume skills pointed at 404s.
   *
   * A dead link on a portfolio is the kind of thing a reviewer clicks first.
   */
  const pages = globSync('**/*.html', { cwd: DIST })

  function routeExists(href: string): boolean {
    const clean = href.split('#')[0].split('?')[0].replace(/^\//, '')
    if (clean === '') return true
    return (
      existsSync(join(DIST, clean, 'index.html')) ||
      existsSync(join(DIST, `${clean}.html`)) ||
      existsSync(join(DIST, clean))
    )
  }

  /**
   * Known-missing targets, each with the phase that produces it. An entry here
   * is a recorded gap, not a hidden one — remove it when the file lands.
   */
  const NOT_YET_BUILT = new Set([
    '/alexander-may-resume.pdf', // generated in Phase 4 (scripts/build-resume-pdf.ts)
  ])

  const broken: string[] = []
  for (const p of pages) {
    const html = readFileSync(join(DIST, p), 'utf8')
    const hrefs = [...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1])
    for (const href of new Set(hrefs)) {
      if (NOT_YET_BUILT.has(href)) continue
      if (!routeExists(href)) broken.push(`${p} -> ${href}`)
    }
  }

  it('has no links to routes that were never generated', () => {
    expect(broken).toEqual([])
  })
})

describe('the resume page', () => {
  it('emits valid schema.org/Person JSON-LD', () => {
    const html = page('resume/index.html')
    const match = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)
    expect(match).not.toBeNull()
    const data = JSON.parse(match![1])
    expect(data['@type']).toBe('Person')
    expect(data.name).toBeTruthy()
  })

  it('shows every work entry', () => {
    for (const role of resume.work) {
      expect(page('resume/index.html')).toContain(role.org)
    }
  })

  it('offers the PDF download', () => {
    expect(page('resume/index.html')).toMatch(/href="\/alexander-may-resume\.pdf"/)
  })
})

describe('the education section', () => {
  it('lists relevant coursework', () => {
    const html = page('index.html')
    expect(html).toMatch(/Relevant coursework/)
    for (const c of resume.education[0].coursework ?? []) {
      expect(html).toContain(c.replace(/&/g, '&amp;'))
    }
  })

  it('offers the full timeline at the end of Experience', () => {
    expect(page('index.html')).toMatch(/View the full detailed timeline/)
  })

  it('no longer renders a context-free metrics band', () => {
    // The figures (1M+, <7s, 50+) read as out of place with no surrounding
    // explanation, so the band and its data were removed outright.
    expect(page('index.html')).not.toMatch(/class="[^"]*\bmetric\b/)
  })
})

describe('nothing private leaks into the build', () => {
  /**
   * The repo is public and built pages get scraped. The phone number on the
   * LaTeX resume must never reach the site, and neither should a street
   * address. Location stays city-level.
   */
  const pages = globSync('**/*.html', { cwd: DIST })

  it.each(pages)('%s contains no phone number', (p) => {
    const html = readFileSync(join(DIST, p), 'utf8')
    expect(html).not.toMatch(/\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/)
  })

  it.each(pages)('%s contains no tel: link', (p) => {
    const html = readFileSync(join(DIST, p), 'utf8')
    expect(html).not.toMatch(/href="tel:/)
  })
})

describe('landmark structure', () => {
  /**
   * Two banner landmarks on one page makes landmark navigation ambiguous for
   * screen reader users. Chrome maps <header> to banner even inside <article>
   * — contrary to what the HTML spec implies — so page-level heading blocks
   * use <div>, and only the site header is a <header>.
   *
   * Unnamed <section> elements are also landmark noise, so every section
   * carries an accessible name.
   */
  const pages = globSync('**/*.html', { cwd: DIST })

  it.each(pages)('%s has exactly one <header>', (p) => {
    const html = readFileSync(join(DIST, p), 'utf8')
    expect((html.match(/<header/g) ?? []).length).toBe(1)
  })

  it.each(pages)('%s names every section', (p) => {
    const html = readFileSync(join(DIST, p), 'utf8')
    expect(html.match(/<section(?![^>]*aria-label)/g) ?? []).toHaveLength(0)
  })

  it.each(pages)('%s has exactly one <h1>', (p) => {
    const html = readFileSync(join(DIST, p), 'utf8')
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1)
  })

  it.each(pages)('%s starts with a skip link', (p) => {
    const html = readFileSync(join(DIST, p), 'utf8')
    expect(html).toMatch(/class="skip-link"[^>]*href="#main"/)
  })

  it.each(pages)('%s has a main landmark', (p) => {
    const html = readFileSync(join(DIST, p), 'utf8')
    expect(html).toMatch(/<main[\s>]/)
  })
})

describe('the build ships no unreferenced assets', () => {
  /**
   * @astrojs/react emitted a ~187KB client runtime into dist/ even with zero
   * islands — half the deploy, downloaded by nobody, and a latent foot-gun the
   * first time someone adds a client: directive. The integration was removed
   * in Phase 3 and comes back in Phase 5 with the first real island.
   *
   * This catches any future dead asset the same way.
   */
  it('has no JavaScript file that no page references', () => {
    const js = globSync('**/*.js', { cwd: DIST })
    const html = globSync('**/*.html', { cwd: DIST }).map((p) =>
      readFileSync(join(DIST, p), 'utf8'),
    )
    const orphans = js.filter((f) => {
      const name = f.split('/').pop()!
      return !html.some((h) => h.includes(name))
    })
    expect(orphans).toEqual([])
  })
})

describe('the background grid is decorative, not costly', () => {
  /**
   * The AA verification for the palette was done against the flat page
   * background. Text also sits ON grid lines, which are lighter in dark mode
   * and darker in light mode — a ground the flat check never looked at.
   *
   * The grid is decoration and must not cost a single contrast pair.
   */
  function ratio(fg: string, bg: string): number {
    const lin = (c: number) => {
      c /= 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    }
    const lum = (h: string) => {
      let v = h.replace('#', '')
      // Lightning CSS minifies #ffffff to #fff. This block's tokens happen to
      // be 6-digit, but the same parser elsewhere silently produced NaN.
      if (v.length === 3) v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2]
      return (
        0.2126 * lin(parseInt(v.slice(0, 2), 16)) +
        0.7152 * lin(parseInt(v.slice(2, 4), 16)) +
        0.0722 * lin(parseInt(v.slice(4, 6), 16))
      )
    }
    const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x)
    return (a + 0.05) / (b + 0.05)
  }

  /** Read a raw token value out of the built CSS, scoped to a theme block. */
  function token(name: string, scope: RegExp): string {
    const block = allCss().match(scope)?.[0] ?? ''
    return block.match(new RegExp(`${name}:\\s*(#[0-9a-f]{3,6})`, 'i'))?.[1] ?? ''
  }

  const darkBlock = /:root\{[^}]*--c-bg:#060910[^}]*\}/i
  const lightBlock = /\[data-theme=light\]\{[^}]*\}/i

  it('dark: body text clears AA over a grid line', () => {
    const grid = token('--c-grid', darkBlock)
    const text = token('--c-text', darkBlock)
    expect(grid).toBeTruthy()
    expect(ratio(text, grid)).toBeGreaterThanOrEqual(4.5)
  })

  it('dark: the smallest text still clears AA over a grid line', () => {
    const grid = token('--c-grid', darkBlock)
    const subtle = token('--c-text-subtle', darkBlock)
    expect(ratio(subtle, grid)).toBeGreaterThanOrEqual(4.5)
  })

  it('light: the smallest text still clears AA over a grid line', () => {
    const grid = token('--c-grid', lightBlock)
    const subtle = token('--c-text-subtle', lightBlock)
    expect(grid).toBeTruthy()
    expect(ratio(subtle, grid)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('the landing page has every expected section', () => {
  /**
   * A structural edit silently deleted the entire Contact section — the build
   * passed, types passed, and 125 tests passed, because nothing asserted the
   * page's shape. Only a manual DOM check caught it.
   *
   * This asserts the sections exist, in order, with consecutive indexes.
   */
  const EXPECTED = ['Experience', 'Projects', 'Skills', 'Education', 'Get in touch']

  const headings = [...page('index.html').matchAll(/<h2[^>]*>(.*?)<\/h2>/gs)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').trim(),
  )

  it.each(EXPECTED)('has a "%s" section', (name) => {
    expect(headings.some((h) => h.endsWith(name))).toBe(true)
  })

  it('orders them as written', () => {
    expect(headings.map((h) => h.replace(/^\d+/, ''))).toEqual(EXPECTED)
  })

  it('numbers them consecutively from 01', () => {
    const indexes = headings.map((h) => h.match(/^(\d+)/)?.[1])
    expect(indexes).toEqual(['01', '02', '03', '04', '05'])
  })

  it('still reaches contact — the section deleted by that edit', () => {
    expect(page('index.html')).toContain('mailto:')
  })
})

describe('the skill galaxy', () => {
  /**
   * Positions are solved at build time, so a change to the placement
   * algorithm can silently reintroduce overlapping labels — the first version
   * shipped eleven overlapping pairs. This recomputes the boxes from the
   * rendered inline styles and asserts none collide.
   */
  const html = page('index.html')

  const stars = [
    ...html.matchAll(
      /class="star"[^>]*style="left:([\d.]+)%;top:([\d.]+)%"(.*?)<\/span><\/span>/gs,
    ),
  ].map((m) => ({
    x: parseFloat(m[1]),
    y: parseFloat(m[2]),
    label: m[3].match(/class="name"[^>]*>([^<]+)</)?.[1] ?? '',
  }))

  it('renders a star for every skill', () => {
    const total = resume.skills.reduce((n, g) => n + g.items.length, 0)
    expect(stars.length).toBe(total)
  })

  it('places no two star labels on top of each other', () => {
    // The component publishes its own canvas size, so this cannot drift out of
    // sync with the layout constants the way a hardcoded copy did.
    const [W, H] = (html.match(/data-canvas="(\d+)x(\d+)"/) ?? []).slice(1).map(Number)
    expect(W, 'galaxy did not publish its canvas size').toBeGreaterThan(0)
    const CHAR = 8.4
    const boxes = stars.map((s) => ({
      label: s.label,
      cx: (s.x / 100) * W,
      cy: (s.y / 100) * H,
      w: s.label.length * CHAR + 30,
      h: 28,
    }))
    const collisions: string[] = []
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]
        const b = boxes[j]
        if (
          Math.abs(a.cx - b.cx) < (a.w + b.w) / 2 &&
          Math.abs(a.cy - b.cy) < (a.h + b.h) / 2
        ) {
          collisions.push(`${a.label} / ${b.label}`)
        }
      }
    }
    expect(collisions).toEqual([])
  })

  it('keeps every star inside the canvas', () => {
    for (const s of stars) {
      expect(s.x, s.label).toBeGreaterThan(0)
      expect(s.x, s.label).toBeLessThan(100)
      expect(s.y, s.label).toBeGreaterThan(0)
      expect(s.y, s.label).toBeLessThan(100)
    }
  })

  it('never hides a skill name behind hover', () => {
    // Hover is emphasis only. Every name must be in the markup as text, or
    // keyboard and touch users lose the content outright.
    for (const group of resume.skills) {
      for (const key of group.items) {
        expect(html).toContain(TECH[key].label)
      }
    }
  })

  it('provides a plain grouped list as the screen-reader and mobile path', () => {
    expect(html).toMatch(/class="galaxy-list/)
    // The scatter is decorative duplication, so it is hidden from AT.
    expect(html).toMatch(/class="galaxy"[^>]*aria-hidden="true"/)
  })
})

describe('constellation identity', () => {
  const html = page('index.html')

  it('gives every cluster a distinct spectral hue', () => {
    const specs = [
      ...html.matchAll(/class="cluster"[^>]*style="--spec: var\((--c-spec-\d)\)"/g),
    ].map((m) => m[1])
    expect(specs.length).toBe(resume.skills.length)
    expect(new Set(specs).size).toBe(specs.length)
  })

  it('labels each cluster with a catalog designation and a count', () => {
    for (const group of resume.skills) {
      expect(html).toContain(group.category.replace(/&/g, '&amp;'))
    }
    expect(html).toMatch(/class="desig"[^>]*>NGC \d+</)
    expect(html).toMatch(/class="count"/)
  })

  it('lights a whole constellation when its label is hovered', () => {
    // The interaction is pure CSS; assert the rules survived the build.
    expect(css).toMatch(/\.cluster[^{]*:has\(\.cluster-label:hover\)[^{]*\.dot[^{]*\{/)
    expect(css).toMatch(/\.cluster[^{]*:has\(\.cluster-label:hover\)[^{]*\.name[^{]*\{/)
  })

  it('recedes the other constellations while one is hovered', () => {
    expect(css).toMatch(
      /:has\(\.cluster-label:hover\) \.cluster[^{]*:not\(:has\(\.cluster-label:hover\)\)/,
    )
  })

  it('keeps the spectral palette separate from the semantic accents', () => {
    // cyan / lime / violet / amber each mean one thing (interactive, live,
    // secondary, degraded). Spending them on skill categories would make them
    // mean nothing, so clusters get their own hues.
    const specBlock = css.match(/--c-spec-1:\s*(#[0-9a-f]{3,6})/i)?.[1]
    expect(specBlock).toBeTruthy()
    const accents = ['--c-cyan', '--c-lime', '--c-violet', '--c-amber']
      .map((n) => css.match(new RegExp(`${n}:\\s*(#[0-9a-f]{3,6})`, 'i'))?.[1])
      .filter(Boolean)
    expect(accents).not.toContain(specBlock)
  })
})

describe('spectral hues meet AA in both themes', () => {
  function ratio(fg: string, bg: string): number {
    const lin = (c: number) => {
      c /= 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    }
    const lum = (h: string) => {
      let v = h.replace('#', '')
      // Lightning CSS minifies #ffffff to #fff; expand before parsing or the
      // slices produce NaN and every ratio silently becomes garbage.
      if (v.length === 3) v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2]
      return (
        0.2126 * lin(parseInt(v.slice(0, 2), 16)) +
        0.7152 * lin(parseInt(v.slice(2, 4), 16)) +
        0.0722 * lin(parseInt(v.slice(4, 6), 16))
      )
    }
    const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x)
    return (a + 0.05) / (b + 0.05)
  }

  function block(scope: RegExp): Record<string, string> {
    const b = css.match(scope)?.[0] ?? ''
    const out: Record<string, string> = {}
    for (const m of b.matchAll(/(--c-[\w-]+):\s*(#[0-9a-f]{3,6})/gi)) out[m[1]] = m[2]
    return out
  }

  const themes: [string, RegExp][] = [
    ['dark', /:root\{[^}]*--c-bg:#060910[^}]*\}/i],
    ['light', /\[data-theme=light\]\{[^}]*\}/i],
  ]

  it.each(themes)(
    '%s: every spectral hue clears 4.5:1 on every ground',
    (_name, scope) => {
      const vars = block(scope)
      const grounds = ['--c-bg', '--c-surface', '--c-raised']
        .map((g) => vars[g])
        .filter(Boolean)
      expect(grounds.length).toBe(3)
      for (let i = 1; i <= 5; i++) {
        const hue = vars[`--c-spec-${i}`]
        expect(hue, `--c-spec-${i} missing`).toBeTruthy()
        for (const g of grounds) {
          expect(ratio(hue, g), `--c-spec-${i} on ${g}`).toBeGreaterThanOrEqual(4.5)
        }
      }
    },
  )
})

describe('constellation shape', () => {
  /**
   * Tuned twice, in opposite directions, and the thresholds here encode the
   * SECOND intent — so read them as the current target, not as history.
   *
   *   first pass:  radius 46-57px, gap 208px  — five cramped knots, marooned
   *   now:         radius 78-108px, gap 57px  — loose clusters sitting close
   *
   * Those two measures move against each other: in a fixed canvas, looser
   * clusters necessarily sit nearer their neighbours. Clusters are therefore
   * ADJACENT by design, and it is the spectral colour and the label that make
   * them distinct — not distance.
   *
   * So the meaningful guard is no longer "keep clusters far apart". It is:
   * clusters must not sprawl across the whole canvas, and no two labels may
   * collide (asserted separately, in the overlap test).
   */
  const html = page('index.html')
  const [W, H] = (html.match(/data-canvas="(\d+)x(\d+)"/) ?? []).slice(1).map(Number)

  const clusters = [
    ...html.matchAll(
      /class="cluster"[^>]*>([\s\S]*?)(?=<div class="cluster"|<div class="galaxy-list)/g,
    ),
  ]
    .map((m) =>
      [...m[1].matchAll(/class="star"[^>]*style="left:([\d.]+)%;top:([\d.]+)%"/g)].map(
        (s) => ({
          x: (parseFloat(s[1]) / 100) * W,
          y: (parseFloat(s[2]) / 100) * H,
        }),
      ),
    )
    .filter((c) => c.length > 0)

  it('parses one group of stars per skill category', () => {
    expect(clusters.length).toBe(resume.skills.length)
  })

  it('keeps each constellation from sprawling across the canvas', () => {
    for (const [i, stars] of clusters.entries()) {
      if (stars.length < 2) continue
      const cx = stars.reduce((s, p) => s + p.x, 0) / stars.length
      const cy = stars.reduce((s, p) => s + p.y, 0) / stars.length
      const r =
        stars.reduce((s, p) => s + Math.hypot(p.x - cx, p.y - cy), 0) / stars.length
      expect(r, `cluster ${i + 1} mean radius`).toBeLessThan(135)
    }
  })

  it('keeps constellations loose enough not to read as knots', () => {
    // The failure this catches is over-tightening, which is what the first
    // tuning pass actually shipped.
    const radii = clusters
      .filter((s) => s.length > 2)
      .map((stars) => {
        const cx = stars.reduce((s, p) => s + p.x, 0) / stars.length
        const cy = stars.reduce((s, p) => s + p.y, 0) / stars.length
        return (
          stars.reduce((s, p) => s + Math.hypot(p.x - cx, p.y - cy), 0) / stars.length
        )
      })
    for (const r of radii) expect(r).toBeGreaterThan(55)
  })

  it('does not let stars of different clusters land on the same point', () => {
    // A low floor only. Clusters are adjacent by design; label collisions are
    // the real constraint and are asserted in the overlap test.
    let closest = Infinity
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        for (const a of clusters[i]) {
          for (const b of clusters[j]) {
            closest = Math.min(closest, Math.hypot(a.x - b.x, a.y - b.y))
          }
        }
      }
    }
    expect(closest).toBeGreaterThan(30)
  })
})
