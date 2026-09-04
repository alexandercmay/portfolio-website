# Architecture

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | **Astro 5** | Ships zero JS by default. Islands architecture matches the layering in `00-overview.md` structurally. |
| Interactive islands | **React 19** (via `@astrojs/react`) | Only loaded on pages that use one. Keeps existing React knowledge useful. |
| Language | **TypeScript**, strict | Content collections are typed end-to-end from schema to template. |
| Content | **MDX** (`@astrojs/mdx`) + Content Collections | Markdown prose with components inline where they explain something. |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) | CSS-first config. Astro scopes component styles by default. |
| Images | **`astro:assets`** | Built-in optimization, responsive `srcset`, automatic width/height. |
| Search | **Pagefind** | Indexes the *built HTML* post-build. No hand-maintained index. |
| Hosting | **Cloudflare Pages** | Global CDN, free, zero maintenance, Workers available. |
| Serverless (optional) | **Cloudflare Pages Functions** | Only if a live demo ever needs a server-side secret. |
| Testing | **Vitest** + **Playwright** | Unit for content logic, smoke for built routes. |

### Why Astro

The priority is presentation and performance, with interactivity isolated to
deep pages. That is exactly the problem Astro is built for.

- **Zero JavaScript by default.** An Astro page compiles to HTML. There is no
  framework runtime shipped unless a component opts in. Your landing page and
  resume genuinely ship 0KB of JS.
- **Islands.** An interactive component declares its own hydration strategy
  (`client:load`, `client:idle`, `client:visible`). Only that component's JS
  ships, only on the page containing it. There is no shared bundle to amortize,
  so a heavy demo on one project page has *zero* cost on every other page.
- **Content Collections are built in.** Zod-validated frontmatter, generated
  TypeScript types, and a typed query API — natively. This replaces a
  significant amount of hand-rolled pipeline code.
- **File-based routing with static output.** Every route is a real HTML file.
  Deep links, crawlers, and link unfurlers all work with no special handling.

The trade: a smaller ecosystem than React-everything, and `.astro` component
syntax to learn (it is JSX-like with a frontmatter script block — an afternoon).
Both are worth it here.

## Rendering model

**`output: 'static'`.** Every page is prerendered at build time. There is no
server-rendered page, no runtime data fetching, no adapter needed for the site
itself.

Any serverless endpoint lives in a top-level `functions/` directory as a
Cloudflare Pages Function, entirely separate from the Astro build. This keeps
the Astro configuration trivially simple and guarantees that **no page can fail
to render because a function is down**.

## Repository layout

```
<repo-root>/
├── .github/workflows/ci.yml   # typecheck, lint, test, a11y, Lighthouse budget
├── docs/                      # these planning documents
├── content/                   # ALL authored content — see 02-content-model.md
│   ├── projects/
│   ├── posts/
│   └── resume.ts
├── functions/                 # optional Cloudflare Pages Functions
├── public/                    # copied verbatim: favicon, robots.txt
├── scripts/
│   ├── build-resume-pdf.ts
│   └── new-update.ts
├── src/
│   ├── content.config.ts      # collection definitions (Zod schemas)
│   ├── components/            # .astro presentational components
│   ├── islands/               # .tsx React components — ONLY interactive ones
│   ├── layouts/
│   ├── pages/                 # file-based routes
│   ├── styles/
│   └── lib/
└── astro.config.mjs
```

Two boundaries are strict:

1. **`content/` vs `src/`** — you should never open `src/` to publish an update.
   If a routine content change requires a code change, the content model is
   wrong.
2. **`components/` vs `islands/`** — anything in `islands/` ships JavaScript to
   the browser. Keeping them in a separate directory makes the cost visible.
   A component only moves there when it has earned it per `05-interactivity.md`.

## Content pipeline

Astro's Content Layer handles this natively. The `glob()` loader lets content
live at the repo root rather than inside `src/`, preserving boundary 1 above.

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const projects = defineCollection({
  loader: glob({ pattern: '**/index.mdx', base: './content/projects' }),
  schema: ({ image }) => z.object({ /* see 02-content-model.md */ }),
})
```

```
content/**/*.mdx
      │
      │  glob() loader
      ▼
Astro Content Layer
      │  frontmatter validated against Zod schema → build fails on error
      │  TypeScript types generated automatically
      ▼
getCollection('projects') — fully typed
      │
      ▼
Astro builds one static HTML file per route
      │
      ▼
Pagefind indexes the built HTML → search index
```

Frontmatter validation is not optional and not something to remember to run —
an invalid file fails the build with the file path and the failing field. This
matters when publishing quickly.

## Routing

File-based, in `src/pages/`:

```
index.astro                          → /
resume.astro                         → /resume
about.astro                          → /about
feed.astro                           → /feed
projects/index.astro                 → /projects
projects/[slug].astro                → /projects/:slug
projects/[slug]/[update].astro       → /projects/:slug/:update
404.astro                            → /404
```

Dynamic routes enumerate their paths via `getStaticPaths()` from the content
collections. Every route becomes a real file in `dist/`.

**No base path complexity.** Deploying to a custom domain on Cloudflare Pages
means `base` is `/`. The env-var indirection planned for GitHub Pages project
sites is no longer needed — one class of bug removed by the hosting change.

## Search

**Pagefind**, run as a post-build step against `dist/`. It indexes the actual
rendered HTML, which means:

- No hand-maintained search index that can drift from content
- Content inside MDX components is indexed automatically
- The index is chunked and fetched on demand — nothing loads until a user
  searches

This replaces the MiniSearch + build-script approach from the earlier plan and
removes a whole script from `scripts/`.

## Deployment

Cloudflare Pages, connected directly to the GitHub repo. No deploy workflow to
maintain.

- **Production**: push to `main` → build → live
- **Preview**: every pull request gets its own URL automatically. Useful for
  reviewing a redesign before it's public, and for sending someone a draft
  project page.
- Build command `npm run build`, output directory `dist`
- Node version pinned via `.nvmrc` and an env var

`.github/workflows/ci.yml` still runs on pull requests for typecheck, lint,
tests, `axe` accessibility checks, and the Lighthouse budget. Cloudflare handles
deploying; GitHub handles gating.

### Cache headers

Cloudflare Pages allows a `public/_headers` file — real cache control, which
GitHub Pages does not offer:

```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
/*.pdf
  Cache-Control: public, max-age=3600
```

Astro fingerprints hashed assets into `/_astro/`, so they can be cached
permanently and safely.

## Domain

**Undecided.** The directory name `alexandermay.website` is a local placeholder,
not a chosen domain. Naming criteria and candidates are in `06-decisions.md`
(D-007).

Whatever is chosen, put DNS on Cloudflare — same account as hosting, so it's one
dashboard and automatic TLS. Until then the site is reachable at its
`*.pages.dev` subdomain, which works fine for development and even for early
sharing; it just reads worse on a resume.

The only build-time coupling is `site:` in `astro.config.mjs`, which feeds
canonical URLs, the sitemap, and social image URLs. Changing it later is a
one-line edit and a rebuild, so this decision does not block any implementation
work — it only blocks putting the URL on applications.

## Analytics

**Cloudflare Web Analytics** — free, cookieless, no consent banner, already part
of the hosting account. Server-side, so it adds no client JavaScript at all,
which preserves the zero-JS property of the landing page.

This is strictly better than the Plausible/Umami recommendation from the earlier
plan, purely because it comes with the host.

Rejected: Google Analytics — heavier, requires a consent banner in the EU, and
that banner would sit between a recruiter and your resume.

## Security and privacy posture

- **No secrets in the repo.** The build output is public and the repo is public.
  Secrets belong in Cloudflare's environment variables, readable only by a Pages
  Function at runtime — never in the site bundle.
- **No personal address or phone number** in source or content. Email only.
- Contact is a `mailto:` link, not a form. A form needs an endpoint that can
  fail silently, which is the worst failure mode available — you'd never know a
  message was lost.
- Third-party embeds load lazily and only on pages that need them.

## The AI-demo constraint, revisited

The earlier plan treated live LLM calls as effectively impossible, because
GitHub Pages offers no server-side secret storage.

**Cloudflare Pages Functions change this.** A Worker can hold an API key in an
environment variable and proxy requests, with the key never reaching the browser.
This is the clean solution the previous plan lacked.

It is still not free of consequences — rate limiting, a spend cap, and a graceful
degraded state are mandatory, and a demo that is down is worse than no demo. The
full treatment is in `05-interactivity.md`, but the constraint has moved from
"impossible" to "possible, with discipline."
