import { getCollection, type CollectionEntry } from 'astro:content'
import { TECH, type TechKey } from '../../content/taxonomy'
import { resume } from '../../content/resume'

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

export interface StackUsage {
  key: TechKey
  label: string
  category: string
  projects: Project[]
  roles: (typeof resume.work)[number][]
}

/**
 * The connective tissue: technology → everything you built with it.
 *
 * This answers the exact question a hiring manager has — has this person
 * actually used the thing in my job description — and it costs zero
 * JavaScript, because /stack/:tech is a prerendered page rather than a
 * client-side filter.
 *
 * Only returns technologies with at least one use. A stack page listing
 * nothing is worse than no stack page.
 */
export async function getStackUsage(): Promise<StackUsage[]> {
  const projects = await getProjects()

  return (Object.keys(TECH) as TechKey[])
    .map((key) => ({
      key,
      label: TECH[key].label,
      category: TECH[key].category,
      projects: projects.filter((p) => (p.data.stack as string[]).includes(key)),
      roles: resume.work.filter((w) => (w.stack as readonly string[]).includes(key)),
    }))
    .filter((u) => u.projects.length > 0 || u.roles.length > 0)
}

export async function getStackUsageFor(key: string): Promise<StackUsage | undefined> {
  const all = await getStackUsage()
  return all.find((u) => u.key === key)
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
