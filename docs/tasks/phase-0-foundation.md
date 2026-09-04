# Phase 0 — Foundation

**Goal:** a hello-world Astro page, live at a real URL, deploying automatically
on push. No design, no content.

**Why first:** deployment and DNS problems are far cheaper to debug against a
blank page than against a finished site.

---

## 0.1 Repository — deferred

You're configuring version control yourself. Nothing below depends on it until
**0.4**, where Cloudflare Pages needs a repo to connect to. Build locally until
then.

When you do set it up (see `docs/06-decisions.md` D-011 for the hazard):

- [ ] `git init` **in this directory** — it currently resolves to a repo rooted
      at your home directory pointing at the CSC342 class repo
- [ ] Confirm with `git rev-parse --show-toplevel`
- [x] `.gitignore`: `node_modules/`, `dist/`, `.astro/`, `.env*`, `.DS_Store`
- [ ] Repo can be **private** — Cloudflare Pages doesn't require public, unlike
      GitHub Pages on a free account
- [x] `README.md`: what the site is, how to run it, how to add content
- [ ] Licensing — code can be open; keep content (resume prose, writeups)
      all-rights-reserved regardless

## 0.2 Astro scaffold

- [x] `npm create astro@latest .` — minimal template, TypeScript strict
- [x] Add integrations: `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/react`
- [x] Add `@tailwindcss/vite` (Tailwind v4)
- [x] Confirm `output: 'static'` in `astro.config.mjs`
- [x] Set `site:` to the `*.pages.dev` URL for now (feeds sitemap + canonicals);
      swap to the real domain when D-007 closes — one line, then rebuild
- [x] Pin Node via `.nvmrc` + `engines`
- [x] Path alias `@/` → `src/`
- [x] ESLint + Prettier with the Astro plugin, agreeing with each other
- [x] Scripts: `dev`, `build`, `preview`, `typecheck` (`astro check`), `lint`,
      `format`, `test`
- [x] Vitest configured, one trivial passing test
- [x] Confirm `npm run build` emits static HTML in `dist/`

## 0.3 Route skeleton

- [x] Create placeholder pages for the six routes in
      `03-information-architecture.md`
- [x] Base layout with `<slot />`, skip link, header, footer
- [x] `404.astro`
- [x] Verify `dist/` contains a real `index.html` per route
- [x] **Verify the built HTML contains zero `<script>` tags** — this is the
      baseline property to protect for the rest of the project

## 0.4 Cloudflare deployment

Cloudflare provisions new projects as **Workers with Static Assets**, not Pages.
Deploy command is `npx wrangler versions upload`, which needs `wrangler.jsonc`.

- [x] Create a Cloudflare account
- [x] Connect the GitHub repo
- [x] Build command `npm run build`, output directory `dist`
- [x] `wrangler.jsonc` with `assets.directory`, `not_found_handling: "404-page"`,
      `html_handling: "drop-trailing-slash"`
- [x] `trailingSlash: 'never'` in `astro.config.mjs` to match — otherwise every
      internal link 307s and canonicals point at redirect targets
- [x] `public/_headers` — Cache-Control on specific paths only, never on `/*`
      (Cloudflare concatenates matching rules; a `/*` rule silently breaks the
      immutable asset caching)
- [x] Verified locally with `npx wrangler dev`: all routes 200, `/about/` 307s
      to `/about`, unknown paths serve `404.html` with a 404, hashed assets get
      `immutable`
- [ ] Redeploy and confirm the site is **live at the `*.workers.dev` URL**
- [ ] Test a deep link directly in a fresh tab — must not 404
- [ ] Open a test PR and confirm a preview deployment URL is generated

## 0.5 CI

- [x] `.github/workflows/ci.yml` running on pull requests
- [x] Steps: `npm ci`, `astro check`, lint, test, build
- [ ] Branch protection on `main` requiring CI to pass
- [ ] Confirm a deliberately broken PR fails

## 0.6 Domain (D-007) — can happen any time before Phase 3 ships

Not a blocker. Build and deploy against `*.pages.dev`; attach the real domain
whenever you've picked one. See `docs/06-decisions.md` D-007 for naming criteria
and candidates — short, sayable out loud, on `.dev` or `.com`.

- [ ] Pick and register the domain
- [ ] Move its DNS to Cloudflare (same dashboard as hosting, automatic TLS)
- [ ] Pages → Custom domains → add the apex and `www`
- [ ] Redirect `www` → apex (or the reverse; pick one and be consistent)
- [ ] Confirm HTTPS works and HTTP redirects
- [ ] Update `site:` in `astro.config.mjs`, rebuild, and re-check canonical URLs
      and social image URLs

---

**Exit criteria:** a public URL serves a hello-world page with zero `<script>`
tags, and deep links don't 404.

Once version control is wired up (0.1) the pipeline completes: pushing to `main`
redeploys automatically, PRs get preview URLs, and CI blocks a broken PR. Until
then, `npm run build` producing correct static output locally is enough to move
on to Phase 1.
