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

  it('marks them with the system, in order, one body each', () => {
    // The numerals used to carry this. They are celestial bodies now, but the
    // guard is the same one: a deleted or reordered section shows up here.
    const bodies = [
      ...page('index.html').matchAll(/<h2[^>]*>.*?data-body="(\w+)"/gs),
    ].map((m) => m[1])
    /*
     * Each marker says what its section IS. The first version ordered a
     * planetary system outward instead, and that failed because position is
     * not meaning: Skills got a gas giant for being third, not for being
     * Skills.
     */
    expect(bodies).toEqual(['star', 'ringed', 'constellation', 'observatory', 'dish'])
  })

  it('keeps the markers free of ids entirely', () => {
    /*
     * Five markers render on one page. An earlier pass drew their cutouts with
     * <mask>, whose ids had to be hand-namespaced per section — miss that and
     * every section silently draws the FIRST section's cutouts, which no code
     * review catches because the markup looks right.
     *
     * Even-odd fills need no ids at all, so this asserts the escape rather
     * than policing the namespacing.
     */
    const markers = [...page('index.html').matchAll(/<svg class="body"[\s\S]*?<\/svg>/g)]
    expect(markers.length).toBe(5)
    for (const m of markers) {
      expect(m[0]).not.toMatch(/\sid="/)
      expect(m[0]).not.toContain('<mask')
    }
  })

  it('still reaches contact — the section deleted by that edit', () => {
    expect(page('index.html')).toContain('mailto:')
  })
})

/**
 * The galaxy solves TWO charts — a landscape sky for wide viewports and a
 * portrait one for narrow — and only one is ever displayed. Both are in the
 * markup, so every structural guard below runs against both: a layout bug that
 * only reaches phones is still a layout bug.
 */
const CHARTS = [
  ...page('index.html').matchAll(
    /class="galaxy" data-chart="(\w+)"([\s\S]*?)(?=<div class="galaxy" data-chart=|<details)/g,
  ),
].map((m) => {
  const name = m[1]
  const body = m[2]
  const [W, H] = (body.match(/data-canvas="(\d+)x(\d+)"/) ?? []).slice(1).map(Number)
  const [CHAR, PAD, BOX_H] = (
    body.match(/data-star-box="([\d.]+),([\d.]+),([\d.]+)"/) ?? []
  )
    .slice(1)
    .map(Number)

  const clusters = [
    ...body.matchAll(
      /class="cluster"[^>]*style="--spec: var\((--c-spec-\d)\)"([\s\S]*?)(?=<div class="cluster"|$)/g,
    ),
  ]
    .map((c) => ({
      spec: c[1],
      name: c[2].match(/class="cname"[^>]*>([^<]+)</)?.[1] ?? '?',
      label: (() => {
        const l = c[2].match(
          /class="cluster-label"[^>]*style="left:([\d.]+)%;top:([\d.]+)%"/,
        )
        return l
          ? { x: (parseFloat(l[1]) / 100) * W, y: (parseFloat(l[2]) / 100) * H }
          : null
      })(),
      bright: [...c[2].matchAll(/data-bright/g)].length,
      figures: [...c[2].matchAll(/<svg class="figure"/g)].length,
      lines: [...(c[2].match(/./) ? [] : [])] as {
        x1: number
        y1: number
        x2: number
        y2: number
      }[],
      stars: [
        ...c[2].matchAll(
          /class="star" data-side="(left|right)"[^>]*style="left:([\d.]+)%;top:([\d.]+)%[^"]*"(.*?)<\/li>/gs,
        ),
      ].map((s) => ({
        // +1 = the name hangs off the right of the star, -1 = off the left.
        side: s[1] === 'right' ? 1 : -1,
        x: (parseFloat(s[2]) / 100) * W,
        y: (parseFloat(s[3]) / 100) * H,
        label: s[4].match(/class="name"[^>]*>([^<]+)</)?.[1] ?? '',
      })),
    }))
    .filter((c) => c.stars.length > 0)

  // The lines live in the <svg> ahead of the clusters, one <g> per cluster in
  // the same order.
  const lineGroups = [
    ...body.matchAll(/class="cluster-lines"[^>]*>([\s\S]*?)<\/g>/g),
  ].map((g) =>
    [
      ...g[1].matchAll(/x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/g),
    ].map((l) => ({
      x1: parseFloat(l[1]),
      y1: parseFloat(l[2]),
      x2: parseFloat(l[3]),
      y2: parseFloat(l[4]),
    })),
  )
  clusters.forEach((c, i) => (c.lines = lineGroups[i] ?? []))

  return { name, W, H, CHAR, PAD, BOX_H, clusters }
})

const centroid = (pts: { x: number; y: number }[]) => ({
  x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
  y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
})

describe('the skill galaxy', () => {
  const html = page('index.html')

  it('solves a landscape chart and a portrait one', () => {
    // Scaling one chart to both shapes does not work: the positions are
    // percentages and shrink, the labels are absolute pixels and do not.
    expect(CHARTS.map((c) => c.name)).toEqual(['landscape', 'portrait'])
    expect(CHARTS[0].W).toBeGreaterThan(CHARTS[0].H)
    expect(CHARTS[1].H).toBeGreaterThan(CHARTS[1].W)
  })

  it('shows exactly one chart at a time, and hides the other from AT too', () => {
    // display:none, not opacity or clipping — the hidden chart has to leave
    // the accessibility tree or every skill is announced twice.
    // The minifier drops the quotes around the attribute value.
    expect(css).toMatch(/\[data-chart=['"]?landscape['"]?\][^{]*\{display:none\}/)
    expect(css).toMatch(/\[data-chart=['"]?portrait['"]?\][^{]*\{display:none\}/)
  })

  it.each(CHARTS)('$name renders a star for every skill', (chart) => {
    const total = resume.skills.reduce((n, g) => n + g.items.length, 0)
    expect(chart.clusters.flatMap((c) => c.stars).length).toBe(total)
  })

  it.each(CHARTS)('$name places no two star labels on top of each other', (chart) => {
    // The component publishes its canvas size AND its box model, for the same
    // reason: a hardcoded copy here drifts out of sync with the layout. The
    // star is the anchor point and the name hangs off one side of it, so the
    // box is NOT centred on the star.
    expect(chart.W, 'galaxy did not publish its canvas size').toBeGreaterThan(0)
    expect(chart.CHAR, 'galaxy did not publish its star box model').toBeGreaterThan(0)

    const boxes = chart.clusters
      .flatMap((c) => c.stars)
      .map((s) => {
        const w = s.label.length * chart.CHAR + chart.PAD
        return {
          label: s.label,
          cx: s.x + (s.side * w) / 2,
          cy: s.y,
          w,
          h: chart.BOX_H,
        }
      })
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

  it.each(CHARTS)('$name keeps every star inside the canvas', (chart) => {
    for (const s of chart.clusters.flatMap((c) => c.stars)) {
      expect(s.x, s.label).toBeGreaterThan(0)
      expect(s.x, s.label).toBeLessThan(chart.W)
      expect(s.y, s.label).toBeGreaterThan(0)
      expect(s.y, s.label).toBeLessThan(chart.H)
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

  it('makes the chart itself the accessible path, not decoration', () => {
    // It used to be aria-hidden with a plain list beside it carrying the
    // content. The list is now collapsed, so the chart had to become the real
    // thing: a heading and a list per constellation. If this regresses, the
    // skills are gated behind a disclosure for screen reader users.
    expect(html).not.toMatch(/class="galaxy"[^>]*aria-hidden/)
    expect(html).toMatch(/<h3 class="cluster-label"/)
    expect(html).toMatch(/<ul class="cluster-stars" role="list"/)
    expect(html).toMatch(/<li class="star"/)
  })

  it('offers the plain list as a collapsed catalog, not as the only path', () => {
    const details = html.match(/<details class="catalog"[^>]*>/)
    expect(details, 'no star catalog').toBeTruthy()
    // Collapsed by default: no `open` attribute.
    expect(details![0]).not.toContain('open')
    expect(html).toMatch(/<summary[\s\S]{0,200}Star catalog/)
    // And it really does list every skill.
    for (const group of resume.skills) {
      expect(html).toContain(group.category.replace(/&/g, '&amp;'))
    }
  })
})

describe('constellation identity', () => {
  const html = page('index.html')

  it.each(CHARTS)('$name gives every cluster a distinct spectral hue', (chart) => {
    const specs = chart.clusters.map((c) => c.spec)
    expect(specs.length).toBe(resume.skills.length)
    expect(new Set(specs).size).toBe(specs.length)
  })

  it('names each cluster, and nothing else', () => {
    for (const group of resume.skills) {
      expect(html).toContain(group.category.replace(/&/g, '&amp;'))
    }
    /*
     * Constellation names used to carry a fake NGC catalog designation and a
     * star count under them. Both are gone.
     *
     * NGC is a real catalogue of ~7,840 objects and every number generated
     * here landed inside its range, so each label pointed at an actual galaxy
     * that has nothing to do with these skills — invented precision on a page
     * that is otherwise careful not to overstate anything. The count went with
     * it: a bare numeral under a name reads as a badge, and the stars it
     * counts are right there to be counted.
     */
    expect(html).not.toMatch(/NGC \d+/)
    expect(html).not.toMatch(/class="desig"/)
  })

  it.each(CHARTS)('$name draws a figure behind every constellation', (chart) => {
    /*
     * The figure layer: the thing the constellation is named for, engraved
     * faintly behind its stars the way a star atlas does it.
     *
     * It is laid OVER the sky, never derived from it — no star position or
     * count depends on it — so this only has to assert that every
     * constellation has one and that it stays decoration.
     */
    expect(chart.clusters.map((c) => c.figures)).toEqual(chart.clusters.map(() => 1))
  })

  it('keeps the figures decorative and mute', () => {
    // A figure that carried text would be announced along with the skills, and
    // both charts are in the markup — so it would be announced twice.
    const figures = [...html.matchAll(/<svg class="figure"([\s\S]*?)<\/svg>/g)]
    expect(figures.length).toBe(resume.skills.length * 2)
    for (const f of figures) {
      expect(f[1]).toContain('aria-hidden="true"')
      expect(f[1]).not.toMatch(/<(text|title|desc)\b/)
    }
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

describe('constellation shape', () => {
  /**
   * These assertions exist because the metrics they replace could not see the
   * actual bug.
   *
   * A previous layout scored a healthy "minimum distance between stars of
   * different clusters" while constellations were threaded straight through
   * each other and labels floated over foreign stars. Distance-between-nearest
   * -pair is blind to interleaving. Only a screenshot caught it.
   *
   * So: no foreign star may sit inside a cluster's bounding box, and every
   * label must be nearer its own stars than anyone else's.
   */
  it.each(CHARTS)('$name parses one group of stars per skill category', (chart) => {
    expect(chart.clusters.length).toBe(resume.skills.length)
  })

  it.each(CHARTS)('$name never lets constellations interleave', (chart) => {
    // The failure a nearest-pair distance metric cannot detect.
    const intruders: string[] = []
    for (const c of chart.clusters) {
      const x0 = Math.min(...c.stars.map((s) => s.x))
      const x1 = Math.max(...c.stars.map((s) => s.x))
      const y0 = Math.min(...c.stars.map((s) => s.y))
      const y1 = Math.max(...c.stars.map((s) => s.y))
      for (const other of chart.clusters) {
        if (other === c) continue
        for (const s of other.stars) {
          if (s.x >= x0 && s.x <= x1 && s.y >= y0 && s.y <= y1) {
            intruders.push(`${other.name} star inside ${c.name}`)
          }
        }
      }
    }
    expect(intruders).toEqual([])
  })

  it.each(CHARTS)(
    '$name keeps every label nearer its own stars than any other cluster',
    (chart) => {
      /*
       * Measured against each cluster's NEAREST star, not its centroid.
       *
       * Centroid distance was the original form and it is a bad proxy once a
       * cluster is elongated: on the portrait chart the constellations are
       * squeezed into tall vertical bands, so a label sitting right on top of
       * its own stars can still be further from their centroid than from a
       * neighbour's. Nearest-star is the property the eye actually uses to
       * decide which constellation a name belongs to.
       */
      const nearest = (from: { x: number; y: number }, pts: { x: number; y: number }[]) =>
        Math.min(...pts.map((p) => Math.hypot(from.x - p.x, from.y - p.y)))

      for (const c of chart.clusters) {
        expect(c.label, `${c.name} has no label`).not.toBeNull()
        const dOwn = nearest(c.label!, c.stars)
        for (const other of chart.clusters) {
          if (other === c) continue
          const dOther = nearest(c.label!, other.stars)
          expect(dOther, `${c.name} label is nearer ${other.name}`).toBeGreaterThan(dOwn)
        }
      }
    },
  )

  it('keeps constellations loose, not knotted, and not sprawling', () => {
    // Landscape only: the portrait chart deliberately squeezes clusters into
    // narrow vertical bands, so a radius band tuned for open sky does not
    // describe it.
    const chart = CHARTS[0]
    for (const c of chart.clusters) {
      if (c.stars.length < 3) continue
      const m = centroid(c.stars)
      const r =
        c.stars.reduce((s, p) => s + Math.hypot(p.x - m.x, p.y - m.y), 0) / c.stars.length
      expect(r, `${c.name} mean radius`).toBeGreaterThan(60)
      expect(r, `${c.name} mean radius`).toBeLessThan(140)
    }
  })

  /**
   * Constellation lines are the cluster's minimum spanning tree. The version
   * before this drew spokes from a hub, which reads as an asterisk rather than
   * as a constellation — every star pointed at the same middle.
   *
   * An MST over n stars has exactly n-1 edges, and every endpoint is one of
   * that cluster's own stars. A hub layout fails the second check, because the
   * hub is a centroid and not a star at all.
   */
  it.each(CHARTS)(
    '$name draws each constellation as a spanning tree, not a hub and spokes',
    (chart) => {
      for (const c of chart.clusters) {
        expect(c.lines.length, `${c.name} edge count`).toBe(c.stars.length - 1)

        const onAStar = (x: number, y: number) =>
          c.stars.some((s) => Math.abs(s.x - x) < 0.5 && Math.abs(s.y - y) < 0.5)
        for (const l of c.lines) {
          expect(onAStar(l.x1, l.y1), `${c.name} edge starts off-star`).toBe(true)
          expect(onAStar(l.x2, l.y2), `${c.name} edge ends off-star`).toBe(true)
        }
      }
    },
  )

  it.each(CHARTS)('$name flares exactly one star per constellation', (chart) => {
    // Diffraction spikes say "this is the bright one". On more than one star
    // per cluster they stop saying anything.
    expect(chart.clusters.map((c) => c.bright)).toEqual(chart.clusters.map(() => 1))
  })
})
