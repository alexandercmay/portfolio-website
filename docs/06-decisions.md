# Decision Log

Each entry: the decision, the reasoning, what was rejected, and what would make
us revisit. Rejected alternatives are recorded so they don't get re-proposed in
three months without the original context.

**Revision note:** D-001 through D-011 were originally written against a
React + Vite + GitHub Pages plan. After reconsidering priorities — presentation
and performance first, interactivity de-emphasized — the stack changed to
**Astro + Cloudflare Pages**. Superseded entries are kept, marked, and explain
what changed.

---

### D-001 — Astro, not React SPA *(supersedes original)*

**Status:** accepted

**Decision:** Astro (7.x as installed), static output, with React available for
the rare interactive island.

**Reasoning:** the stated priorities are presentation, performance, and easy
updates, with interactivity confined to deep pages. Astro ships **zero JS by
default** and hydrates individual islands on demand — which is that priority
list expressed as an architecture rather than as discipline.

Concretely, it removed work rather than adding it: content collections with Zod
validation and generated types are built in, image optimization is built in,
sitemap and RSS are integrations, and several planned "interactive" features
collapsed into static pages (see `05-interactivity.md`).

**Rejected:**
- *React + Vite SPA (the original plan).* Ships a framework runtime on every
  page whether or not it's needed. Every page pays for interactivity that only
  two pages use.
- *Next.js.* Heavier, and its best features (server components, ISR, route
  handlers) require a server this project doesn't have. Paying its complexity
  for none of its benefits.
- *SvelteKit.* Genuinely excellent performance, but weaker for content-first
  sites and less directly relevant to the roles being targeted.
- *Eleventy.* Great static generator, but no islands story as clean as Astro's,
  which matters for the Tier 1 explainers.

**Revisit if:** the site needs a genuinely app-like surface — a dashboard, a
multi-step tool with shared client state across routes. Nothing planned needs
this.

---

### D-002 — Static output; every route prerendered *(revised)*

**Status:** accepted

Unchanged in intent from the original: real HTML per route, so deep links work,
crawlers see content, and link unfurlers (Slack, LinkedIn, iMessage, ATS tools)
produce correct previews.

What changed: this is now the framework default rather than a bolt-on
(`vite-react-ssg`). The prerendering machinery specced in the original
architecture doc no longer exists, and the class of bugs where a component
touches `window` during SSG largely goes away, because most components never run
client-side at all.

---

### D-003 — MDX for content, not plain markdown

**Status:** accepted, unchanged

Addresses "all content as markdown is far too restrictive." Prose stays in
markdown; components can appear inline where they explain something. Content
remains readable files in git.

**Rejected:** plain markdown (too restrictive); a headless CMS (adds an account,
an API, a runtime dependency, and breaks content-versioned-with-code, in exchange
for an editing UI a single technical author doesn't need); prose in TSX/Astro
files (unpleasant enough to write that it would suppress posting frequency — the
thing most worth protecting).

---

### D-004 — One page per project, edited in place *(reversed)*

**Status:** accepted — reverses the original decision

**Decision:** each project is a **single standalone `.mdx` file**. Progress is
recorded by editing that file and bumping an `updated` date. There are no
updates, no posts, no feed.

**What was reversed:** the original D-004 had projects owning a stream of dated
update files, merged into a site-wide `/feed` — a devlog. It was designed to
solve blog staleness, on the theory that a project devlog always has a reason to
write where a general blog doesn't.

**Why that was wrong:** it optimized the wrong failure. A devlog only pays for
its machinery if it's *actually maintained*, and an abandoned feed showing three
entries from eight months ago signals abandonment **more strongly** than having
no feed at all. The original design added a visible, dated commitment during a
period — a job search — when the maintainer has the least spare attention.

Editing a page in place has no staleness failure mode. The page describes what's
true now. There is nothing to fall behind.

**What this deletes:** the `updates` and `posts` collections, `/feed`,
`/projects/:slug/:update`, prev/next navigation, the `kind` field, the RSS feed,
the `new:update` scaffolder, and the `DevlogList` / `UpdateEntry` / `FeedList`
components. Nine routes became six.

**What replaces the recency signal:** an `updated` date in project frontmatter,
shown on cards and project pages and driving default ordering. Same signal,
none of the machinery. Kept manual rather than derived from git mtime, so a
formatting pass doesn't claim you updated every project.

**Cost, stated honestly:** you lose per-update permalinks — you can no longer
link one specific piece of progress in an application, and updates get no
individual social previews. That's a real loss, and it's the right trade at this
scale: it only mattered if you were publishing often enough for individual
updates to be worth citing, which is the assumption that didn't hold.

**Revisit if:** you find yourself repeatedly wanting to link one specific update,
or you're actually writing at a cadence that would sustain a feed. Adding an
`updates` collection later is additive — it doesn't invalidate the project
pages.

---

### D-005 — Resume as structured data, PDF generated at build

**Status:** accepted, unchanged

`content/resume.ts` is the single source of truth for the web page, the PDF, the
JSON-LD, and cross-links to projects.

**Reasoning:** a hand-maintained PDF alongside a hand-maintained web page drifts
within two updates. Then a recruiter reads one version and an interviewer reads
another, and you don't know which.

**Rejected:** a hand-designed PDF (better typography, guaranteed drift); a
markdown resume (loses the structure needed for JSON-LD and stack cross-linking).

**Open:** generation mechanism — headless Chrome against the print stylesheet
(simplest, reuses existing CSS) vs. a dedicated PDF layout. Start with headless
Chrome.

---

### D-006 — Tailwind CSS v4

**Status:** accepted, low conviction

Constrained tokens help a solo maintainer stay consistent; v4's CSS-first config
removes the config-file overhead. Tokens are defined once in CSS and consumed by
both Tailwind and plain CSS.

Slightly weaker rationale under Astro than it was under React, since Astro scopes
component styles natively and removes the class-collision problem Tailwind often
solves. Kept for token discipline and speed.

**Revisit if:** MDX content needs lots of bespoke layout where plain scoped CSS
would read better. Most easily reversed decision in this document.

---

### D-007 — Domain

**Status:** open — needed before putting the URL on applications, not before
building

`alexandermay.website` is the local folder name, not a chosen domain. Nothing has
been decided.

**This no longer blocks implementation.** The base-path complexity that made it
risky under GitHub Pages is gone — Cloudflare Pages serves from the root
regardless of domain. The only coupling is `site:` in `astro.config.mjs`
(canonical URLs, sitemap, social image URLs), which is a one-line change and a
rebuild. Build against the `*.workers.dev` subdomain and swap the domain in
whenever it's ready.

**Criteria**, in rough priority order:

1. **Sayable out loud.** You will read this over the phone in a screen. If it
   needs spelling or explaining, it's the wrong name.
2. **Short.** It goes in an email signature and on a resume header.
3. **A TLD that reads as professional.** This matters more than people expect —
   the TLD is the last thing a recruiter's eye lands on.
4. **Recognizably yours.** Your name is the strongest available brand here; a
   clever unrelated word is worse.

**TLD guidance:**

- **`.dev`** — the strongest choice for an engineer. Reads as technical and
  current, availability is far better than `.com`, and it's HSTS-preloaded so
  HTTPS is enforced at the browser level.
- **`.com`** — most conventional and most trusted, but a plain-name `.com` is
  usually taken or expensive.
- **`.me`** — acceptable, slightly dated.
- **Avoid `.io`** — expensive, and its long-term status as a ccTLD is genuinely
  uncertain following the Chagos Islands sovereignty transfer. Not a risk worth
  taking on a domain meant to sit on a resume for years.
- **Avoid `.ai`** — expensive, and on a personal site it reads as claiming to be
  an AI company rather than a person who works on AI.
- **Avoid `.website`, `.site`, `.xyz`, `.online`** — these read as leftovers, and
  a recruiter's pattern-match on unfamiliar TLDs is "spam," not "creative."

**Candidates worth checking** (availability unverified):

`alexandermay.dev` · `alexmay.dev` · `acmay.dev` · `alexandercmay.dev` ·
`alexandermay.com`

Take the shortest one you can get on `.dev` or `.com`. Don't overthink it — the
content is what gets you hired, and nobody has ever declined an interview over a
domain name.

---

### D-008 — No live LLM API calls, at all *(revised twice)*

**Status:** accepted, closed

**Decision:** the site never calls an LLM API. AI work is presented through
clearly-labeled recordings of real runs, or through models running in the
visitor's browser. **No serverless proxy, no `functions/` directory, no
server-side code anywhere in this project.**

**History:** the original entry ruled live calls out on technical grounds —
GitHub Pages can't hold a secret. The move to Cloudflare Pages removed that
constraint, so the entry was revised to permit one proxied demo under strict
conditions. It is now ruled out again on better grounds, which are not
technical:

1. **It demonstrates almost nothing.** A hosted wrapper around someone else's
   API is the single most common thing on portfolio sites right now. Every other
   candidate for the same roles has built one. Reviewers discount them on sight,
   so the demo consumes your best page real estate and returns nothing.
2. **It creates real downside.** Cost exposure, an abuse surface that bots
   *will* find, and a page that can be broken during the exact window someone is
   evaluating you — the one failure this project can't afford.

Asymmetric in the wrong direction: no upside, live downside.

**What replaces it is stronger.** Recorded runs expose the reasoning trace, tool
calls, and intermediate state that a live black-box demo hides. An in-browser
model demonstrates quantization, runtime constraints, and memory budgeting —
actual engineering an API call never touches.

**Also rejected:** visitor-supplied API keys (nobody will, and it models bad
practice publicly); any form of key obfuscation (not a control).

**Second-order benefit:** this closes the project's entire server-side surface.
No secrets to manage, no spend cap to monitor, no rate limiting to implement, no
runtime failure mode. The site is a directory of files.

**Revisit if:** you build something where live inference is genuinely the point
and *the model is yours*. Even then, host that service separately and link to it
— don't couple your portfolio's uptime to it.

---

### D-009 — No contact form; `mailto:` only

**Status:** accepted, unchanged

A form needs an endpoint that can fail silently — the worst failure mode
available, since you'd never know a message was lost. Consistent with D-008,
there is no server-side code in this project, so there is nowhere to host one
anyway.

---

### D-010 — Cloudflare Web Analytics *(revised)*

**Status:** accepted

Cookieless, free, included with the hosting account, and **server-side** — so it
adds no client JavaScript and preserves the zero-JS property of the landing page.
Strictly better than the Plausible/Umami recommendation it replaces, purely
because it comes with the host.

**Rejected:** Google Analytics — heavier, needs a consent banner in the EU, and
that banner would sit between a recruiter and your resume.

---

### D-011 — Version control

**Status:** deferred — you're handling this yourself

Recorded only so the hazard isn't rediscovered later:
`/Users/alexandermay/alexandermay.website` currently resolves to a git
repository rooted at the **home directory**, whose remote is
`github.ncsu.edu/engr-csc342/csc342-2022Fall-groupM`. A `git commit` run from
here before initializing a separate repo would stage large parts of the home
directory and target a university class repo.

So: `git init` in this directory before the first commit, and confirm with
`git rev-parse --show-toplevel`. Nothing else in the plan depends on this — the
site builds and runs locally without version control, and Cloudflare Pages only
needs a repo at deploy time (Phase 0.4).

**Separately:** that home-directory repo is almost certainly accidental and is
why `git status` reports thousands of untracked files. Out of scope, but worth
cleaning up on its own.

---

### D-012 — Cloudflare, not a VPS and not GitHub Pages

**Status:** accepted

> **Naming note (Phase 0):** Cloudflare now provisions new projects as **Workers
> with Static Assets** rather than Pages, deployed via
> `npx wrangler versions upload` with a `wrangler.jsonc`. Every argument below
> still applies unchanged — same CDN, same free tier, same zero maintenance,
> `_headers` supported, per-branch preview deployments. Read "Cloudflare Pages"
> below as "Cloudflare's managed static hosting." The site still has no Worker
> script and no server-side code.

**Decision:** deploy to Cloudflare Pages. Do not self-host.

**Reasoning against the VPS**, since it was actively considered: the stated
motivation was faster load times for interactive pages, and that reasoning
doesn't hold.

- A VPS is **one box in one region**. GitHub Pages and Cloudflare Pages serve
  from CDN edges in dozens to hundreds of cities. A recruiter two time zones away
  gets *worse* latency from a VPS, not better.
- **Origin speed is not what makes an interactive page slow.** The bottleneck is
  bundle size, parse time, and client CPU. A bigger box doesn't help a page that
  is slow because of what it ships. Under Astro that payload is near zero anyway,
  so there was nothing to fix.
- It introduces the one failure mode this project cannot afford: **the site being
  down while someone reviews your application.** Managed static hosting
  effectively never goes down. A self-managed box does.
- It converts a zero-maintenance asset into an ongoing obligation — patching, TLS
  renewal, firewall, monitoring — during a job search, which is when your time is
  worth the most.

What a VPS actually offers is server-side secrets and server-side compute — and
per D-008, this project deliberately uses neither. The case for it is now empty.

**Reasoning for Cloudflare Pages over GitHub Pages:** same CDN-delivered static
model, plus real cache-header control (`_headers`), per-PR preview deployments,
and built-in cookieless analytics that add zero client JavaScript. Same setup
effort.

Note that D-008 removed the *strongest* original argument for Cloudflare
(serverless functions for a live demo). The remaining reasons are smaller but
still real, and there's no cost to them — so the choice stands. If Cloudflare
ever becomes annoying, GitHub Pages is now a perfectly adequate fallback rather
than a downgrade.

**Revisit if:** something genuinely needs a long-running process — a persistent
websocket, a background worker, a GPU. Nothing planned does. If it ever happens,
host *that service* separately and keep the site on the CDN.

---

### D-013 — The site is the resume; editorial direction

**Status:** accepted

**Decision:** the homepage carries curated resume content — selected experience
with headline accomplishments, skills, education, featured projects — presented
as an editorial layout. `/resume` becomes the formal, complete, document-shaped
view plus the PDF, reachable in one click but not the site's destination.

Visual register: **editorial / magazine.** Large display type, generous
whitespace, a strong asymmetric grid, restrained warm palette, one self-hosted
display serif, accomplishments set as decks.

**Reasoning:**

- A resume PDF is a commodity. If someone is already on your site, rendering a
  document-shaped page wastes the visit — they could have read the PDF.
- The terminal-inflected dark developer aesthetic is the default of this
  category, so it blends in. Editorial stands out by contrast, ages better, and
  reads as judgment rather than novelty.
- Setting each role's strongest sentence at ~3× body size applies real pressure
  to the writing. A vague accomplishment looks worse set large than it does
  buried in a bullet list, which is a feature.

**Why this doesn't cost performance:** the treatment is typography, layout, and
CSS scroll-driven animation (`animation-timeline`). No JavaScript, no library,
no IntersectionObserver. Total cost: one subsetted variable font, ~40KB. Budgets
moved fonts 30 → 45KB and LCP 1.2 → 1.4s. **The JavaScript budget did not move.**

**Constraints that survive it:**

- The first screen still answers who / what / how to reach, at 375px, with no
  animation in front of it.
- Scroll animations are opt-in via `@supports` + `prefers-reduced-motion`, with
  content visible by default. Authored backwards, they make the site's content
  invisible in unsupported browsers — a silent, catastrophic failure on a site
  whose purpose is being read.
- Scroll-*jacking* remains banned. Scroll-*linked* animation is permitted. The
  first takes control from the reader; the second responds to them.

**Curation costs nothing.** Both views render from `content/resume.ts`; a
`featured` flag selects the homepage subset. There is no second copy of your work
history, so the curated homepage carries no maintenance burden — a concern raised
when choosing this option, and resolved by D-005 already being in place.

**Rejected:**

- *Resume-first homepage (the previous plan).* Terse landing page whose main job
  was routing to `/resume`. Made the site a delivery mechanism for a document
  rather than a thing worth visiting.
- *Full history on the homepage.* Complete, but a long scroll dilutes the
  editorial impact and buries the projects.
- *Technical/terminal aesthetic.* Most common look in the category; blends in.
- *Bold graphic / high contrast.* Most memorable when it lands, reads as trying
  too hard when it doesn't. Higher variance than this situation warrants.

**Revisit if:** the homepage tests poorly with an actual reader — specifically,
if someone can't tell you what you do after fifteen seconds on it.

---

## Open decisions

| ID | Decision | Needed by |
| --- | --- | --- |
| D-007 | Domain name | Before launch |
| D-005 | PDF generation mechanism | Phase 4 |
| — | Which 3 projects are featured | Phase 3 |
| — | Which display serif (Fraunces / Instrument Serif / Newsreader) | Phase 1 |
| — | Which 2–3 roles are `featured` on the homepage | Phase 3 |
