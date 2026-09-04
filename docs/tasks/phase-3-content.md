# Phase 3 — Real Content

**Goal:** replace fixtures with your actual resume and projects. Reach the point
where the URL can go in an application.

**This phase is writing, not code.** It is the bottleneck and the highest-value
work in the project. The engineering in phases 0–2 is well understood; nobody
gets hired because of your Astro config. Budget real, focused time here, and do
not let toolchain polish become a way to avoid it.

---

## 3.1 Resume data

- [ ] Fill in `content/resume.ts`: basics, work, education, skills
- [ ] Headline: concrete and specific. "Full-stack engineer building AI systems"
      — not "passionate technologist"
- [ ] **Rewrite every highlight to be verb-first with a concrete outcome.**
      The single highest-leverage writing on the site:
      - ❌ "Worked on the backend retrieval system"
      - ✅ "Cut retrieval latency 340ms → 90ms by replacing per-query embedding
        with a cached ANN index"
      Numbers where you have them. Where you don't, name the specific technical
      problem you solved.
- [ ] Location: city/region only — never a street address
- [ ] Use an email you're willing to have scraped
- [ ] Populate `content/taxonomy.ts` with your real stack
- [ ] Cross-check: every technology on the resume appears in at least one project
- [ ] Verify every `/stack/:tech` page generated from the resume has real content

## 3.2 Choose the featured three

- [ ] Pick the three projects that best evidence **full-stack + AI**
- [ ] Prefer: one with real users or a real deployment; one with genuine
      technical depth; one that shows AI/ML work specifically
- [ ] Set `featured: true` and `weight`

## 3.3 Write the three project pages

For each, the overview should answer, in this order:

- [ ] **What problem was this solving?** Start here, not with the stack.
- [ ] **What did you build?** Concrete, with architecture where it matters.
- [ ] **What was genuinely hard?** The most valuable section — where an
      experienced engineer decides whether you actually built it.
- [ ] **What were the results?** Users, performance, correctness, what shipped.
- [ ] **What would you do differently?** Signals judgment. Most portfolios omit
      it, and it is disproportionately convincing.
- [ ] Complete frontmatter: status, dates, role, stack, links, summary
- [ ] At least one diagram or screenshot per project
- [ ] Be accurate about `role` — "team of 4, led the backend" is a stronger claim
      than an ambiguous "built"

## 3.4 Backfill devlog entries

- [ ] 2–4 historical updates per featured project, honestly dated
- [ ] At least one `milestone` per project
- [ ] At least one entry about something that **didn't** work — these read as
      real and are more memorable than a wall of successes
- [ ] Verify they all render correctly in `/feed`

## 3.5 Remaining projects

- [ ] Add secondary projects with lighter treatment
- [ ] Use `status: 'exploration'` / `'archived'` honestly rather than dressing up
      unfinished work or hiding it

## 3.6 About page

- [ ] Background, path, how you work, what you want next
- [ ] Write it as a person, not a LinkedIn summary — it's read by people deciding
      whether they'd want you on their team
- [ ] Add a photo

## 3.7 Pre-send review

- [ ] Read every page aloud — catches awkward phrasing nothing else does
- [ ] Spellcheck and grammar pass (a typo on a resume site is expensive)
- [ ] Verify every external link resolves
- [ ] Confirm no NDA-covered or confidential detail is present
- [ ] Confirm no phone number, street address, or secret anywhere in the repo
- [ ] Have one other person read the landing page and tell you, unprompted, what
      you do — if they get it wrong, the headline is wrong
- [ ] View the site on an actual phone, not just a resized browser window

---

**🎯 Milestone: sendable.** After this phase the URL can go in applications, on
LinkedIn, and in your email signature. Phases 4 and 5 happen on a live site.
