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

**Decision:** Astro 5, static output, with React available for the rare
interactive island.

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

### D-004 — Projects own their updates; the feed is derived

**Status:** accepted, unchanged

An update is an MDX file in a project's `updates/` folder. The project page
renders its own updates as a devlog; `/feed` merges everything across projects
plus standalone posts.

This answers your original question — site-wide blog or per-project? — with
both, from one authoring action, no duplication, no decision at write time. It
also solves blog staleness: a general blog needs a reason to write, a project
devlog always has one.

**Rejected:** site-wide only (project pages go stale); per-project only (no
single "actively building" signal); one changelog file per project (no individual
URLs, no social previews, can't link one update in an application).

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
rebuild. Build against the `*.pages.dev` subdomain and swap the domain in
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

### D-008 — AI demos: recorded runs by default, live only if earned *(revised)*

**Status:** accepted

**What changed:** the original decision said live LLM calls were effectively
impossible, because GitHub Pages cannot hold a secret. Cloudflare Pages Functions
can, so live demos are now possible.

**Decision, nonetheless:** default to clearly-labeled recorded runs, or
in-browser models where they fit. A serverless proxy is permitted for **at most
one** flagship project, and only with rate limiting, a hard spend cap, locked
CORS, and a static fallback.

**Reasoning:** the constraint moved from "impossible" to "possible with
discipline," but the risk calculus didn't change much. A live demo that is down
or drained during someone's review window turns your best project into a broken
page. Recorded runs also *show more* — the reasoning trace, not just the output.

**Rejected:** visitor-supplied API keys (nobody will, and it models bad practice
publicly); any key obfuscation (not a control).

---

### D-009 — No contact form; `mailto:` only

**Status:** accepted, unchanged

A form needs an endpoint that can fail silently — the worst failure mode
available, since you'd never know a message was lost. Cloudflare Functions could
now host one, which makes this a real choice rather than a constraint; the answer
is still no, for the same reason.

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

### D-012 — Cloudflare Pages, not a VPS and not GitHub Pages

**Status:** accepted

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

What a VPS actually offers is server-side secrets and server-side compute. Pages
Functions provide both, without the box.

**Reasoning for Cloudflare Pages over GitHub Pages:** same CDN-delivered static
model, but adds server-side capability when needed (Functions), real cache-header
control (`_headers`), per-PR preview deployments, and built-in cookieless
analytics. Same setup effort, no ceiling.

**Revisit if:** something genuinely needs a long-running process — a persistent
websocket, a background worker, a GPU. Nothing planned does. If it ever happens,
host *that service* separately and keep the site on the CDN.

---

## Open decisions

| ID | Decision | Needed by |
| --- | --- | --- |
| D-007 | Domain name | Before launch |
| D-005 | PDF generation mechanism | Phase 4 |
| — | Which 3 projects are featured | Phase 3 |
| — | Display typeface for headings (or none) | Phase 1 |
