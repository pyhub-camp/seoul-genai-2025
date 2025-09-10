# Repository Guidelines

## IMPORTANT

- 항상 **한국어**로 대답해줘.

## Project Structure & Module Organization
- `notes/`: Working notes and research (Markdown).
- `specs/law.go.kr/`: API specifications and examples for 국가법령정보.
- `GPTs/`: Prompt guides and GPT-facing docs.
- `samples/api_openlaw/`: Prototype scripts and usage docs (Deno CLI prompt).
- `.env.example`: Template for required environment variables; copy to `.env` locally.

## Build, Test, and Development Commands
- Docs: No build step. Edit Markdown and preview locally (e.g., VS Code preview).
- Samples (when implemented): Use Deno.
  - Run: `deno run -A path/to/script.ts --help`
  - Env: Load variables from repo root `.env` (see Security).

## Coding Style & Naming Conventions
- Markdown: One `#` H1 per file; use `##`/`###` for sections; fenced code blocks with language hints (` ```sh`, ` ```ts`).
- Filenames: Prefer lowercase-hyphen English (e.g., `openlaw-guide.md`) or Korean titles as-is; avoid spaces; use `.md`.
- Paths in docs: Root-relative (e.g., `specs/law.go.kr/현행법령본문조회.md`).

## Testing Guidelines
- Docs: Verify links render and examples run as shown. Include concrete command examples and expected outputs.
- Samples: Provide a `README.md` alongside scripts with tested commands and real input examples; support `--verbose`, `--output`, and `--env-path` per `samples/api_openlaw/prompt.md`.
- Coverage: Not enforced; aim for runnable examples that demonstrate core flows.

## Commit & Pull Request Guidelines
- Conventional Commits style observed:
  - Examples: `docs: Add API specs`, `feat(api_openlaw): 국가법령정보 API Deno CLI 구현`.
  - Types: `feat`, `fix`, `docs`, `chore`, `refactor` (+ optional scope).
- PRs must include: concise description, linked issues, what changed and why, screenshots/logs for CLI output when helpful, and check that `.env` is excluded.

## Security & Configuration Tips
- Secrets: Never commit real keys. Use `.env` locally; keep `.env.example` updated.
- Required vars: `OPEN_LAW_OC` (국가법령정보 API key). Scripts should error if missing or placeholder.
- Config loading: Read repo-root `.env` by default; do not overwrite existing files; allow `--env-path` to augment.

## Agent-Specific Instructions
- Write to the appropriate folder (`specs/`, `notes/`, `samples/`).
- Do not modify `.env`; only read it. Always surface errors; do not hide failures.
