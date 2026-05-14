# Repository Guidelines

## Project Structure & Module Organization

This is a full-stack Treehole application. `frontend/` contains the Vue 3 + Vite client. Frontend code lives in `frontend/src/`, with API modules in `src/api/`, Pinia stores in `src/stores/`, shared types in `src/types/`, utilities in `src/utils/`, and baseline tests beside utility files. UI is split into `src/components/home/` for page composition and `src/components/business/` for message, comment, drift bottle, graph, confession, and store features. `backend/` contains the Spring Boot service under `backend/src/main/java/com/treehole/`, organized by controller, service, mapper, entity, config, websocket, and common packages. `database/` stores SQL scripts, and `compose.yml` orchestrates MariaDB, Redis, backend, and frontend.

## Build, Test, and Development Commands

Use Docker for integrated local runs:

```bash
docker compose up -d --build
docker compose logs -f backend
```

For frontend-only work:

```bash
cd frontend
pnpm install
pnpm dev
pnpm build
pnpm type-check
pnpm test
```

For backend-only work:

```bash
cd backend
mvn spring-boot:run
mvn test
```

## Coding Style & Naming Conventions

Backend targets Java 17 and follows Spring naming: `*Controller`, `*Service`, `*ServiceImpl`, `*Mapper`, singular entity names, and DTOs ending in `DTO`. Keep controllers thin and business logic in services. Frontend uses Vue SFCs with PascalCase component names, camelCase composables, and resource-based API modules. Prefer existing Element Plus, Pinia, Tailwind, Lucide, composables, and `src/types/` before adding new dependencies or patterns.

## Testing Guidelines

Backend tests use Spring Boot Test and Maven Surefire; name them `*Tests.java`. Frontend tests use Vitest; place small logic tests near utilities or constants as `*.test.ts`. Run `pnpm test`, `pnpm type-check`, and `pnpm build` before handing off frontend changes. Add tests for cache behavior, rate limits, API contracts, offline queue logic, parsing utilities, or changed composables.

## Commit & Pull Request Guidelines

Git history uses Conventional Commit-style messages, such as `feat(security): add dual-layer rate limiting`, `refactor(frontend): split home dialogs`, and `test(frontend): add baseline utility tests`. Pull requests should include a short summary, testing performed, linked task, configuration changes, and screenshots or recordings for visible UI changes.

## Security & Configuration Tips

Copy `.env.example` to `.env` locally. Do not commit real API keys, database passwords, certificates, runtime logs, uploaded files, or generated build/cache artifacts. Production settings belong in environment variables or templates, not hardcoded values.
