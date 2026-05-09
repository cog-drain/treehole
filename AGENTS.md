# Repository Guidelines

## Project Structure & Module Organization
This repository is a small monorepo:

- `backend/`: Spring Boot 3 application (`controller`, `service`, `mapper`, `entity`, `config`)
- `backend/src/test/java`: backend test entry point and future integration tests
- `frontend/`: Vue 3 + Vite app with `components/`, `views/`, `stores/`, `composables/`, and `api/modules/`
- `database/`: SQL bootstrap files such as `01_init.sql` and `02_test_data.sql`
- `storage/`: runtime uploads and logs; keep only `.gitkeep` tracked
- `docs/`: design notes and setup references

## Build, Test, and Development Commands
- `docker compose up -d --build`: start MariaDB, backend, and frontend with the recommended setup
- `docker compose logs -f backend`: inspect backend startup or runtime failures
- `cd backend && mvn spring-boot:run`: run the API locally on Java 17
- `cd backend && mvn test`: run backend tests
- `cd backend && mvn package`: build the backend JAR
- `cd frontend && pnpm install && pnpm dev`: run the Vite dev server on port `5173`
- `cd frontend && pnpm build`: produce a production frontend build

## Local WSL Notes
Current local WSL workflow uses Docker for `db` + `backend` and Vite for the frontend.

- Running containers: `treehole-db` and `treehole-backend`
- Backend host port: `24191`
- Database host port: `3306`
- Current DB settings in `.env`: `DB_NAME=rj2411123`, `DB_USER=student`
- Frontend dev proxy reads root `.env`, so `frontend/vite.config.js` should target `BACKEND_PORT=24191`

Useful commands:

- `docker ps | rg 'treehole-(db|backend)'`: confirm local container status
- `docker logs --tail=80 treehole-backend`: inspect backend startup
- `docker exec -i treehole-db mariadb -ustudent -pStudent_123 rj2411123`: open a DB shell

Database notes:

- `database/01_init.sql` already includes the former `03/04` schema changes (`user.display_name`, `user.recovery_token`)
- `database/02_test_data.sql` now includes matching hashtag text inside seeded `message.content`, so feed cards render `#tag` links correctly
- Re-importing `02_test_data.sql` is safe for refreshing local demo data; avoid rerunning `01_init.sql` on a non-throwaway DB because it drops tables

## Coding Style & Naming Conventions
Follow `.editorconfig`: 4-space indentation by default, 2 spaces for YAML, LF endings, UTF-8.

Use existing naming patterns:

- Java classes: `PascalCase`; methods and fields: `camelCase`
- Vue components: `PascalCase.vue` (`MessageCard.vue`)
- Composables: `useX.js` (`useWebSocket.js`)
- Pinia stores: concise domain names in `frontend/src/stores`

No dedicated lint or formatter scripts are checked in. Keep imports tidy, preserve existing comment style, and let your IDE format consistently.

## Testing Guidelines
Backend changes should include or update tests under `backend/src/test/java` when behavior changes. CI currently builds the backend against MySQL and builds the frontend bundle.

There is no frontend test suite configured yet, so frontend changes require manual verification with `pnpm dev` or the Docker stack. For API or schema changes, verify against `database/01_init.sql` and, if relevant, re-import `02_test_data.sql`.

## Commit & Pull Request Guidelines
Recent history uses Conventional Commit prefixes such as `fix:` and `docs:`. Keep commits scoped and imperative, for example: `fix: validate audio upload extension`.

PRs should include:

- a short behavior summary
- linked issue or task when available
- notes for `.env`, database, or Docker changes
- screenshots or short recordings for UI updates
- confirmation that `mvn test` and `pnpm build` or `docker compose up --build` were checked
