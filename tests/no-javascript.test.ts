import { describe, expect, it } from 'vitest'
import { globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The zero-JavaScript guard.
 *
 * Every page on this site should ship no client-side JavaScript. This is the
 * single property most likely to erode silently: one `client:load` on a
 * component, or an integration that injects a runtime, and the site quietly
 * starts costing what a React SPA costs.
 *
 * If this test fails, something was accidentally made an island. That's a bug,
 * not a tradeoff — see docs/04-design-system.md, Performance budget.
 *
 * The one legitimate exception, arriving in Phase 1, is the inline theme
 * script that sets `data-theme` before first paint. When that lands, this
 * test should allow exactly one inline script and still reject every external
 * one.
 */

const DIST = join(import.meta.dirname, '..', 'dist')

function builtPages(): string[] {
  try {
    return globSync('**/*.html', { cwd: DIST }).sort()
  } catch {
    return []
  }
}

describe('built output ships no JavaScript', () => {
  const pages = builtPages()

  it('has a built site to check (run `npm run build` first)', () => {
    expect(pages.length).toBeGreaterThan(0)
  })

  it.each(pages)('%s contains no <script> tags', (page) => {
    const html = readFileSync(join(DIST, page), 'utf8')
    const scripts = html.match(/<script/g) ?? []
    expect(scripts).toHaveLength(0)
  })

  it.each(pages)('%s loads no external JS module', (page) => {
    const html = readFileSync(join(DIST, page), 'utf8')
    expect(html).not.toMatch(/<link[^>]+rel=["']modulepreload["']/)
  })
})
