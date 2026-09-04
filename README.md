# portfolio-website

Personal site for Alexander May — resume, projects, and background.

Built with [Astro](https://astro.build) as a fully static site. **Every page
ships zero client-side JavaScript.** That property is enforced by a test, not
by discipline.

## Requirements

Node 22 (see `.nvmrc`).

```bash
nvm use
npm install
```

## Commands

| Command             | Does                                                                        |
| ------------------- | --------------------------------------------------------------------------- |
| `npm run dev`       | Dev server at `localhost:4321`                                              |
| `npm run build`     | Build static output to `dist/`                                              |
| `npm run preview`   | Serve the built site locally                                                |
| `npm run typecheck` | `astro check`                                                               |
| `npm run lint`      | ESLint                                                                      |
| `npm run format`    | Prettier, writes                                                            |
| `npm test`          | Test suite — **run `npm run build` first**, the zero-JS guard reads `dist/` |

## Adding content

Content lives in `content/`, never in `src/`. If a routine content change needs
a code change, the content model is wrong.

```bash
npm run new:project "Project title"   # arrives in Phase 1
```

To update a project: edit its `.mdx` file and bump the `updated` date in
frontmatter. There are no separate update or blog posts — see
`docs/06-decisions.md` D-004.

The resume is structured data in `content/resume.ts`, and is the single source
for the homepage, the `/resume` page, the generated PDF, and JSON-LD.

## Project layout

```
content/            authored content — projects and resume
docs/               planning documents; read 00-overview.md first
src/
  components/       .astro, zero JS
  islands/          .tsx — ONLY interactive components; these ship JavaScript
  layouts/
  pages/            file-based routes
  styles/
tests/
```

The `components/` vs `islands/` split is deliberate: anything in `islands/`
costs the visitor JavaScript, so the cost is visible in the file tree.

## The zero-JS rule

`tests/no-javascript.test.ts` asserts that no built page contains a `<script>`
tag. If it fails, something was accidentally made an island. That's a bug — see
`docs/04-design-system.md`, Performance budget.

## Docs

Planning documents live in `docs/`. Start with `00-overview.md`; decisions and
their rejected alternatives are in `06-decisions.md`.

## License

Code is open. Content — resume prose, project writeups, images — is not
licensed for reuse.
