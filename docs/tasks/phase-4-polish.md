# Phase 4 — Polish

**Goal:** generated PDF, social previews, SEO, enforced accessibility and
performance budgets.

Runs against a site that is already live and already being sent to people.

---

## 4.1 Resume PDF generation

- [ ] `scripts/build-resume-pdf.ts` — headless Chrome (Playwright) printing
      `/resume` with the print stylesheet to `dist/alexander-may-resume.pdf`
- [ ] Refine the print stylesheet: no nav/footer, sane page breaks, readable at
      print sizes, URLs visible for links
- [ ] **Target one page.** Two is acceptable with substantial experience; three
      is not.
- [ ] Filename includes your name — it lands in a folder with 200 other
      `resume.pdf` files
- [ ] Wire into `npm run build` so it cannot drift from the site
- [ ] Verify text is selectable, not rasterized
- [ ] Check it renders correctly in a browser PDF viewer, not just Preview

## 4.2 Social preview images

- [ ] Add `astro-og-canvas` (or a Satori-based generator)
- [ ] One template: name, page title, tagline, consistent branding
- [ ] Generate per project, per update, and per top-level page
- [ ] 1200×630, under ~200KB each
- [ ] Wire `og:image` / `twitter:image` per route in the `SEO` component
- [ ] Test real unfurls: paste URLs into Slack, iMessage, LinkedIn

## 4.3 SEO and metadata

- [ ] Per-page `<title>`, meta description, canonical URL
- [ ] Open Graph + Twitter card tags on every route
- [ ] `@astrojs/sitemap` configured and verified
- [ ] `robots.txt` pointing at the sitemap
- [ ] `schema.org/Person` JSON-LD on `/` and `/resume`
- [ ] `schema.org/BlogPosting` on update pages
- [ ] RSS feed at `/rss.xml` via `@astrojs/rss`
- [ ] Favicon set + `site.webmanifest` + apple-touch-icon
- [ ] Verify with Google Rich Results Test
- [ ] Verify `/stack/:tech` pages have distinct, useful titles and descriptions

## 4.4 Accessibility enforcement

- [ ] `axe-core` in CI against every built route; fail on violations
- [ ] Manual screen reader pass (VoiceOver) over `/`, `/resume`, one project page
- [ ] Verify heading hierarchy everywhere — one `h1`, no skipped levels
- [ ] Test at 200% browser zoom
- [ ] Test with `prefers-reduced-motion` enabled
- [ ] Verify focus is visible on every interactive element in **both** themes
- [ ] Verify the theme toggle is announced correctly

## 4.5 Performance enforcement

- [ ] Lighthouse CI with the budgets from `04-design-system.md`; fail on
      regression
- [ ] **Automated check that surface pages ship no unexpected JavaScript** — a
      test asserting `<script>` count in `dist/index.html`, `resume/`, `feed/`.
      This is the property most likely to erode silently.
- [ ] Confirm all images go through `astro:assets` with modern formats and
      explicit dimensions
- [ ] Verify no webfont blocks render
- [ ] Test on a throttled mid-tier mobile profile
- [ ] Verify CLS ≤ 0.02 on every route
- [ ] Verify cache headers on `/_astro/*` are being applied in production

## 4.6 View Transitions (optional, measure first)

- [ ] Evaluate Astro's `<ClientRouter />` for cross-page transitions
- [ ] **Measure the JS cost** against the budget before committing
- [ ] If adopted: verify it degrades cleanly without JS, and respects
      `prefers-reduced-motion`
- [ ] Consider native CSS view transitions instead — may cover enough for free
- [ ] Drop it if it costs more than it visibly adds

## 4.7 Robustness

- [ ] Custom 404 with useful links, not a dead end
- [ ] Playwright smoke tests: load each route, assert key content, follow the
      resume download
- [ ] `public/_redirects` entries for any slug changed since publishing
- [ ] Verify the whole site works with JavaScript disabled
- [ ] Verify the site renders correctly in Safari, Firefox, and Chrome

## 4.8 Analytics

- [ ] Enable Cloudflare Web Analytics in the Pages dashboard
- [ ] Confirm it adds **no** client-side JavaScript
- [ ] Confirm no cookie banner is required
- [ ] Check which pages actually get traffic after a few weeks of applications

---

**Exit criteria:** PDF generated from live data, correct unfurls everywhere,
Lighthouse 100/100 enforced in CI, zero-JS property protected by an automated
test, smoke tests green.
