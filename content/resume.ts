import type { TechKey } from './taxonomy'

/**
 * The resume as structured data — the single source of truth for:
 *   1. the homepage's Selected experience, skills, and education sections
 *   2. the /resume page (complete history)
 *   3. the generated PDF (Phase 4)
 *   4. schema.org/Person JSON-LD
 *
 * A hand-maintained PDF beside a hand-maintained web page drifts within two
 * edits, and then a recruiter and an interviewer are reading different
 * versions. Generating everything from here removes that failure mode entirely.
 * See docs/06-decisions.md D-005.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PLACEHOLDER DATA. Phase 3 replaces all of it. See
 * docs/tasks/phase-3-content.md — that phase is writing, not code, and it is
 * the highest-leverage work in this project.
 * ─────────────────────────────────────────────────────────────────────────
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
   * does buried in a bullet list, because the design gives it nowhere to hide.
   * Verb-first, concrete outcome, a number where one exists.
   */
  headline: string
  /** Appears in the homepage "Selected experience" section. Two or three. */
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
   * Omit it rather than padding — three invented-sounding figures do more
   * damage than none.
   */
  metrics?: { value: string; label: string }[]
}

export const resume: Resume = {
  basics: {
    name: 'Alexander May',
    headline: 'Full-stack engineer building AI systems',
    location: 'Raleigh, NC',
    email: 'alexcmay11@gmail.com',
    profiles: [
      {
        network: 'GitHub',
        url: 'https://github.com/alexandercmay',
        username: 'alexandercmay',
      },
    ],
    summary:
      'Placeholder summary. Phase 3 replaces this with two or three sentences on what you build, what you are working on now, and what you want next.',
  },

  work: [
    {
      org: 'Placeholder Company',
      title: 'Software Engineer',
      start: new Date('2024-06-01'),
      headline: 'Cut p99 retrieval latency from 340ms to 90ms across 12M documents',
      featured: true,
      weight: 10,
      highlights: [
        'Replaced per-query embedding with a cached approximate-nearest-neighbour index',
        'Added request-level tracing that surfaced a connection-pool exhaustion bug',
      ],
      stack: ['typescript', 'python', 'postgres', 'redis'],
    },
    {
      org: 'Placeholder Lab',
      title: 'Research Assistant',
      start: new Date('2023-01-01'),
      end: new Date('2024-05-01'),
      headline: 'Built the evaluation harness that made three models comparable',
      featured: true,
      weight: 5,
      highlights: [
        'Standardised preprocessing so results across teams were finally comparable',
      ],
      stack: ['python', 'pytorch', 'transformers'],
    },
  ],

  education: [
    {
      institution: 'North Carolina State University',
      degree: 'B.S.',
      field: 'Computer Science',
      start: new Date('2021-08-01'),
      end: new Date('2025-05-01'),
      highlights: [],
    },
  ],

  skills: [
    { category: 'Languages', items: ['typescript', 'python', 'java', 'sql'] },
    { category: 'AI / ML', items: ['pytorch', 'transformers', 'embeddings', 'rag'] },
    { category: 'Web', items: ['react', 'astro', 'node', 'fastapi'] },
    {
      category: 'Data & infrastructure',
      items: ['postgres', 'redis', 'docker', 'aws'],
    },
  ],

  // Deliberately absent until there are real numbers. See the interface note.
  // metrics: [{ value: '340ms → 90ms', label: 'p99 retrieval latency' }],
}
