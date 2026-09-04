# Interactivity

Revised after you concluded that a less interactive site is probably better for
recruiters. That is correct, and it simplifies things considerably.

**The default is zero JavaScript.** Interactivity is an exception that must be
argued for, on a specific page, for a specific reason.

## The bar

Every interactive element must pass all four:

1. **It answers a question the visitor already has.** Not one you invented so the
   feature would have a purpose.
2. **It degrades.** Without JavaScript, the underlying content is still readable.
3. **It costs nothing to people who ignore it.** It lives on one deep page and
   is invisible in every other page's payload.
4. **A static alternative would be genuinely worse.** If a screenshot and a
   paragraph convey the same thing, ship the screenshot.

Rule 4 kills most portfolio interactivity, and it should. What survives is doing
real work.

The architecture enforces rule 3 structurally: components in `src/islands/` ship
JS, components in `src/components/` don't. The cost is visible in the file tree.

## Things that turned out not to need JavaScript

Worth noting explicitly, because the earlier plan budgeted engineering effort for
each of these and the framework change eliminated them:

| Feature | Old plan | Now |
| --- | --- | --- |
| Filter projects by technology | Client-side filter, URL state sync, ARIA live region | Prerendered `/stack/:tech` page |
| Filter feed by project | Client-side filter | Prerendered filter links |
| Devlog show/hide | React state | `<details>` element |
| Search | MiniSearch + hand-built index + modal | Pagefind over built HTML |
| Card hover states | — | CSS |
| Theme toggle | React island | ~15 lines of inline script |

Every one is now faster, works without JS, is independently linkable, and is less
code to maintain.

## Explicitly excluded

Decided once, so it isn't relitigated during a late-night build session:

- Landing-page hero animations, particle fields, animated gradient meshes
- Typewriter effects on your job title
- Custom cursors, cursor-follow effects
- Scroll-jacking, parallax, horizontal scroll sections
- Scroll-triggered fade-in on primary content
- Terminal/CLI emulator as site navigation
- Preloader screens
- Sound
- 3D backgrounds

Shared failure mode: they put spectacle between a busy person and the information
they came for, and they signal "I had time to spend on this" rather than "I can
build systems."

## Where interactivity is permitted

**Only on individual project pages, below the overview.** Never on the landing
page, resume, feed, or project index.

The premise you identified is right: someone reaching an interactive explainer
has already decided to go deep. They will tolerate a moment of loading. Someone
on the landing page has not decided anything yet.

### Tier 1 — explanatory interactives

One per project, at most, and only for your strongest projects. Candidates that
would pass the bar:

- **Hoverable architecture diagram** — hover a service, see its role and its
  edges. Better than a static PNG when the system has more information than fits
  legibly on one image.
- **Before/after performance visualization** — real numbers from real profiling,
  as a chart rather than a paragraph of figures.
- **Parameter playground** — for an algorithm you built, let the reader move a
  slider and watch behavior change. Demonstrates you understand the system well
  enough to expose its knobs.
- **Annotated code walkthrough** — step through the interesting function with
  explanation synced to highlighted lines.
- **Input/output explorer** — pick a sample input, see what your pipeline
  produces.

Requirements:

- `client:visible` — nothing initializes until scrolled near
- A static fallback rendered in the HTML, replaced on hydration
- Keyboard accessible (hover-only is not sufficient)
- Works on touch
- Respects `prefers-reduced-motion`
- Wrapped in an error boundary that degrades to the static fallback

**Build one, for your best project, and stop.** Three excellent project pages
beat eight thin ones. A hiring manager reads one or two.

### Tier 2 — AI demos

The hosting change materially improved the options here. Cloudflare Pages
Functions can hold an API key server-side, so a live demo is now genuinely
possible — but that does not make it the right default.

#### Option A — recorded real runs (recommended default)

Capture actual runs offline — real inputs, outputs, latencies, intermediate steps
— and commit them as JSON. The demo replays them: the visitor picks a scenario
and steps through what actually happened, including agent traces, tool calls, and
retrieval results.

- **Pros**: zero cost, zero latency, never breaks, never rate-limited, always
  shows the system at its best, and exposes *intermediate state* that a live
  black-box demo hides.
- **Cons**: not live. **Label it** — "Recorded run, 2026-08-14." Presenting a
  replay as live is dishonest and disqualifying if noticed.
- Honestly labeled, this is not the weaker demo. For agent systems it is usually
  the *better* one, because the reasoning trace is the interesting part.

#### Option B — in-browser model

Ship a real model client-side via `transformers.js` (ONNX Runtime Web) or WebLLM
(WebGPU). Works fine on static hosting: no key, no backend, no running cost.

Realistic for: embeddings and semantic search, text classification, NER, small
summarization, image classification, object detection, whisper-tiny. Small
quantized LLMs run via WebLLM on WebGPU-capable desktop browsers.

- **Pros**: no key, no cost, no rate limits, works indefinitely, and it is
  genuinely impressive to an engineer who understands what's happening.
- **Cons**: multi-megabyte download — **must** be behind an explicit "Load model"
  button stating the model name and size, never automatic. WebGPU support is
  uneven on mobile.

For AI-targeted roles, "I shipped a real model to the browser" is a stronger
story than "I proxied an API call."

#### Option C — Cloudflare Pages Function proxy

A Function in `functions/` holds the key in an environment variable and proxies
requests. The key never reaches the browser.

Mandatory if you do this:

- Per-IP rate limiting (Cloudflare Rate Limiting rules, or KV counters)
- **A hard monthly spend cap on the provider account** — set this first
- CORS locked to your origin
- Small `max_tokens`, a cheap model, a fixed system prompt
- A graceful "demo temporarily unavailable" state, because bots will find it
- A static fallback so the project page is never broken when the Function is

Use for **at most one** flagship project, and only if live interaction is the
actual point.

#### Option D — visitor-supplied API key

Rejected. Asking a recruiter to paste an API key into your website is a bad
experience and a bad practice to model publicly. Nobody will do it.

#### Recommendation

Default to **A**. Use **B** where a browser-runnable model genuinely fits the
project. Reach for **C** only for one flagship demo, if any.

Never let a live demo be the *only* evidence of an AI project. A demo that's down
during someone's review window turns your best project into a broken page. The
writeup must stand alone.

## Implementation notes

- Islands live in `src/islands/`, registered as MDX components so content
  references them by name with no imports
- `DemoFrame` (an `.astro` wrapper) provides title, description, static fallback,
  and error boundary — established once, reused
- Heavy dependencies are dynamically imported inside the island, never at module
  scope
- Every island uses `client:visible`
- Adding an island must not change any other page's payload — verify in the
  build output, and CI enforces the budget

## Sequencing

Do not build any of this until the site is deployed, has a real resume, and has
three well-written project pages. A half-finished WebGPU demo on an undeployed
site is worth nothing during a job search.

Ship the useful version first, then deepen it in public — which is exactly what
the devlog structure is designed to let you do.
