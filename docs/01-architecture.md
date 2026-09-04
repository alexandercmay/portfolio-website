# Architecture

## Stack

Versions below are what is actually installed, verified at Phase 0. The planning
docs originally assumed Astro 5; Astro 7 was current at scaffold time and the
APIs this plan depends on — content collections, the `glob()` loader,
`astro:assets`, `output: 'static'` — are all present and unchanged.

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | **Astro 7** | Ships zero JS by default. Islands architecture matches the layering in `00-overview.md` structurally. |
| Interactive islands | **React 19** (via `@astrojs/react`) | Only loaded on pages that use one. Keeps existing React knowledge useful. |
| Language | **TypeScript**, strict | Content collections are typed end-to-end from schema to template. |
| Content | **MDX** (`@astrojs/mdx`) + Content Collections | Markdown prose with components inline where they explain something. |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) | CSS-first config. Astro scopes component styles by default. |
| Images | **`astro:assets`** | Built-in optimization, responsive `srcset`, automatic width/height. |
| Hosting | **Cloudflare Pages** | Global CDN, free, zero maintenance, real cache headers, preview deploys. |
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
server-rendered page, no runtime data fetching, no adapter, and **no
server-side code of any kind**.

The site is a directory of HTML, CSS, images, and a small amount of JavaScript
on a handful of deep pages. There is no backend to deploy, monitor, secure, or
pay for, and no request-time failure mode: once a build succeeds, every page
works until you change it.

## Repository layout

```
<repo-root>/
├── .github/workflows/ci.yml   # typecheck, lint, test, a11y, Lighthouse budget
├── docs/                      # these planning documents
├── content/                   # ALL authored content — see 02-content-model.md
│   ├── projects/          # one .mdx per project
│   └── resume.ts
├── public/                    # copied verbatim: favicon, robots.txt
├── scripts/
│   ├── build-resume-pdf.ts
│   └── new-project.ts
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

1. **`content/` vs `src/`** — you should never open `src/` to add or update a
   project. If a routine content change requires a code change, the content
   model is wrong.
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
  loader: glob({ pattern: '*.mdx', base: './content/projects' }),
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
dist/ — one HTML file per route, ready to serve
```

Frontmatter validation is not optional and not something to remember to run —
an invalid file fails the build with the file path and the failing field.

## Routing

File-based, in `src/pages/`:

```
index.astro                          → /
resume.astro                         → /resume
about.astro                          → /about
projects/index.astro                 → /projects
projects/[slug].astro                → /projects/:slug
stack/[tech].astro                   → /stack/:tech
404.astro                            → /404
```

Dynamic routes enumerate their paths via `getStaticPaths()` from the content
collections. Every route becomes a real file in `dist/`.

**No base path complexity.** Deploying to a custom domain on Cloudflare Pages
means `base` is `/`. The env-var indirection planned for GitHub Pages project
sites is no longer needed — one class of bug removed by the hosting change.

## Search — deferred

There is no search. With well under a dozen pages, browsing beats searching, and
a search box on a small site reads as scaffolding for content that isn't there.

If the project count ever justifies it, **Pagefind** indexes the built HTML as a
post-build step — no content-model change, no schema migration, no hand-built
index. It's a drop-in addition whenever it earns its place.

## Deployment

**Cloudflare Workers with Static Assets**, connected directly to the GitHub
repo. No deploy workflow to maintain.

> These docs originally said "Cloudflare Pages." Cloudflare now provisions new
> projects as Workers with Static Assets and deploys them via
> `npx wrangler versions upload`. Everything D-012 argued for still holds — same
> global CDN, same free tier, same zero maintenance, `_headers` still supported,
> preview deployments still per-branch. Only the product name and the deploy
> mechanism changed. The site remains a directory of static files with no Worker
> script and no server-side code.

Configuration lives in `wrangler.jsonc`:

```jsonc
{
  "name": "portfolio-website",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page",
    "html_handling": "drop-trailing-slash"
  }
}
```

Two settings are load-bearing and easy to get wrong:

- **`not_found_handling: "404-page"`** serves the prerendered `404.html` with a
  real 404 status. The default (`"none"`) returns a bare Cloudflare page.
  Never use `"single-page-application"` — it serves `index.html` with a **200**
  for every bad URL, which hides broken links from crawlers and from you.
- **`html_handling: "drop-trailing-slash"`** must match `trailingSlash: 'never'`
  in `astro.config.mjs`. If they disagree, every internal link returns a 307
  redirect and every canonical tag points at a redirect target.

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

Astro fingerprints hashed assets into `/_astro/`, so they can be cached
permanently and safely.

**Cloudflare applies every matching rule and concatenates values for the same
header**, and `_headers` has no negative matching. So a `Cache-Control` on `/*`
appends to the `/_astro/*` rule and produces
`max-age=31536000, immutable, max-age=0, must-revalidate` — conflicting
directives in one header, silently defeating the immutable caching.

Cache-Control is therefore set only on non-overlapping specific paths, never on
`/*`. HTML is left to Cloudflare's default, which is already
`max-age=0, must-revalidate` — so a deploy is visible immediately.

```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

## Domain

**Undecided.** The directory name `alexandermay.website` is a local placeholder,
not a chosen domain. Naming criteria and candidates are in `06-decisions.md`
(D-007).

Whatever is chosen, put DNS on Cloudflare — same account as hosting, so it's one
dashboard and automatic TLS. Until then the site is reachable at its
`*.workers.dev` subdomain, which works fine for development and even for early
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

- **No secrets, anywhere.** There is no server-side component, so there is
  nowhere a secret could safely live and nothing that needs one. Any credential
  in this repo is simply a mistake.
- **No personal address or phone number** in source or content. Email only.
- Contact is a `mailto:` link, not a form. A form needs an endpoint that can
  fail silently, which is the worst failure mode available — you'd never know a
  message was lost.
- Third-party embeds load lazily and only on pages that need them.

## No live LLM API calls

Decided and closed: the site never calls an LLM API. Not from the browser
(impossible without publishing a key) and not through a serverless proxy (which
Cloudflare would technically allow).

The reasoning is in `06-decisions.md` D-008, and it is not primarily technical:
a hosted wrapper around someone else's API demonstrates almost nothing about
your engineering, while introducing cost exposure, an abuse surface, and a page
that can be broken during the exact window someone is evaluating you.

Practical consequence: **there is no `functions/` directory and no server-side
code in this project.** AI work is presented through recorded real runs or
models running in the visitor's browser — see `05-interactivity.md`.
