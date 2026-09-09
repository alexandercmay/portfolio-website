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

export interface WorkEntry {
  org: string
  title: string
  /**
   * The title as it appears in the homepage's one-line `Where` strip.
   *
   * Only set this where the real title is too long for a strip that has to
   * hold every role plus a link on one row — the E115 title runs to 63
   * characters and pushed the link onto a second line by itself. The full
   * title is still what /resume and the PDF carry.
   */
  shortTitle?: string
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
  /**
   * The role as a timeline, newest first. These are read at a glance, not
   * studied — the prose version of any of them lives in the PDF.
   */
  milestones: Milestone[]
  stack: readonly TechKey[]
}

/**
 * One thing I do, drawn as a row of the homepage's "What I build" section.
 *
 * This replaced the Selected-experience timeline. The reason is worth
 * recording: a timeline answers "where has he been", which a resume already
 * answers better, and it buries the answer to the question a reader actually
 * arrives with — "what can he do". The employment history did not disappear;
 * it moved to the one-line `Where` strip under this section, which is where a
 * reader who wants an org and a date will look for one.
 *
 * A capability with no number in `metric` does not belong here. Three claims
 * with three hard figures beside them is the whole point of the layout; a
 * fourth pillar with a soft one drags the other three down to its level. This
 * is exactly why 'Full-Stack Interface' was cut — the site itself is the only
 * evidence it had, and the site is already the thing being read.
 */
export interface Capability {
  /** Which schematic is drawn at the end of the row. See CapabilityGlyph. */
  glyph: 'ai' | 'backend' | 'security'
  /** Set in small caps above the claim. Two or three words. */
  name: string
  /**
   * THE sentence — set at --text-deck, the same size a role headline used to
   * get. That size is unforgiving: if a claim reads weakly here, the sentence
   * is wrong, not the type size.
   */
  claim: string
  /**
   * The readout in the left column, set at --text-2xl.
   *
   * `value` is a stamp, not a phrase. The column is 9rem and mono is wide, so
   * anything past about eight characters wraps and breaks the row — 'days →
   * min' had to become 'minutes' for exactly this reason. Put the explanation
   * in `unit`, which is small and may wrap freely.
   */
  metric: { value: string; unit: string }
  /**
   * Evidence. One line each, verb-first, a number wherever one exists.
   * Three or four — past that the metric stops anchoring the row.
   */
  proof: string[]
  stack: readonly TechKey[]
}

export interface EducationEntry {
  institution: string
  degree: string
  field: string
  start: Date
  end?: Date
  /**
   * Set apart from `highlights` because it is the only number in the section,
   * and a number buried in a middot-joined run of muted text is a number
   * nobody reads. It gets the same mono readout treatment the capability rows
   * give their metrics. Omit it rather than writing a weak one.
   */
  gpa?: string
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
  capabilities: Capability[]
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
      'I care about software built well — correct, fast, and still both when real traffic is on it. And I care about how AI arrives in the systems people depend on: that it earns the access it is given, and is genuinely useful once it has it. I build the whole stack, end to end.',
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
        'threat-modeling',
        'cvss',
        'vault',
      ],
    },
    {
      org: 'North Carolina State University',
      title: 'Teaching Assistant, E115 — Introduction to Computing Environments',
      shortTitle: 'Teaching Assistant',
      location: 'Raleigh, NC',
      start: new Date('2022-08-01'),
      end: new Date('2024-05-01'),
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

  capabilities: [
    {
      glyph: 'ai',
      name: 'Agentic Infrastructure and Operations',
      claim:
        'Agents that diagnose live infrastructure in plain language, then act to keep it healthy.',
      metric: { value: '<7s', unit: 'to answer' },
      proof: [
        'LLM-routable diagnostic tools over production storage — natural language in, grounded answer out',
        'A2A routing for a LlamaIndex ReAct agent on Bedrock, driving live update workflows',
        'A timestamp protocol that keeps streamed model output machine-parseable across agents',
      ],
      stack: ['llamaindex', 'react-agents', 'llm-tools', 'mcp', 'a2a', 'bedrock'],
    },
    {
      glyph: 'backend',
      name: 'Distributed Systems',
      claim: 'Event-driven architecture built to hold up under real load.',
      metric: { value: '1M+', unit: 'messages a day' },
      proof: [
        'Architected an AMQP pipeline enriching over a million messages a day',
        'Go controllers that recover failed Kubernetes node operations, avoiding 8-hour redeploys',
        'FastAPI and Spring Boot services across a 50+ service platform',
      ],
      stack: ['go', 'python', 'kubernetes', 'amqp', 'fastapi', 'postgres'],
    },
    {
      glyph: 'security',
      name: 'AI-Native Security',
      claim:
        'Agents that can act on real systems, and can’t act outside their authority.',
      metric: { value: 'every', unit: 'agent call authorized' },
      proof: [
        'Added the authorized routes to the agent gateway — no tool call reaches a user system unvetted',
        'Extended the middleware that stops an agent reaching a user system it has no claim to',
        'Structured the agent stack so one agent cannot prompt-inject another',
        'Published an org-wide AI threat-modeling skill — reviews that took days now take minutes',
      ],
      stack: [
        'agent-authz',
        'prompt-injection',
        'threat-modeling',
        'vault',
        'rbac',
        'oauth',
      ],
    },
  ],

  education: [
    {
      institution: 'North Carolina State University',
      degree: 'B.S.',
      field: 'Computer Science',
      start: new Date('2020-08-01'),
      end: new Date('2024-05-01'),
      gpa: '3.98',
      highlights: [],
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
    {
      category: 'Security',
      items: [
        'threat-modeling',
        'agent-authz',
        'prompt-injection',
        'cvss',
        'vault',
        'rbac',
        'oauth',
      ],
    },
  ],
}
