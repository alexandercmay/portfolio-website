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

/**
 * One timeline point: what happened, and when.
 *
 * `when` is a stamp, not a sentence — '2025', 'H1 2025', '2024—26'. It is set
 * in mono at the left of the row and every stamp in a role shares a column, so
 * anything longer than about eight characters breaks the alignment that makes
 * the list scannable.
 */
export interface Milestone {
  when: string
  /**
   * One line. Verb-first, ONE clause. If it needs a comma-and to hold
   * together it is two milestones, or it belongs in the PDF and not here.
   */
  text: string
}

/** Big-bang chronology, oldest epoch first. See EpochIcon.astro. */
export type EpochIcon =
  | 'singularity'
  | 'inflation'
  | 'nucleosynthesis'
  | 'first-light'
  | 'galaxy'
  | 'orbit'

export interface WorkEntry {
  org: string
  title: string
  location?: string
  start: Date
  end?: Date
  /** The node drawn on the timeline rail for this role. */
  icon: EpochIcon
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
  /**
   * The role as a timeline, newest first. These are read at a glance, not
   * studied — the prose version of any of them lives in the PDF.
   */
  milestones: Milestone[]
  stack: readonly TechKey[]
}

export interface EducationEntry {
  institution: string
  degree: string
  field: string
  start: Date
  end?: Date
  highlights: string[]
  /** Relevant coursework, shown as a grid on the Education section. */
  coursework?: string[]
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
}

export const resume: Resume = {
  basics: {
    name: 'Alexander May',
    headline: 'Full-stack engineer building distributed AI systems',
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
      'I build full-stack systems end to end, with a bias toward the ones that stay fast and correct under real load. Lately that means distributed AI — agent orchestration, tool layers, and the event-driven backbones underneath — fitting intelligence into the systems that already exist so it makes them measurably better, not just adjacent.',
  },

  work: [
    {
      org: 'Dell Technologies',
      title: 'Software Engineer',
      location: 'Hopkinton, MA',
      start: new Date('2024-07-01'),
      end: new Date('2026-08-31'),
      icon: 'orbit',
      headline:
        'Built the LLM tool layer that answers natural-language questions about production storage in under 7 seconds',
      featured: true,
      weight: 10,
      // PLACEHOLDER STAMPS — the `when` values below are inferred from the
      // order the work was listed in, not from a record. Correct them; a
      // timeline whose dates are wrong is worse than a bullet list with none.
      milestones: [
        {
          when: '2026',
          text: 'Published an org-wide AI threat-modeling skill, cutting CVSS assessments from days to minutes',
        },
        {
          when: '2025',
          text: 'Built LLM-routable diagnostic tools answering natural-language storage questions in under 7s',
        },
        {
          when: '2025',
          text: 'Extended A2A routing for a LlamaIndex ReAct agent on Bedrock, driving live update workflows',
        },
        {
          when: '2025',
          text: 'Designed a timestamp protocol keeping LLM output machine-parseable across A2A streams',
        },
        {
          when: '2025',
          text: 'Stood up the first production-fidelity pentest environment for the platform — 50+ services',
        },
        {
          when: '2025',
          text: 'Mentored the intern team through a Chaos Mesh fault-injection project',
        },
        {
          when: '2024',
          text: 'Architected an event-driven AMQP pipeline enriching 1M+ messages a day',
        },
        {
          when: '2024',
          text: 'Wrote Golang controllers that recover failed K8s node operations, avoiding 8-hour redeploys',
        },
        {
          when: '2024—26',
          text: 'Security Champion: CVE triage, STRIDE models, and quarterly assessments on two products',
        },
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
      icon: 'first-light',
      headline:
        'Taught Unix and Linux fundamentals to 200+ students across four semesters',
      featured: true,
      weight: 5,
      milestones: [
        {
          when: '2022—24',
          text: 'Taught shells, filesystems, permissions, and remote access to ~50 students a semester',
        },
        {
          when: '2022—24',
          text: 'Ran labs and office hours debugging student code, and graded across four terms',
        },
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
      // PLACEHOLDER COURSEWORK — replace with what you actually took. These
      // are plausible NC State CSC titles, not a transcript.
      coursework: [
        'Game Engine Foundations',
        'Artificial Intelligence',
        'Operating Systems',
        'Database Management Systems',
        'Computer Networks',
        'Software Engineering',
        'Automata & Formal Languages',
        'Data Structures & Algorithms',
      ],
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
    {
      category: 'Frontend',
      items: ['react', 'astro', 'javascript', 'html', 'css', 'a11y'],
    },
    { category: 'Security', items: ['stride', 'cvss', 'vault', 'rbac', 'oauth'] },
  ],
}
