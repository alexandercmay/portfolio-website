# Implementation Tasks

Phased task lists derived from the specs in `../`. Each phase ends in a state
where the site still works.

**Stack:** Astro 7 (static output) + React islands where earned, deployed to
Cloudflare Pages. See `../06-decisions.md` D-001 and D-012 for why.

## Sequencing principle

You are job searching now. The plan front-loads **getting a real, sendable URL
live**, then deepens it. A live site with a strong resume and three good project
pages beats a locally-perfect site that isn't deployed.

The deploy pipeline is set up in **Phase 0**, against a hello-world page, before
any real work — deployment problems are far cheaper to debug against a blank
page than against a finished site.

## Phases

| Phase | Outcome | Est. |
| --- | --- | --- |
| [0 — Foundation](phase-0-foundation.md) | Repo, Astro scaffold, hello world **live on the internet** | ~2–3 hours |
| [1 — Design & content](phase-1-pipeline.md) | Tokens, editorial primitives, content collection | ~1 day |
| [2 — Pages](phase-2-pages.md) | All six routes rendering real data | ~1 day |
| [3 — Real content](phase-3-content.md) | Actual resume + 3 project pages written | ~1–2 days (writing) |
| **🎯 Milestone: sendable** | **The URL can go in an application** | |
| [4 — Polish](phase-4-polish.md) | PDF, social images, SEO, a11y, perf enforcement | ~1 day |
| [5 — Depth](phase-5-depth.md) | Interactive explainers, AI demos | ongoing |

Estimates are for relative sizing, not commitments. Phases 0–2 are smaller than
in the original React plan because Astro provides content collections, image
optimization, sitemap, and RSS natively — roughly a day of hand-rolled pipeline
work that no longer exists.

## Rules

1. **Phase 3 is the bottleneck, and it's writing, not code.** The engineering in
   phases 0–2 is well understood; the hard part is articulating what you built
   and why it mattered. Nobody hires you for your Astro config. Do not let
   toolchain work become a way to avoid writing.
2. **Ship at the milestone.** Phases 4 and 5 happen on a site that is already
   live and already being sent to people.
3. **Default to zero JavaScript.** If a page starts shipping JS you didn't
   intend, something was accidentally made an island. That's a bug.
4. **Phase 5 is unbounded by design.** Pick one project, build one explainer,
   post an update about it. Repeat when you have a reason to.
5. **The domain (D-007) is not decided and does not block anything.** Build
   against the `*.pages.dev` URL; attach a real domain any time before you start
   sending the link. Swapping it is one line in `astro.config.mjs`.
6. **Version control is deferred** — you're setting it up yourself. It's only
   required at Phase 0.4, where Cloudflare Pages needs a repo to connect to.
