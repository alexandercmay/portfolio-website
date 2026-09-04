/**
 * Scaffold a project.
 *
 *   npm run new:project "Retrieval service"
 *
 * Writes content/projects/<slug>.mdx with valid frontmatter already filled in,
 * so adding a project is writing prose rather than remembering field names.
 *
 * To UPDATE a project later: edit its .mdx and bump `updated`. There is no
 * separate update file and no feed — see docs/06-decisions.md D-004.
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const title = process.argv.slice(2).join(' ').trim()

if (!title) {
  console.error('Usage: npm run new:project "Project title"')
  process.exit(1)
}

const slug = title
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')

const dir = join(process.cwd(), 'content', 'projects')
const file = join(dir, `${slug}.mdx`)

if (existsSync(file)) {
  console.error(`Already exists: content/projects/${slug}.mdx`)
  process.exit(1)
}

const today = new Date().toISOString().slice(0, 10)

// Section prompts mirror docs/tasks/phase-3-content.md — the order matters,
// and "what was hard" is the section that actually convinces people.
const body = `---
title: ${title}
tagline: One line, under 120 characters — used on cards and social previews
status: active
started: ${today}
updated: ${today}
role: solo
stack: [typescript]
tags: []
# Uncomment and fill in as they exist — an empty key here fails the build,
# because YAML parses a valueless key as null rather than as absent.
# links:
#   repo: https://github.com/alexandercmay/...
#   live: https://...
featured: false
weight: 0
summary: >-
  Two or three plain-text sentences. Appears on cards and as the meta
  description, so no components and no markdown here.
---

## The problem

What was this actually solving? Start here, not with the stack.

## What I built

Concrete, with architecture where it matters.

## What was hard

The most valuable section — this is where an experienced engineer decides
whether you actually built it.

## Results

Users, performance, correctness, what shipped.

## What I'd do differently

Signals judgment. Most portfolios omit this, which is exactly why including it
is convincing.
`

mkdirSync(dir, { recursive: true })
writeFileSync(file, body)

console.log(`Created content/projects/${slug}.mdx`)
console.log(`        /projects/${slug}`)
console.log('')
console.log(
  'Remember: set `stack` from content/taxonomy.ts (an unknown key fails the build),',
)
console.log('and bump `updated` whenever you make a meaningful change.')
