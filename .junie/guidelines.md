# Wanki Development Guidelines

- **Do not change files in the `coverage/` folder** (if it exists).

## Tech Stack
- Node.js with TypeScript
- Vue 3 + Vite
- Tailwind CSS for styling
- Vitest for unit tests
- ESLint, Prettier and Stylelint for code style

## Project Layout
- `src/` – application code
  - `components/` – reusable UI components
  - `pages/` – route views
  - `plugins/` – Vue plugins and utilities
  - `router/` – Vue Router setup
  - `store/` – Vuex store modules
  - `assets/` – static assets and styles
- `public/` – static files served by Vite
- `server/` – optional Node.js sync server
- `tests/` – Vitest unit tests

### Mentionable Folders
- `src/plugins/wankidb/` – Dexie database models and helpers
- `src/plugins/classes/` – scheduler data structures
- `src/plugins/workers/` – Web Workers for heavy tasks
- `public/` – PWA assets and service worker
- `server/` – tiny sync server for experimentation

### Mentionable Files
- `src/plugins/wankidb/db.ts` – Dexie database setup
- `src/plugins/wankidb/Card.ts` (and similar) – model classes with `save()`
  method. `hook('reading')` upgrades loaded objects to these classes so that
  changes can be persisted with `save()`.
- `vite.config.ts` – Vite configuration
- `public/service-worker.js` – enables offline caching

## Useful Scripts
Run with `npm run <script>`:
- `dev` – start the dev server
- `build` – production build
- `serve` – preview the build
- `test` – run tests
- `coverage` – run tests with coverage
- `lint` – run ESLint and Stylelint
- `format` – format code with Prettier
- `typecheck` – run TypeScript type checks

## Best Practices
- Install dependencies with `npm install` after cloning
- Keep code modular and use TypeScript
- Run `npm run lint` and `npm run test` before committing
- Avoid committing generated or build files such as coverage output
