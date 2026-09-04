import { describe, expect, it } from 'vitest'
import { existsSync, globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

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
  const slugs = ['retrieval-service', 'eval-harness', 'parser-experiment']

  it.each(slugs)('%s built a page', (slug) => {
    expect(existsSync(join(DIST, 'projects', slug, 'index.html'))).toBe(true)
  })

  it('renders MDX body content, not just frontmatter', () => {
    expect(page('projects/retrieval-service/index.html')).toMatch(/The problem/)
  })

  it('gives headings ids so long writeups are deep-linkable', () => {
    expect(page('projects/retrieval-service/index.html')).toMatch(/<h2 id="the-problem"/)
  })

  it('links stack chips to /stack/:tech', () => {
    const html = page('projects/retrieval-service/index.html')
    expect(html).toMatch(/href="\/stack\/python"/)
    expect(html).toMatch(/href="\/stack\/postgres"/)
  })

  it('shows an updated date, carrying the recency signal', () => {
    expect(page('projects/retrieval-service/index.html')).toMatch(/Updated \w+ \d{4}/)
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
