# Information Architecture

## The core shift

**The site conveys the resume. It does not point at one.**

A PDF is a commodity — every applicant has one, and it looks like every other
one. If someone is already on your site, rendering a document-shaped page wastes
the visit. The homepage should communicate everything a resume communicates, as
a designed editorial experience that a document cannot be.

The formal resume still exists, at `/resume`, with the PDF. It is one click away
for the recruiter who specifically wants it. It is not the destination the site
pushes you toward.

**The one thing this does not change:** the first screen must still answer *who
is this, what do they do, how do I reach them.* Editorial treatment is about how
that information is presented, never about delaying it.

## Routes

Nine routes became six. All prerendered to static HTML.

| Route | Page | JS shipped |
| --- | --- | --- |
| `/` | Landing — the resume, told well | **0KB** |
| `/resume` | Formal resume + PDF | **0KB** |
| `/projects` | Project index | **0KB** |
| `/projects/:slug` | Project page | 0KB, unless it contains an island |
| `/about` | About | **0KB** |
| `/404` | Not found | **0KB** |

Removed with the devlog: `/feed` and `/projects/:slug/:update`.
Removed in Phase 3: `/stack/:tech` — see D-014. With two projects and two
roles, 20 of 24 generated pages listed a single item.

Scroll-driven motion on the landing page is **CSS, not JavaScript** — see
`04-design-system.md`. The editorial treatment costs nothing at runtime.

### On search

**Deferred, and possibly never.** With well under a dozen pages, browsing beats
searching, and a search box on a small site reads as scaffolding for content
that isn't there.

If the project count ever justifies it, Pagefind indexes the built HTML as a
post-build step — no content-model change, no schema migration. It's a Phase 4
addition whenever it earns its place, not now.

## Navigation

```
Alexander May          Projects   Resume   About
```

Three items. "Writing" is gone with the feed; search is gone with the search
page. A three-item nav is a feature, not a compromise — there's no ambiguity
about where anything lives.

"Resume" means "the formal document version," not "the main content." The
homepage's own calls to action are **Get in touch** (primary) and **Download
resume, PDF** (secondary), so the recruiter who wants the file gets it
immediately without the site being organized around delivering it.

Footer: email, GitHub, LinkedIn, and a build-time "last updated" date.

## `/` — Landing

The centerpiece. A long-form editorial page carrying curated resume content.

### 1. Hero

- Name in large display type
- Headline: role and focus, concrete — "Full-stack engineer building AI systems"
- Two or three sentences: what you're working on, what you want next
- **Get in touch** (primary), **Download resume** (secondary)

**Constraint:** name, headline, and a contact affordance visible without
scrolling at 375px. This is the scan test and it's non-negotiable. Everything
below can be as expressive as it wants.

No animation gating the hero. Full opacity on first paint.

### 2. Experience

The heart of the page, and where the editorial treatment earns its keep.

Two or three roles flagged `featured` in `content/resume.ts`, each rendered as
an editorial entry rather than a resume bullet list:

- Org, title, dates — structural metadata, small and quiet
- **A headline accomplishment set large**, magazine-deck style. The `headline`
  field. The one sentence you'd want read if they read nothing else.
- Two or three supporting highlights at body size
- Stack chips

A scroll-linked progress rule runs down the section, connecting entries into a
visible career line. Pure CSS, progressively enhanced.

Ends with: **Full work history →** `/resume`.

*(A metrics band — 1M+, <7s, 50+ — was removed. Standing alone with no
surrounding explanation the figures read as out of place: a number with no
context is not evidence. The same numbers do real work inside the experience
highlights, where the sentence around them supplies the meaning.)*

### 3. Projects

Three cards: cover image if present, title, tagline, stack, status, `updated`
date. Must look right with no cover image. Links to `/projects`.

### 4. Skills

Grouped by category, mono, no proficiency bars — nobody believes them, and
"React 90%" invites a question you can't answer.

### 5. Education

Its own section, as a console module: institution, degree, period, highlights,
and a **relevant coursework grid**.

Previously paired with Skills in a combined "Systems & credentials" band. Split
out because education deserves clean, dedicated formatting rather than being a
narrow column beside a wider one.

### 7. Contact

Email, profile links, resume PDF download. The page ends with a clear way to act.

*(The old "Recent activity" section is gone with the feed. Recency now comes
from `updated` dates on the project cards above.)*

## `/resume` — Formal resume

For the recruiter who wants the document, and anyone wanting the complete
history rather than the curated view.

- **Download PDF** prominent at the top — this page's primary purpose
- Complete work history, every role
- Full education and skills
- Dense, document-like typography. Deliberately *not* the editorial treatment;
  this page's job is legibility and completeness.
- Print stylesheet so Cmd-P produces something clean
- `schema.org/Person` JSON-LD

Renders from the same `content/resume.ts` as the homepage. **One source, two
presentations, no drift.**

## `/projects` — Index

- Grid of cards, ordered `featured` → `weight` → `updated`
- **No status filter.** Dropped in Phase 2: with a handful of projects the
  whole list fits on one screen, every card already shows its status, and
  chips that look interactive but aren't are worse than no chips at all.
- Each card shows status and `updated`, so project state and recency are legible
  at a glance
- Status visible on every card, so unfinished work reads as unfinished

## `/projects/:slug` — Project page

A single standalone page per project. Where a hiring manager decides whether you
can build things.

1. **Title, tagline, status, period, role**, and `updated`
2. **Links**: repo, live, writeup, video — as buttons, immediately visible
3. **Stack chips**
4. **Body** (MDX): what the problem was, what you built, what was genuinely
   hard, what the results were, what you'd do differently
5. **Related projects** — shared stack or tags

When you make progress, you edit this page and bump `updated`. There is no
separate update to write, no second place for the information to live, and no
feed that can go stale.

The only route that may ship JavaScript, and only when its MDX contains an
island.

## `/about`

Background, path, how you work, what you want next. One photo. Read by people
who already like your work and are deciding whether they'd want you on their
team — so it should sound like a person, not a LinkedIn summary.

## URL rules

- Lowercase, hyphenated. No dates in project URLs — dates go stale, slugs
  shouldn't.
- **Slugs are permanent once published.** If one must change, add a
  `public/_redirects` entry — a link in an application you sent three weeks ago
  must not 404.
- Every page sets its own `<title>`, meta description, canonical URL, and social
  image.

## Social previews

Generated at build time, 1200×630, one per project and top-level page, from
title and tagline against a consistent template.

Your link gets pasted into Slack channels and ATS notes by people deciding
whether to talk to you. A missing preview wastes the one piece of visual real
estate you get in someone else's inbox.
