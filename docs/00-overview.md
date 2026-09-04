# Overview — Goals, Audience, Constraints

## What this is

A personal website for Alexander May, used primarily as an artifact sent to
prospective employers during a full-stack / AI job search. It hosts a resume, a
set of projects, and an ongoing stream of project updates.

**Priorities, in order: presentation, performance, ease of updating.**
Interactivity is a distant fourth and is confined to pages a visitor chooses to
go deep on.

## Primary audience, in priority order

1. **Recruiter / hiring coordinator.** Scans for ~20–40 seconds. Wants: what you
   do, where you've worked, what stack, can they get a resume PDF, is there a
   contact link. Often on mobile, often with the page open next to twelve other
   tabs.
2. **Hiring manager / senior engineer.** Arrives after the recruiter passes you
   along, or from a link in an application. Spends 2–5 minutes. Wants: evidence
   you can actually build things. Reads one or two project pages, maybe opens
   GitHub.
3. **Future you.** Updates this frequently. If posting an update takes more than
   five minutes, it stops happening and the site goes stale — which is worse
   than not having a site.

Audience 1 sets the *default experience*. Audience 2 sets the *depth*. Audience
3 sets the *authoring ergonomics*. Every design decision in these docs traces
back to one of those three.

## Success criteria

- A recruiter can find your name, current focus, resume PDF, and contact method
  **without scrolling past the first screen**.
- A hiring manager can find one project that demonstrates real engineering depth
  **within two clicks of the landing page**.
- You can publish a project update **in under five minutes** by adding one file,
  with no code changes and no layout work.
- **The landing page and resume ship zero JavaScript.** Not "a small amount" —
  zero. This is achievable with the chosen stack and is the single largest
  performance lever available.
- LCP under 1.2s on a mid-tier phone over 4G.
- Sharing any URL in Slack, LinkedIn, or iMessage produces a correct title,
  description, and preview image.
- Fully usable with a keyboard and a screen reader.

## Explicit non-goals

- **Not a CMS.** No admin UI, no database, no login. Content is files in git.
- **Not a design showpiece for its own sake.** Interactivity earns its place by
  explaining something. See `05-interactivity.md` for the bar.
- **Not a general-purpose blog.** Writing is tied to projects and work.
- **Not multi-author.**
- **No tracking that requires a cookie banner.**
- **Not a server you maintain.** See "Hosting posture" below.

## Constraints

- **The site output is static.** Pages are HTML files built ahead of time and
  served from a CDN edge. Server-side logic exists only as a small number of
  optional serverless functions, and no page depends on one to render.
- **Public repo.** Everything in it is world-readable. No secrets, no NDA
  material, no personal address or phone number in source or content.
- **One maintainer with a job search in progress.** The build must not be
  fragile. Time spent debugging the toolchain is time not spent applying.

## Hosting posture

Deployment is **Cloudflare Pages** — a global CDN, free, zero maintenance, with
serverless Workers available if a specific feature ever needs a server-side
secret.

A self-managed VPS was considered and rejected. The reasoning is recorded in
`06-decisions.md` (D-012), but the short version is that it would make the site
*slower*, not faster: a single box in one region cannot beat a CDN edge, and
origin speed is not what makes a page slow in the first place. It would also
introduce the one failure mode this project genuinely cannot afford — the site
being down during the twenty minutes someone is reviewing your application.

## The central tension, resolved

Interactivity and scanning speed conflict. The resolution used throughout is
**layering**, and the chosen stack enforces it structurally rather than by
discipline:

- The **surface layer** (landing, resume, project cards, feed) is plain static
  HTML with no client-side JavaScript at all.
- The **depth layer** (specific project pages) hydrates individual interactive
  components, and only on the pages that contain them.

Because the framework ships zero JS by default, a page is only as heavy as what
you deliberately put on it. There is no shared runtime cost to amortize, so an
expensive demo on one project page cannot slow down the landing page.

## Document map

| Doc | Covers |
| --- | --- |
| `00-overview.md` | This file. Goals, audience, constraints. |
| `01-architecture.md` | Stack, build pipeline, routing, hosting, CI. |
| `02-content-model.md` | Content collections: projects, updates, resume. |
| `03-information-architecture.md` | Routes and page-by-page specs. |
| `04-design-system.md` | Typography, color, spacing, motion, accessibility. |
| `05-interactivity.md` | The bar for interactivity, and how AI demos work. |
| `06-decisions.md` | Decision log, including rejected alternatives. |
| `tasks/` | Phased, checkable implementation task lists. |
