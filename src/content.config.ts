import { defineCollection } from 'astro:content'
// Imported directly: astro:content's `z` re-export is deprecated in Astro 7.
import { z } from 'zod'
import { glob } from 'astro/loaders'
import { TECH_KEYS } from '../content/taxonomy'

/**
 * One collection. See docs/02-content-model.md.
 *
 * There is deliberately no `updates` or `posts` collection — each project is a
 * single standalone file, edited in place, with `updated` carrying the recency
 * signal. D-004 records why the devlog design was reversed.
 */

// An unknown technology fails the build with the offending file named, rather
// than silently rendering a chip for a tag that doesn't exist.
const techKey = z.enum(TECH_KEYS as [string, ...string[]])

const projects = defineCollection({
  // Content lives at the repo root, not in src/ — you should never open src/
  // to add or update a project.
  loader: glob({ pattern: '*.mdx', base: './content/projects' }),

  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        // One line. Used on cards and in social preview images, where
        // components cannot render — so plain text, and short.
        tagline: z.string().max(120),
        status: z.enum(['active', 'shipped', 'archived', 'exploration']),
        started: z.coerce.date(),
        ended: z.coerce.date().optional(),
        // Bump on meaningful change, not typo fixes. Drives ordering and the
        // "Updated <month>" line on cards. Manual rather than git mtime so a
        // formatting pass doesn't claim every project was updated.
        updated: z.coerce.date(),
        role: z.string().optional(),
        stack: z.array(techKey).min(1),
        tags: z.array(z.string()).default([]),
        links: z
          .object({
            repo: z.url().optional(),
            live: z.url().optional(),
            writeup: z.url().optional(),
            video: z.url().optional(),
          })
          .default({}),
        cover: image().optional(),
        featured: z.boolean().default(false),
        weight: z.number().default(0),
        // Plain text, 2–3 sentences. Cards, meta descriptions, OG images.
        summary: z.string(),
        draft: z.boolean().default(false),
      })
      .refine((p) => !p.ended || p.ended >= p.started, {
        message: '`ended` cannot be before `started`',
        path: ['ended'],
      })
      .refine((p) => p.updated >= p.started, {
        message: '`updated` cannot be before `started`',
        path: ['updated'],
      }),
})

export const collections = { projects }
