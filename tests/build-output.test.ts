import { describe, expect, it } from 'vitest'
import { existsSync, globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { resume } from '../content/resume'

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
const page = (p: string) => readFileSync(join(DIST, p), 'utf8')

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

  it('preloads the display font — it is above the fold in the hero', () => {
    expect(page('index.html')).toMatch(/rel="preload"[^>]*fraunces[^>]*as="font"/)
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
  const css = (() => {
    const file = globSync('_astro/*.css', { cwd: DIST })[0]
    return readFileSync(join(DIST, file), 'utf8')
  })()

  it('declares .reveal visible in the base rule', () => {
    expect(css).toMatch(/\.reveal\{[^}]*opacity:1/)
  })

  it('never sets .reveal to opacity:0 outside the keyframes', () => {
    const baseRules = css.match(/\.reveal\{[^}]*\}/g) ?? []
    expect(baseRules.length).toBeGreaterThan(0)
    for (const rule of baseRules) {
      expect(rule).not.toMatch(/opacity:0(?![.\d])/)
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

describe('the metrics band', () => {
  it('renders when resume.metrics has real figures', () => {
    expect(resume.metrics?.length).toBeGreaterThan(0)
    expect(page('index.html')).toMatch(/class="[^"]*metrics/)
  })

  it('shows every metric value', () => {
    const esc = (s: string) =>
      s.replace(/&/g, '&#38;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    for (const m of resume.metrics ?? []) {
      expect(page('index.html')).toContain(esc(m.value))
    }
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
