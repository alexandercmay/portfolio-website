# Content Model

Deliberately small. Two kinds of content: **projects** and **the resume**.
That's it.

## What this replaces

An earlier version of this plan had projects owning a stream of dated updates,
which merged into a site-wide feed — a devlog. That's cut.

The reasoning: a devlog is only worth its machinery if it's actually maintained.
An abandoned feed showing three entries from eight months ago signals
abandonment *more* strongly than having no feed at all. Editing a project page
in place has no staleness failure mode — the page simply describes what's true
now.

What's deleted: the `updates` and `posts` collections, `/feed`,
`/projects/:slug/:update`, prev/next navigation, the RSS feed, the update
scaffolder, and the `DevlogList` / `UpdateEntry` / `FeedList` components.

What replaces the recency signal: an `updated` date in project frontmatter.

## Directory layout

```
content/
├── resume.ts                       # structured, typed, single source of truth
└── projects/
    ├── <project-slug>.mdx          # one file per project
    └── assets/
        └── <project-slug>/
            └── architecture.png
```

One file per project. No folders per project, no nested update files. Adding a
project is adding a file; updating one is editing that file.

## Projects collection

`src/content.config.ts`. Astro validates frontmatter against this Zod schema at
build time **and** generates TypeScript types from it — one definition, no
drift, no separate validation step to remember.

```ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { TECH } from '../content/taxonomy'

const techKey = z.enum(Object.keys(TECH) as [string, ...string[]])

const projects = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './content/projects' }),
  schema: ({ image }) => z.object({
    title:    z.string(),
    tagline:  z.string().max(120),      // one line — cards and social previews
    status:   z.enum(['active', 'shipped', 'archived', 'exploration']),
    started:  z.coerce.date(),
    ended:    z.coerce.date().optional(),   // absent = ongoing
    updated:  z.coerce.date(),          // last meaningful change — see below
    role:     z.string().optional(),        // "solo" | "team of 4, led backend"
    stack:    z.array(techKey),
    tags:     z.array(z.string()).default([]),
    links: z.object({
      repo:    z.string().url().optional(),
      live:    z.string().url().optional(),
      writeup: z.string().url().optional(),
      video:   z.string().url().optional(),
    }).default({}),
    cover:    image().optional(),        // astro:assets — optimized automatically
    featured: z.boolean().default(false),
    weight:   z.number().default(0),
    summary:  z.string(),                // plain text, 2–3 sentences
    draft:    z.boolean().default(false),
  }),
})
```

### `updated`

Carries the recency signal the devlog used to provide. Surfaced as "Updated
March 2026" on project cards and the project page, and it drives default
ordering on `/projects`.

Bump it when you make a **meaningful** change — new work described, results
added, an architecture section rewritten. Not for typo fixes. It's a claim about
the project, not about the file.

Kept manual rather than derived from git mtime deliberately: a formatting pass
across every file shouldn't announce that you updated every project.

### Other fields

`summary` is plain text, not MDX — it appears in cards, meta descriptions, and
social preview images, all contexts where components can't render. The MDX body
is the long-form version.

`cover` uses Astro's `image()` helper, so covers are optimized, converted to
modern formats, and emitted with explicit dimensions automatically.

`status` is not decoration. `exploration` and `archived` let you publish
half-finished work honestly rather than omitting it or overstating it. Visible
honesty about project state reads as senior.

`draft: true` is excluded from production builds, visible in `astro dev`. If the
repo is public, treat a draft as "not yet presented," not "private."

## Resume

Structured data, not prose — `content/resume.ts`, a typed object, the single
source of truth for:

1. The homepage's Selected experience, skills, and education sections
2. The `/resume` page (complete history)
3. The downloadable PDF, generated at build time
4. `schema.org/Person` JSON-LD

```ts
export const resume = {
  basics: {
    name:     string,
    headline: string,      // "Full-stack engineer, AI systems"
    location: string,      // city/region only — never a street address
    email:    string,
    profiles: { network, url, username }[],
    summary:  string,
  },
  work: {
    org, title, location?,
    start: Date, end?: Date,
    headline: string,      // THE sentence — set large on the homepage
    featured?: boolean,    // appears in homepage "Selected experience"
    weight?: number,       // ordering among featured entries
    highlights: string[],  // supporting accomplishments, verb-first
    stack: TechKey[],
  }[],
  education: {
    institution, degree, field,
    start: Date, end?: Date,
    highlights: string[],
  }[],
  skills: { category: string, items: TechKey[] }[],
  metrics?: { value: string, label: string }[],   // homepage metrics band
} satisfies Resume
```

The shape mirrors [JSON Resume](https://jsonresume.org/schema/) closely enough
to export to it later if an application portal asks.

**Highlights are the resume.** Verb-first, concrete outcome. `"Built a retrieval
pipeline"` is filler; `"Cut retrieval latency 340ms → 90ms by replacing
per-query embedding with a cached ANN index"` is a reason to interview you. No
schema can enforce this — it's where the actual effort goes, not the CSS.

### `headline` — the one that gets set large

On the homepage, each featured role's `headline` is set at `--text-deck` —
roughly three times body size. It's the sentence you'd want read if they read
nothing else about that job.

That size is unforgiving. A vague headline looks *worse* set large than buried
in a bullet list, because the design gives it nowhere to hide. That's the point:
the layout applies pressure to the writing.

- ✅ "Cut p99 retrieval latency from 340ms to 90ms across 12M documents"
- ❌ "Contributed to backend infrastructure and performance work"

Write one for every role, not just featured ones — the flag may move as your
history grows.

### Curation costs nothing

`featured` selects which roles appear on the homepage. Two or three is right;
more and the section stops being selective.

The homepage renders featured entries with their `headline`. `/resume` renders
**every** entry with full `highlights`. Same object, two presentations, **no
second copy of your work history to keep in sync.**

`metrics` is optional and the homepage band is omitted entirely when it's
absent. Three invented-sounding figures do more damage than none.

## Controlled vocabulary

`stack` and `skills` entries must be keys in `content/taxonomy.ts`, or you get
`Postgres`, `PostgreSQL`, and `postgres` as three separate things.

```ts
export const TECH = {
  typescript: { label: 'TypeScript', category: 'Languages' },
  python:     { label: 'Python',     category: 'Languages' },
  pytorch:    { label: 'PyTorch',    category: 'AI / ML' },
} as const

export type TechKey = keyof typeof TECH
```

Because the schema builds a `z.enum` from these keys, an unknown technology is
**both** a TypeScript error and a build failure naming the offending file.
Renaming one is a one-line change.

## Derived queries

`src/lib/content.ts` wraps `getCollection()`:

| Helper | Used by |
| --- | --- |
| `getProjects()` | Project index — featured → weight → `updated` |
| `getFeaturedProjects()` | Homepage |
| `getRelated(project)` | Project page footer |
| `getStackUsage()` | Tech key → projects and roles using it |

Four helpers, down from six. `getFeed()` and `getUpdatesFor()` are gone.

## The authoring loop

Two operations, both cheap:

**New project:**
```bash
npm run new:project "Retrieval service"
```
Scaffolds `content/projects/retrieval-service.mdx` with valid frontmatter.

**Update a project:** open its `.mdx`, edit the prose, bump `updated`, commit.

That's the whole content system. The test of this model is that the second
operation is obvious enough that you'll actually do it — which is exactly why
the devlog is gone.
