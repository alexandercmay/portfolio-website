// @ts-check
import { defineConfig } from 'astro/config'

import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

// The PRODUCTION url, until D-007 (domain) closes. Feeds canonical URLs, the
// sitemap, and social image URLs. Swapping it is this one line plus a rebuild.
//
// Deliberately points at production even on branch deploys: a preview at
// dev-portfolio-website.* should tell crawlers the canonical page is the
// production one, not itself. Override with SITE_URL if you ever need a build
// that self-references.
const SITE = process.env.SITE_URL ?? 'https://portfolio-website.alexcmay11.workers.dev'

// https://astro.build/config
export default defineConfig({
  site: SITE,

  // Every page prerendered at build time. No server-side code anywhere —
  // see docs/06-decisions.md D-008.
  output: 'static',

  // Canonical URLs carry no trailing slash (/resume, not /resume/). This must
  // stay in sync with `assets.html_handling` in wrangler.jsonc — if they
  // disagree, every internal link eats a 307 redirect and canonical tags point
  // at redirect targets.
  trailingSlash: 'never',

  integrations: [mdx(), sitemap(), react()],

  markdown: {
    // Astro 7 defaults to the Sätteri processor, which generates heading ids
    // itself (satteriHeadingIdsPlugin) — so rehype-slug is unnecessary and
    // deep links into long writeups already work.
    //
    // rehype/remark plugins would require installing @astrojs/markdown-remark
    // to opt back into the slower unified processor. Not worth it for a "#"
    // anchor; that is done in the MDX heading components instead.

    // Dual-themed so code is legible in both palettes without shipping a
    // highlighting runtime — Shiki renders at build time.
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
})
