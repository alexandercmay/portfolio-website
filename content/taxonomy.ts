/**
 * Canonical technology vocabulary.
 *
 * Everything in a project's `stack` and the resume's `skills` must be a key
 * here. Without this you end up with `Postgres`, `PostgreSQL`, and `postgres`
 * as three separate things, which breaks /stack/:tech and makes the skills
 * section look careless.
 *
 * The collection schema builds a `z.enum` from these keys, so an unknown
 * technology is both a TypeScript error and a build failure naming the file.
 * Renaming one is a one-line change here.
 *
 * Phase 3 replaces this with the real stack.
 */
export const TECH = {
  // Languages
  typescript: { label: 'TypeScript', category: 'Languages' },
  javascript: { label: 'JavaScript', category: 'Languages' },
  python: { label: 'Python', category: 'Languages' },
  java: { label: 'Java', category: 'Languages' },
  c: { label: 'C', category: 'Languages' },
  sql: { label: 'SQL', category: 'Languages' },

  // AI / ML
  pytorch: { label: 'PyTorch', category: 'AI / ML' },
  transformers: { label: 'Transformers', category: 'AI / ML' },
  embeddings: { label: 'Embeddings', category: 'AI / ML' },
  rag: { label: 'RAG', category: 'AI / ML' },

  // Web
  react: { label: 'React', category: 'Web' },
  astro: { label: 'Astro', category: 'Web' },
  node: { label: 'Node.js', category: 'Web' },
  fastapi: { label: 'FastAPI', category: 'Web' },

  // Data & infrastructure
  postgres: { label: 'PostgreSQL', category: 'Data & infrastructure' },
  redis: { label: 'Redis', category: 'Data & infrastructure' },
  docker: { label: 'Docker', category: 'Data & infrastructure' },
  aws: { label: 'AWS', category: 'Data & infrastructure' },
  cloudflare: { label: 'Cloudflare', category: 'Data & infrastructure' },
} as const

export type TechKey = keyof typeof TECH

export const TECH_KEYS = Object.keys(TECH) as TechKey[]

export function techLabel(key: TechKey): string {
  return TECH[key].label
}

/** Category → keys, preserving the declaration order above. */
export function techByCategory(): { category: string; items: TechKey[] }[] {
  const groups = new Map<string, TechKey[]>()
  for (const key of TECH_KEYS) {
    const cat = TECH[key].category
    const list = groups.get(cat) ?? []
    list.push(key)
    groups.set(cat, list)
  }
  return [...groups].map(([category, items]) => ({ category, items }))
}
