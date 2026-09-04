# Phase 5 — Depth

**Goal:** the small number of interactive explainers that make specific project
pages genuinely better.

Unbounded and ongoing by design. Everything here happens on a live, already
sendable site. Pick one item, ship it, post a devlog update about it.

Reference: `05-interactivity.md` — every item must pass the four-part bar, and
interactivity is permitted **only on individual project pages, below the
overview**.

---

## 5.0 Before starting

- [ ] Confirm the site is live, the resume is real, and three project pages are
      written. If not, go back to Phase 3.
- [ ] Re-read `05-interactivity.md`. The default is zero JavaScript; adding an
      island is an exception you are choosing to make.

## 5.1 Island infrastructure

- [ ] `src/islands/` for React components; keep `src/components/` zero-JS
- [ ] `DemoFrame.astro` wrapper providing title, description, static fallback
      slot, and error boundary — build once, reuse
- [ ] Register islands as MDX components so content references them by name with
      no imports
- [ ] Establish the `client:visible` pattern so demos never initialize until
      scrolled near
- [ ] **Verify adding an island to one project page changes no other page's
      payload** — check the build output, and confirm CI's zero-JS test on
      surface pages still passes

## 5.2 First explanatory interactive

Pick your **strongest** project and build **one**. Depth on one page beats
shallow interactivity on six.

Candidates:

- [ ] Hoverable architecture diagram — hover a service, see its role and edges
- [ ] Before/after performance chart from real profiling data
- [ ] Parameter playground exposing the knobs of something you built
- [ ] Annotated code walkthrough synced to highlighted lines
- [ ] Input/output explorer over sample data through your pipeline

Requirements:

- [ ] Static fallback present in the HTML before hydration
- [ ] Keyboard accessible — hover-only is not sufficient
- [ ] Works on touch
- [ ] Respects `prefers-reduced-motion`
- [ ] Does not regress the Lighthouse budget on that page
- [ ] Degrades to the static fallback if it throws

## 5.3 AI demo

Read `05-interactivity.md` fully first. **Never ship an API key in the bundle.**

### Option A — recorded runs (recommended default)

- [ ] Capture real runs offline: inputs, outputs, latencies, intermediate steps
- [ ] Commit as JSON under the project's folder
- [ ] Scenario picker + a stepper through the trace
- [ ] For agent systems, expose the **reasoning trace and tool calls** — the part
      a live black-box demo can't show, and the interesting part
- [ ] **Label clearly: "Recorded run, <date>."** Non-negotiable.

### Option B — in-browser model

- [ ] Confirm a `transformers.js` / WebLLM model genuinely fits the project
- [ ] Explicit "Load model" button stating model name and download size
- [ ] Progress indicator; cache in the browser
- [ ] WebGPU/WASM capability detection with a clear unsupported message
- [ ] Mobile fallback — many devices can't run it; say so rather than hanging
- [ ] Verify it doesn't affect any other page's bundle

### Option C — Cloudflare Pages Function proxy (at most one project)

- [ ] Function in `functions/` holding the key as an environment variable
- [ ] **Hard monthly spend cap on the provider account — set this first**
- [ ] Per-IP rate limiting
- [ ] CORS locked to your origin
- [ ] Small `max_tokens`, cheap model, fixed system prompt
- [ ] Graceful "demo temporarily unavailable" state
- [ ] Static fallback so the project page is never broken when the Function is
- [ ] Verify the key never appears in the built output: grep `dist/`
- [ ] Monitor spend — assume bots will find it

## 5.4 Ongoing

- [ ] Post a devlog update whenever you ship something — the whole point of the
      content model
- [ ] Add an interactive to a second project only after the first pattern proves
      itself
- [ ] Keep `resume.ts` current; the PDF regenerates automatically
- [ ] Revisit `featured` projects as your strongest work changes
- [ ] Watch analytics for which projects actually get read, and invest there

---

## Sequencing warning

A half-finished demo on a site that isn't deployed is worth nothing during a job
search. A live site with a strong resume and three well-written project pages is
worth a great deal.

Ship first. Deepen in public.
