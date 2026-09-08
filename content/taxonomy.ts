/**
 * Canonical technology vocabulary.
 *
 * Everything in a project's `stack` and the resume's `skills` must be a key
 * here. Without this you get `Postgres`, `PostgreSQL`, and `postgres` as three
 * separate things, which breaks /stack/:tech and makes the skills section look
 * careless.
 *
 * The collection schema builds a `z.enum` from these keys, so an unknown
 * technology is both a TypeScript error and a build failure naming the file.
 *
 * Keep this list to things worth a chip and a page. Every technology listed on
 * the resume belongs here; incidental libraries generally do not.
 */
export const TECH = {
  // Languages
  python: { label: 'Python', category: 'Languages' },
  go: { label: 'Go', category: 'Languages' },
  java: { label: 'Java', category: 'Languages' },
  cpp: { label: 'C++', category: 'Languages' },
  typescript: { label: 'TypeScript', category: 'Languages' },
  sql: { label: 'SQL', category: 'Languages' },

  // AI systems
  'llm-tools': { label: 'LLM Tool Design', category: 'AI systems' },
  'react-agents': { label: 'ReAct Agents', category: 'AI systems' },
  llamaindex: { label: 'LlamaIndex', category: 'AI systems' },
  mcp: { label: 'MCP', category: 'AI systems' },
  a2a: { label: 'A2A Protocol', category: 'AI systems' },
  bedrock: { label: 'AWS Bedrock', category: 'AI systems' },
  'stable-diffusion': { label: 'Stable Diffusion', category: 'AI systems' },

  // Backend & infrastructure
  fastapi: { label: 'FastAPI', category: 'Backend & infrastructure' },
  'spring-boot': { label: 'Spring Boot', category: 'Backend & infrastructure' },
  kubernetes: { label: 'Kubernetes', category: 'Backend & infrastructure' },
  docker: { label: 'Docker', category: 'Backend & infrastructure' },
  postgres: { label: 'PostgreSQL', category: 'Backend & infrastructure' },
  amqp: { label: 'RabbitMQ / AMQP', category: 'Backend & infrastructure' },
  'event-driven': {
    label: 'Event-Driven Microservices',
    category: 'Backend & infrastructure',
  },
  zeromq: { label: 'ZeroMQ', category: 'Backend & infrastructure' },

  // Frontend
  react: { label: 'React', category: 'Frontend' },
  astro: { label: 'Astro', category: 'Frontend' },
  html: { label: 'Semantic HTML', category: 'Frontend' },
  css: { label: 'Modern CSS', category: 'Frontend' },
  javascript: { label: 'JavaScript', category: 'Frontend' },
  a11y: { label: 'WCAG / Accessibility', category: 'Frontend' },

  // Security
  stride: { label: 'STRIDE Threat Modeling', category: 'Security' },
  cvss: { label: 'CVSS v3.1', category: 'Security' },
  vault: { label: 'HashiCorp Vault', category: 'Security' },
  rbac: { label: 'RBAC', category: 'Security' },
  oauth: { label: 'OAuth2 / OIDC', category: 'Security' },
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
