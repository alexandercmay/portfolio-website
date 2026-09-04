// @ts-check
import { defineConfig } from 'astro/config'

import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

// Placeholder until D-007 (domain) closes. Feeds canonical URLs, the sitemap,
// and social image URLs. Swapping it is this one line plus a rebuild.
const SITE = process.env.SITE_URL ?? 'https://portfolio-website.pages.dev'

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

  vite: {
    plugins: [tailwindcss()],
  },
})
