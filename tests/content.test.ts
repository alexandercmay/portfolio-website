import { describe, expect, it } from 'vitest'
import { orderProjects, formatPeriod } from '@/lib/content'
import { TECH, TECH_KEYS, techByCategory } from '../content/taxonomy'
import { resume } from '../content/resume'

describe('taxonomy', () => {
  it('has no duplicate labels — duplicates would split /stack/:tech pages', () => {
    const labels = TECH_KEYS.map((k) => TECH[k].label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('groups every key into exactly one category', () => {
    const grouped = techByCategory().flatMap((g) => g.items)
    expect(grouped.sort()).toEqual([...TECH_KEYS].sort())
  })
})

describe('resume', () => {
  it('every skill references a real taxonomy key', () => {
    for (const group of resume.skills) {
      for (const item of group.items) {
        expect(TECH_KEYS).toContain(item)
      }
    }
  })

  it('every work entry has a headline — it is set at 3x body size', () => {
    for (const role of resume.work) {
      expect(role.headline.length).toBeGreaterThan(0)
    }
  })

  it('featured roles stay selective (at most 3)', () => {
    expect(resume.work.filter((w) => w.featured).length).toBeLessThanOrEqual(3)
  })

  it('no role ends before it starts', () => {
    for (const role of resume.work) {
      if (role.end)
        expect(role.end.getTime()).toBeGreaterThanOrEqual(role.start.getTime())
    }
  })
})

describe('project ordering', () => {
  // The store is empty under vitest, so the comparator is tested directly
  // rather than through getCollection. Real collection data is asserted
  // against the built output in build-output.test.ts.
  const p = (featured: boolean, weight: number, updated: string) =>
    ({ data: { featured, weight, updated: new Date(updated) } }) as never

  it('puts featured projects first', () => {
    expect(
      orderProjects(p(false, 99, '2026-01-01'), p(true, 0, '2020-01-01')),
    ).toBeGreaterThan(0)
  })

  it('breaks ties on weight, descending', () => {
    expect(
      orderProjects(p(true, 10, '2020-01-01'), p(true, 5, '2026-01-01')),
    ).toBeLessThan(0)
  })

  it('falls back to most recently updated', () => {
    expect(
      orderProjects(p(true, 5, '2026-08-01'), p(true, 5, '2024-01-01')),
    ).toBeLessThan(0)
  })
})

describe('formatters', () => {
  it('collapses a single-year period', () => {
    expect(formatPeriod(new Date('2024-02-01'), new Date('2024-11-01'))).toBe('2024')
  })

  it('shows Present for an ongoing period', () => {
    expect(formatPeriod(new Date('2024-02-01'))).toBe('2024 — Present')
  })
})
