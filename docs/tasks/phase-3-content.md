# Phase 3 — Real Content

**Goal:** replace fixtures with your actual resume and projects. Reach the point
where the URL can go in an application.

**This phase is writing, not code.** It is the bottleneck and the highest-value
work in the project. The engineering in phases 0–2 is well understood; nobody
gets hired because of your Astro config. Budget real, focused time here, and do
not let toolchain polish become a way to avoid it.

---

## 3.1 Resume data

- [x] Fill in `content/resume.ts`: basics, work, education, skills
- [x] Headline: concrete and specific. "Full-stack engineer building AI systems"
      — not "passionate technologist"
- [x] **Rewrite every highlight to be verb-first with a concrete outcome.**
      The single highest-leverage writing on the site:
      - ❌ "Worked on the backend retrieval system"
      - ✅ "Cut retrieval latency 340ms → 90ms by replacing per-query embedding
        with a cached ANN index"
      Numbers where you have them. Where you don't, name the specific technical
      problem you solved.
- [x] **Write a `headline` for every role** — the one sentence you'd want read if
      they read nothing else about that job
- [x] Mark 2–3 roles `featured` and set `weight` — these appear on the homepage
- [x] **Preview each featured headline at display size before committing to it.**
      It gets set ~3× body size, which is unforgiving: a vague sentence looks
      worse set large than buried in a bullet list. If it doesn't hold up there,
      the sentence is wrong — not the type size.
- [x] Decide whether you have real metrics for the homepage metrics band. **If
      the numbers are weak, omit the section.** Three invented-sounding figures
      do more damage than none.
- [x] Location: city/region only — never a street address
- [x] Use an email you're willing to have scraped
- [x] Populate `content/taxonomy.ts` with your real stack
- [x] Cross-check: every technology on the resume appears in at least one project
- [x] ~~Verify every `/stack/:tech` page has real content~~ — **it didn't.**
      20 of 24 pages listed a single item, so the route was cut. See D-014.

## 3.2 Choose the featured three

- [x] ~~Pick the three projects~~ — **two.** Chalk Talk and the Networked Game
      Engine are the real ones; padding to three would mean inventing a third.
      The Dell experience carries the site.
- [x] Prefer: one with real users or a real deployment; one with genuine
      technical depth; one that shows AI/ML work specifically
- [x] Set `featured: true` and `weight`

## 3.3 Write the three project pages

For each, the overview should answer, in this order:

- [x] **What problem was this solving?** Start here, not with the stack.
- [x] **What did you build?** Concrete, with architecture where it matters.
- [x] **What was genuinely hard?** The most valuable section — where an
      experienced engineer decides whether you actually built it.
- [x] **What were the results?** Users, performance, correctness, what shipped.
- [x] **What would you do differently?** Signals judgment. Most portfolios omit
      it, and it is disproportionately convincing.
- [x] Complete frontmatter: status, dates, role, stack, links, summary
- [ ] At least one diagram or screenshot per project — **still outstanding.**
      Both pages are text-only. This is the biggest remaining content gap.
- [x] Be accurate about `role` — "team of 4, led the backend" is a stronger claim
      than an ambiguous "built"

## 3.4 Set project metadata

- [x] Set an honest `updated` date on every project
- [x] Verify `status` is accurate on each — `active` / `shipped` / `archived` /
      `exploration`
- [x] Include at least one thing that **didn't** work in a project body — these
      read as real and are more memorable than a wall of successes

## 3.5 Remaining projects

- [x] ~~Add secondary projects~~ — none to add. Deliberately shipping two
      strong pages rather than filler.
- [x] Use `status: 'exploration'` / `'archived'` honestly rather than dressing up
      unfinished work or hiding it

## 3.6 About page

- [x] Background, path, how you work, what you want next
- [x] Write it as a person, not a LinkedIn summary — it's read by people deciding
      whether they'd want you on their team
- [ ] Add a photo

## 3.7 Pre-send review

- [ ] Read every page aloud — catches awkward phrasing nothing else does
- [ ] Spellcheck and grammar pass (a typo on a resume site is expensive)
- [ ] Verify every external link resolves
- [ ] Confirm no NDA-covered or confidential detail is present
- [x] Confirm no phone number, street address, or secret anywhere in the repo
- [ ] Have one other person read the landing page and tell you, unprompted, what
      you do — if they get it wrong, the headline is wrong
- [ ] View the site on an actual phone, not just a resized browser window

---

**🎯 Milestone: sendable.** After this phase the URL can go in applications, on
LinkedIn, and in your email signature. Phases 4 and 5 happen on a live site.
