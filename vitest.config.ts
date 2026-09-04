/// <reference types="vitest" />
import { getViteConfig } from 'astro/config'

// getViteConfig gives tests the same module resolution the site build uses,
// so `astro:content` and the `@/` alias resolve in test files.
//
// The cast is needed because getViteConfig's return type is Astro's Vite
// config, which does not declare Vitest's `test` key.
export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
  },
} as Parameters<typeof getViteConfig>[0])
