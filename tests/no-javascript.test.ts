import { describe, expect, it } from 'vitest'
import { globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The zero-JavaScript guard.
 *
 * Every page should ship no client-side JavaScript beyond a single inline
 * theme script. This is the property most likely to erode silently: one
 * `client:load` on a component, or an integration that injects a runtime, and
 * the site quietly starts costing what a React SPA costs.
 *
 * If these fail, something was accidentally made an island. That's a bug, not
 * a tradeoff — see docs/04-design-system.md, Performance budget.
 *
 * The sanctioned exception is ThemeScript.astro: one inline, blocking script
 * that stamps a stored theme before first paint and delegates toggle clicks.
 * It is asserted EXACTLY — one inline script, zero external ones — rather than
 * loosened to "some scripts are fine", so a second script tag still fails.
 */

const DIST = join(import.meta.dirname, '..', 'dist')

function builtPages(): string[] {
  try {
    return globSync('**/*.html', { cwd: DIST }).sort()
  } catch {
    return []
  }
}

const pages = builtPages()

describe('built output ships no JavaScript', () => {
  it('has a built site to check (run `npm run build` first)', () => {
    expect(pages.length).toBeGreaterThan(0)
  })

  it.each(pages)('%s loads no external script', (page) => {
    const html = readFileSync(join(DIST, page), 'utf8')
    const external = html.match(/<script[^>]*\ssrc=/g) ?? []
    expect(external).toHaveLength(0)
  })

  it.each(pages)('%s loads no JS module preload', (page) => {
    const html = readFileSync(join(DIST, page), 'utf8')
    expect(html).not.toMatch(/<link[^>]+rel=["']modulepreload["']/)
  })

  it.each(pages)('%s has at most the one sanctioned inline script', (page) => {
    const html = readFileSync(join(DIST, page), 'utf8')
    // application/ld+json is structured data for crawlers, not executable
    // code — it costs the visitor nothing at runtime, so it does not count
    // against the budget. Every other script does.
    const executable =
      html.match(/<script(?![^>]*type=["']application\/ld\+json["'])/g) ?? []
    expect(executable.length).toBeLessThanOrEqual(1)
  })

  it.each(pages)('%s ships no framework runtime', (page) => {
    const html = readFileSync(join(DIST, page), 'utf8')
    // Astro's island runtime and hydration directives leave these markers.
    expect(html).not.toMatch(/astro-island/)
    expect(html).not.toMatch(/client:(load|idle|visible|only|media)/)
  })
})

describe('the theme script stays inline and blocking', () => {
  it('is present on the homepage', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8')
    expect(html).toMatch(/<script>/)
  })

  it('is not deferred or async — it must run before first paint', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8')
    // A deferred or async theme script paints first, which is the exact bug
    // it exists to prevent.
    expect(html).not.toMatch(/<script[^>]*\s(defer|async)/)
  })
})
