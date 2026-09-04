# Content Model

This is the core of the site. Get this right and everything else is rendering.

## The central idea

You asked whether the blog should be site-wide or per-project. The answer is
**neither, exactly** — it is one primitive rendered two ways.

A **project** is a long-lived entity with metadata and a stream of dated
**updates**. A **post** is a standalone update not attached to a project.

- A **project page** renders that project's own update stream → the per-project
  devlog you described.
- The **feed page** renders all updates from all projects, plus standalone posts,
  merged in date order → a site-wide blog, for free, with no extra authoring.

You write one file. It appears in both places. There is no duplication and no
decision at authoring time about "where does this go."

This also solves staleness: a site-wide blog needs a reason to write. A project
devlog always has one — you did work on the project.

## Directory layout

```
content/
├── resume.ts                          # structured, typed, single source of truth
├── projects/
│   └── <project-slug>/
│       ├── index.mdx                  # metadata + overview prose
│       ├── updates/
│       │   ├── 2026-03-04-first-prototype.mdx
│       │   └── 2026-04-11-shipped-v1.mdx
│       └── assets/
│           └── architecture.png
└── posts/
    └── 2026-01-02-standalone-thing.mdx
```

**Why updates are individual files, not one changelog:** each update gets its own
URL, its own social preview, and its own place in the feed. You can link a single
update in an application or a message. A changelog file gives you none of that.

Filenames are `YYYY-MM-DD-slug.mdx`. The date is in the filename so the folder
sorts chronologically in any file browser, and so the build can catch a
filename/frontmatter date mismatch.

## Collections

Defined in `src/content.config.ts`. Astro's Content Layer validates frontmatter
against these Zod schemas at build time **and** generates TypeScript types from
them. One definition, no drift, no separate validation step to remember.

```ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { TECH } from '../content/taxonomy'

const techKey = z.enum(Object.keys(TECH) as [string, ...string[]])
```

### Projects

```ts
const projects = defineCollection({
  loader: glob({ pattern: '**/index.mdx', base: './content/projects' }),
  schema: ({ image }) => z.object({
    title:    z.string(),
    tagline:  z.string().max(120),      // one line — cards and social previews
    status:   z.enum(['active', 'shipped', 'archived', 'exploration']),
    started:  z.coerce.date(),
    ended:    z.coerce.date().optional(),   // absent = ongoing
    role:     z.string().optional(),        // "solo" | "team of 4, led backend"
    stack:    z.array(techKey),
    tags:     z.array(z.string()).default([]),
    links: z.object({
      repo:    z.string().url().optional(),
      live:    z.string().url().optional(),
      writeup: z.string().url().optional(),
      video:   z.string().url().optional(),
    }).default({}),
    cover:    image().optional(),        // astro:assets — optimized, dimensions inferred
    featured: z.boolean().default(false),
    weight:   z.number().default(0),
    summary:  z.string(),                // plain text, 2–3 sentences
  }),
})
```

`cover` uses Astro's `image()` helper, so covers are optimized, converted to
modern formats, and emitted with explicit dimensions automatically. That is a
meaningful chunk of the old Phase 4 performance work handled by the framework.

`summary` is deliberately plain text, not MDX. It appears in cards, search
results, meta descriptions, and OG images — contexts where components can't
render. The MDX body is the long-form version.

`status` is not decoration. `exploration` and `archived` let you publish
half-finished work honestly rather than omitting it or overstating it. Visible
honesty about project state reads as senior.

### Updates

```ts
const updates = defineCollection({
  loader: glob({ pattern: '**/updates/*.mdx', base: './content/projects' }),
  schema: z.object({
    date:    z.coerce.date(),
    title:   z.string(),
    kind:    z.enum(['update', 'milestone', 'writeup', 'note']).default('update'),
    summary: z.string().max(280),        // required — forces a real feed entry
    tags:    z.array(z.string()).default([]),
    draft:   z.boolean().default(false),
  }),
})
```

The entry `id` is the path relative to the base — e.g.
`my-project/updates/2026-03-04-first-prototype`. The owning project and the
update slug are both derived from it in `src/lib/content.ts`; they are not
duplicated in frontmatter, so they cannot disagree with the file's location.

`kind` drives visual weight in the feed. A `milestone` renders larger than a
`note`. This lets you post low-stakes notes frequently without every entry
demanding equal attention — which is what actually keeps a devlog alive.

`draft: true` is excluded from production builds, visible in `astro dev`. The
repo is public, so treat a draft as "not yet presented," not "private."

### Posts

Same schema as updates, loaded from `./content/posts`, with no owning project.
They appear in the feed alongside updates.

## Resume

The resume is **structured data, not prose** — `content/resume.ts`, a typed
object, the single source of truth for four outputs:

1. The web resume page
2. The downloadable PDF (generated at build time)
3. `schema.org/Person` JSON-LD
4. Skill and date data reused on the landing page and project pages

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
    summary?: string,
    highlights: string[],  // one accomplishment each, verb-first
    stack: TechKey[],
  }[],
  education: {
    institution, degree, field,
    start: Date, end?: Date,
    highlights: string[],
  }[],
  skills: { category: string, items: TechKey[] }[],
} satisfies Resume
```

The shape intentionally mirrors [JSON Resume](https://jsonresume.org/schema/) —
not adopted wholesale, but close enough to export later if an application portal
asks for it.

**Highlights are the resume.** Each should be verb-first with a concrete outcome.
`"Built a retrieval pipeline"` is filler; `"Cut retrieval latency 340ms → 90ms by
replacing per-query embedding with a cached ANN index"` is a reason to interview
you. No schema can enforce this — it is where the actual effort goes, not the CSS.

## Controlled vocabulary

`stack` and `skills` entries must be keys in `content/taxonomy.ts`. Otherwise you
get `Postgres`, `PostgreSQL`, and `postgres` as three separate filter facets.

```ts
export const TECH = {
  typescript: { label: 'TypeScript', category: 'Languages' },
  python:     { label: 'Python',     category: 'Languages' },
  pytorch:    { label: 'PyTorch',    category: 'AI / ML' },
} as const

export type TechKey = keyof typeof TECH
```

Because the collection schemas build a `z.enum` from these keys, an unknown key
is **both** a TypeScript error and a build failure with the offending file named.
Renaming a technology is a one-line change.

## Derived queries

`src/lib/content.ts` wraps `getCollection()` with typed helpers:

| Helper | Used by |
| --- | --- |
| `getProjects()` | Project index, sorted by featured → weight → recency |
| `getFeaturedProjects()` | Landing page |
| `getFeed()` | Feed page, landing "recent activity" |
| `getUpdatesFor(slug)` | Project page devlog |
| `getRelated(project)` | Project page footer |
| `getStackUsage()` | Tech key → projects and roles using it |

`getStackUsage()` is the connective tissue that makes the site more than a list
of pages: a technology chip anywhere links to everything you built with it. That
answers the exact question a hiring manager has — *has this person actually used
the thing in my job description?* — and it costs zero JavaScript, because the
filtered views are prerendered pages, not client-side filtering.

That last point is a direct consequence of choosing Astro: what would have been
an interactive filter in the React plan is now a set of static pages that load
instantly and work without JS.

## The authoring loop

The test of this model is whether posting an update stays cheap:

```bash
npm run new:update my-project "Shipped the caching layer"
```

Scaffolds `content/projects/my-project/updates/2026-09-04-shipped-the-caching-layer.mdx`
with valid frontmatter filled in. Write prose, commit, push. Cloudflare deploys.

If that loop ever takes more than five minutes, the site goes stale. Protecting
it is a design requirement, not a nicety.
