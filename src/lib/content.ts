import { getCollection, type CollectionEntry } from 'astro:content'

export type Project = CollectionEntry<'projects'>

/** Drafts are visible in `astro dev` and excluded from production builds. */
function published(p: Project): boolean {
  return import.meta.env.DEV || !p.data.draft
}

/**
 * featured → weight (desc) → most recently updated.
 *
 * Exported so it can be unit-tested directly: Astro's content store does not
 * hydrate outside a build, so `getCollection` is empty under vitest. Pure
 * ordering logic is tested here; the collection data itself is asserted
 * against the built output in tests/build-output.test.ts.
 */
export function orderProjects(a: Project, b: Project): number {
  if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1
  if (a.data.weight !== b.data.weight) return b.data.weight - a.data.weight
  return b.data.updated.getTime() - a.data.updated.getTime()
}

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects')
  return all.filter(published).sort(orderProjects)
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const all = await getProjects()
  return all.filter((p) => p.data.featured).slice(0, limit)
}

/** Shared stack or tags, most overlap first. */
export async function getRelated(project: Project, limit = 3): Promise<Project[]> {
  const all = await getProjects()
  const stack = new Set<string>(project.data.stack)
  const tags = new Set(project.data.tags)

  return all
    .filter((p) => p.id !== project.id)
    .map((p) => ({
      project: p,
      score:
        p.data.stack.filter((s: string) => stack.has(s)).length +
        p.data.tags.filter((t) => tags.has(t)).length * 2,
    }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((c) => c.project)
}

/** "March 2026" — used for `updated` on cards and project headers. */
export function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/** "2024 — Present" for a project or role period. */
export function formatPeriod(start: Date, end?: Date): string {
  const from = start.getFullYear()
  const to = end ? end.getFullYear() : 'Present'
  return from === to ? `${from}` : `${from} — ${to}`
}
