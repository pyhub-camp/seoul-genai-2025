# Repository Guidelines

## Project Structure & Module Organization
- Root docs: `PRD.md`, `GEMINI.md`, `notes/`, `GPTs/`, `specs/` (API specs, some in Korean).
- Samples: `samples/api_openlaw/` contains Deno TypeScript CLI (`cli.ts`) and helper (`lib.ts`).
- Environment: example at `.env.example` (do not commit real `.env`).

## Build, Test, and Development Commands
- Run OpenLaw CLI (list/detail):
  - `deno run -A samples/api_openlaw/cli.ts law --query 119`
  - `deno run -A samples/api_openlaw/cli.ts law --id 011349 --verbose`
  - `deno run -A samples/api_openlaw/cli.ts admrul --query 교통 --output tmp/out.json`
- Lint & format (Deno):
  - `deno lint` — lint TypeScript in samples.
  - `deno fmt` — apply formatting.
- Cache deps: `deno cache samples/api_openlaw/*.ts`

## Coding Style & Naming Conventions
- Language: TypeScript (Deno). Indent 2 spaces; keep semicolons.
- Naming: `camelCase` for variables/functions, `PascalCase` for types, `UPPER_SNAKE_CASE` for const env keys.
- Filenames: lowercase with short words (e.g., `cli.ts`, `lib.ts`). Markdown docs use clear titles; specs may use Korean filenames.
- Imports: prefer versioned `deno.land/std` URLs.

## Testing Guidelines
- Framework: Deno built-in test runner.
- Location: co-locate tests next to code as `*_test.ts` (e.g., `lib_test.ts`).
- Run: `deno test -A` (add `--coverage=coverage` if needed).
- Aim for focused unit tests of helpers in `samples/api_openlaw/`.

## Commit & Pull Request Guidelines
- Commits follow Conventional Commits:
  - Examples: `feat(api_openlaw): add admrul detail`, `docs(specs): update 행정규칙목록조회`.
- PRs include:
  - Summary of changes and rationale, linked issue (if any).
  - CLI examples or before/after snippets.
  - Notes on docs/specs touched and any env/config needs.

## Security & Configuration Tips
- Configure `OPEN_LAW_OC` in `.env` (see `.env.example`). Do not use placeholders like `test` in real runs.
- Never commit secrets; `.gitignore` already excludes `.env*`.
- Use `--output` to write large JSON to files to avoid terminal encoding issues.

## Agent-Specific Instructions
- Keep edits minimal and localized; do not reformat unrelated files.
- Prefer Deno tools (`deno fmt/lint/test`) for TypeScript changes.
- When adding samples, mirror existing patterns under `samples/` and update relevant docs in `notes/` or `specs/`.

