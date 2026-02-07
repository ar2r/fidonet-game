# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains all app code.
- `src/components/` holds UI windows and desktop widgets; `src/features/` holds feature-level UI (for example, quest journal).
- `src/engine/` contains gameplay runtime logic (store, parser, quest engine, file system simulation).
- `src/domain/` contains domain modules (events, commands, quest services) with clear boundaries from UI.
- `src/content/quests/` stores declarative quest content; `src/assets/` stores ASCII/text resources.
- Tests are colocated as `*.test.js` / `*.test.jsx` beside source files.
- `docs/` contains manual and design/roadmap notes. `dist/` is build output (do not hand-edit).

## Build, Test, and Development Commands
- `npm run dev` — starts Vite dev server on `http://localhost:5175`.
- `npm run build` — creates production bundle in `dist/`.
- `npm run preview` — serves the built bundle locally.
- `npm run lint` — runs ESLint flat config across the repo.
- `npm run test` — runs Vitest in jsdom.
- `npx vitest run src/engine/commandParser.test.js` — run one test file.

## Coding Style & Naming Conventions
- Language: JavaScript + JSX (ES modules), React 19, no TypeScript.
- Follow existing style: 4-space indentation in app/test code, semicolons, single quotes.
- Components and feature files use `PascalCase` (for example, `TerminalWindow.jsx`); utilities and functions use `camelCase`; constants use `UPPER_SNAKE_CASE`.
- Keep domain logic in `src/domain` or `src/engine`, not inside UI components.
- Run `npm run lint` before opening a PR.

## Testing Guidelines
- Framework: Vitest + Testing Library (`@testing-library/react`) with `jsdom`.
- Name tests `*.test.js` or `*.test.jsx` and colocate with the module under test.
- Cover parser/engine/domain behavior changes with unit tests; add UI tests for visible interaction changes.
- Before PR: run `npm run test` and `npm run lint`.

## Commit & Pull Request Guidelines
- Prefer short imperative commit subjects with a prefix seen in history: `Feat:`, `Fix:`, `Refactor:` (example: `Feat: add command registry handler`).
- Keep commits focused by concern (UI, engine, domain, docs).
- PRs should include: summary, why the change is needed, test evidence (commands run), and screenshots/GIFs for UI updates.
- Link related issues/tasks and call out any follow-up work explicitly.

## Content & Localization
- In-game narrative/UI text is Russian-first; keep tone and terminology consistent with existing content.
- Update `docs/manual/` or relevant roadmap docs when gameplay behavior changes.
