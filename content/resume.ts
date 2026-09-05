import type { TechKey } from './taxonomy'

/**
 * The resume as structured data — the single source of truth for:
 *   1. the homepage's Selected experience, skills, and education sections
 *   2. the /resume page (complete history)
 *   3. the generated PDF (Phase 4)
 *   4. schema.org/Person JSON-LD
 *
 * See docs/06-decisions.md D-005 for why this is data rather than prose.
 *
 * DELIBERATELY OMITTED: phone number. The repo is public and the built pages
 * are scraped; a number here ends up on spam lists permanently. Email and
 * LinkedIn only. Location is city-level for the same reason.
 */

export interface WorkEntry {
  org: string
  title: string
  location?: string
  start: Date
  end?: Date
  /**
   * THE sentence — set at ~3x body size on the homepage.
   *
   * That size is unforgiving: a vague headline looks worse set large than it
   * does buried in a bullet list. Verb-first, concrete outcome, a number where
   * one exists.
   */
  headline: string
  /** Appears in the homepage "Selected experience" section. */
  featured?: boolean
  weight?: number
  /** Supporting accomplishments. Verb-first. Shown in full on /resume. */
  highlights: string[]
  stack: readonly TechKey[]
}

export interface EducationEntry {
  institution: string
  degree: string
  field: string
  start: Date
  end?: Date
  highlights: string[]
}

export interface Resume {
  basics: {
    name: string
    headline: string
    /** City/region only. Never a street address — this repo is readable. */
    location: string
    email: string
    profiles: { network: string; url: string; username: string }[]
    summary: string
  }
  work: WorkEntry[]
  education: EducationEntry[]
  skills: { category: string; items: readonly TechKey[] }[]
  /**
   * Optional. The homepage metrics band renders nothing when this is absent.
   * Omit rather than pad — three invented-sounding figures do more damage
   * than none.
   */
  metrics?: { value: string; label: string }[]
}

export const resume: Resume = {
  basics: {
    name: 'Alexander May',
    headline: 'Full-stack engineer building AI systems',
    location: 'Cambridge, MA',
    email: 'alexcmay11@gmail.com',
    profiles: [
      {
        network: 'LinkedIn',
        url: 'https://www.linkedin.com/in/alexandercmay/',
        username: 'alexandercmay',
      },
      {
        network: 'GitHub',
        url: 'https://github.com/alexandercmay',
        username: 'alexandercmay',
      },
    ],
    summary:
      'I spent two years at Dell building AI-powered infrastructure tooling — LLM tool layers over production storage systems, event-driven pipelines moving a million messages a day, and the security work that kept it all shippable. I am looking for my next full-stack or AI engineering role.',
  },

  work: [
    {
      org: 'Dell Technologies',
      title: 'Software Engineer',
      location: 'Hopkinton, MA',
      start: new Date('2024-07-01'),
      end: new Date('2026-08-31'),
      headline:
        'Built the LLM tool layer that answers natural-language questions about production storage in under 7 seconds',
      featured: true,
      weight: 10,
      highlights: [
        'Built LLM-routable diagnostic tools computing health and update-plan risk for customer storage assets at query time, answering natural-language questions in under 7 seconds',
        'Extended Agent2Agent (A2A) routing for a LlamaIndex ReAct agent running Claude on AWS Bedrock, so update workflows executed reliably against production storage arrays',
        'Architected an event-driven AMQP pipeline ingesting and enriching 1M+ messages daily, replacing a manual data-loading step between legacy and modern systems',
        'Designed a timestamp tagging protocol and prompt contract keeping timestamps machine-parseable through LLM output, unifying localization across A2A stream events and eliminating client-side timezone bugs',
        'Engineered Golang controllers that detect and gracefully recover from failed Kubernetes node lifecycle operations, preventing a disruptive 8-hour cluster redeploy',
        "Published an AI threat-modeling skill to the organization's shared engineering platform, producing CVSS-scored assessments via a security-scanning MCP server — cutting a multi-day process to minutes",
        'Stood up the first production-fidelity penetration testing environment for an agentic storage platform, replicating 50+ microservices, and authored the runbook used in subsequent cycles',
        'Triaged CVEs, ran STRIDE threat models, and managed quarterly security assessments across two products as Security Champion',
        'Mentored a team of summer interns through a chaos engineering project, guiding their selection of Chaos Mesh for Kubernetes fault injection',
      ],
      stack: [
        'python',
        'go',
        'java',
        'typescript',
        'llamaindex',
        'react-agents',
        'llm-tools',
        'a2a',
        'mcp',
        'bedrock',
        'fastapi',
        'spring-boot',
        'kubernetes',
        'amqp',
        'postgres',
        'event-driven',
        'stride',
        'cvss',
        'vault',
      ],
    },
    {
      org: 'North Carolina State University',
      title: 'Teaching Assistant, E115 — Introduction to Computing Environments',
      location: 'Raleigh, NC',
      start: new Date('2022-08-01'),
      end: new Date('2024-05-01'),
      headline:
        'Taught Unix and Linux fundamentals to 200+ students across four semesters',
      featured: true,
      weight: 5,
      highlights: [
        'Taught shell navigation, file systems, permissions, and remote access to ~50 students per semester across four semesters',
        'Ran office hours and lab sessions debugging student code, graded assignments, and worked with course staff on delivery each term',
      ],
      stack: ['python'],
    },
  ],

  education: [
    {
      institution: 'North Carolina State University',
      degree: 'B.S.',
      field: 'Computer Science',
      start: new Date('2020-08-01'),
      end: new Date('2024-05-01'),
      highlights: ['GPA 3.98'],
    },
  ],

  skills: [
    {
      category: 'Languages',
      items: ['python', 'go', 'java', 'cpp', 'typescript', 'sql'],
    },
    {
      category: 'AI systems',
      items: ['llamaindex', 'react-agents', 'llm-tools', 'mcp', 'a2a', 'bedrock'],
    },
    {
      category: 'Backend & infrastructure',
      items: [
        'fastapi',
        'spring-boot',
        'kubernetes',
        'docker',
        'postgres',
        'amqp',
        'event-driven',
      ],
    },
    { category: 'Frontend', items: ['react'] },
    { category: 'Security', items: ['stride', 'cvss', 'vault', 'rbac', 'oauth'] },
  ],

  metrics: [
    { value: '1M+', label: 'AMQP messages ingested daily by the pipeline I architected' },
    { value: '<7s', label: 'Natural-language query to computed storage answer' },
    {
      value: '50+',
      label: 'Microservices replicated for the first pen-test environment',
    },
  ],
}
