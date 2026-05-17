# Treehole

[中文](README.md) | [English](README.en.md)

Treehole is a full-stack anonymous expression and interaction platform. It includes anonymous posts, threaded comments, confession posts, drift bottles, real-time notifications, tag subscriptions, and a mind graph. The stack includes a Vue 3 frontend, Spring Boot backend, MariaDB/MySQL, Redis, WebSocket, Docker Compose, and Windows deployment artifacts.

## Features

- Anonymous posts with text, images, voice messages, moods, tone modes, and visual themes.
- Threaded comments with reactions, likes, and real-time updates.
- Confession posts that expire after 24 hours, use witness interactions instead of normal comments, and support AI responses.
- Drift bottles for tossing, picking, and replying to short anonymous fragments.
- AI-assisted tags for trending topics, tag subscriptions, and related notifications.
- WebSocket updates for new posts, comments, notifications, online users, and activity state.
- Redis-backed cache, rate limiting, online-user ZSets, ranking signals, drift bottle candidates, and interaction counters.
- Offline post queue with retry after network recovery.
- GitHub Actions artifacts for full Windows deployment and Redis-free demo deployment.

## Tech Stack

- Backend: Java 17, Spring Boot 3, MyBatis-Plus, Spring Data Redis, WebSocket, springdoc-openapi
- Frontend: Vue 3, Vite 8, Pinia, Element Plus, Tailwind CSS 4, TypeScript, Vitest, vue-tsc
- Data: MariaDB 11 / MySQL 8, Redis 7
- Deployment: Docker Compose, Nginx, GitHub Actions, Windows native artifacts

## Project Structure

```text
.
  backend/                 Spring Boot backend service
  frontend/                Vue 3 + Vite frontend app
  database/                Database initialization and optional demo data
  deploy/windows/          Windows Nginx config and deployment notes
  scripts/windows/         Windows startup scripts
  storage/                 Runtime uploads, logs, certificates
  compose.yml              Docker Compose orchestration
```

Frontend structure:

```text
frontend/src/
  api/                     Request wrapper and resource modules
  assets/styles/           Global styles, effects, Element Plus overrides, transitions
  components/home/         Home composition, composer, feed, dialogs, notifications
  components/business/     Messages, comments, confessions, bottles, graph, store
  composables/             Business logic hooks
  stores/                  Pinia stores
  types/                   Domain and API types
  utils/                   Utilities
  views/                   Page entry points
```

## Environment

Copy the template and fill in real values:

```bash
cp .env.example .env
```

Key variables:

```env
DB_ROOT_PASSWORD=change-me-root-password
DB_USER=treehole_user
DB_USER_PASSWORD=change-me-user-password
DB_NAME=treehole

AI_API_KEY=your_ai_key

FRONTEND_PORT=443
BACKEND_PORT=24191
DB_PORT=3306
REDIS_PORT=6379
```

For non-Docker backend development, set these as needed:

```env
DB_HOST=127.0.0.1
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=
UPLOAD_PATH=../storage/uploads/
LOG_PATH=../storage/logs/
```

Do not commit real `.env` files, database passwords, API keys, certificates, private keys, runtime logs, or uploaded files.

## Quick Start: Docker Compose

Docker Compose starts MariaDB, Redis, the backend, and the frontend Nginx service.

```bash
docker compose up -d --build
```

On first startup, the MariaDB container runs `database/01_init.sql` to create the complete schema.

Check status and logs:

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f redis
```

URLs:

- Frontend HTTP: `http://localhost`
- Frontend HTTPS: `https://localhost:${FRONTEND_PORT}`
- Backend API: `http://localhost:${BACKEND_PORT}`

Useful commands:

```bash
docker compose down
docker compose up -d --build backend
docker compose up -d --build frontend
docker compose exec redis redis-cli KEYS 'treehole::*'
```

## Database Scripts

`database/` contains only two script types:

- `01_init.sql`: full schema initialization for a fresh database.
- `02_test_data.sql`: optional demo data using `INSERT IGNORE`, safe to re-import.

Manual schema initialization:

```bash
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_USER_PASSWORD" "$DB_NAME" < database/01_init.sql
```

Import demo data:

```bash
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_USER_PASSWORD" "$DB_NAME" < database/02_test_data.sql
```

Import demo data into the Docker Compose database:

```bash
docker compose exec -T db sh -lc 'MYSQL_PWD="$DB_USER_PASSWORD" mariadb -u"$DB_USER" "$DB_NAME"' < database/02_test_data.sql
```

## Local Development

Local development usually runs only the database and Redis in Docker, while the backend and frontend run from the command line or IDE.

```bash
docker compose up -d db redis
```

Start the backend:

```bash
cd backend
set -a
. ../.env
set +a
mvn spring-boot:run
```

Start the frontend:

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend dev server defaults to `http://localhost:5173`. `vite.config.ts` proxies `/api`, `/uploads`, and `/ws` to the backend port, defaulting to `24191`.

## Development Conventions

Backend:

- Use Java 17 and Spring Boot 3.
- Keep controllers thin and put business logic in Service / ServiceImpl classes.
- Extend MyBatis-Plus Mapper, Entity, and DTO packages consistently with the existing structure.
- Reuse existing Redis realtime, cache, rate-limit, and statistics services.

Frontend:

- Use PascalCase component filenames.
- Keep page entries as composition layers; move business state and side effects into composables.
- Prefer existing `src/types/`, `constants/`, `utils/`, Pinia stores, and API modules.
- Prefer Tailwind utilities and the layered CSS files in `assets/styles/`.
- The project maintains the current light visual system; new appearance work should stay within it.
- Keep heavy visual modules such as the graph lazy-loaded to avoid increasing the first-screen bundle.

TypeScript status:

- The project uses gradual TypeScript migration, not full TypeScript coverage.
- API requests, core types, Pinia stores, notifications, tag subscriptions, offline queue, WebSocket, feed behavior, and several composables are already typed.
- Avoid converting every `.vue` file to `lang="ts"` at once; each migration should keep `pnpm type-check` and `pnpm test` passing.

## Tests and Quality Checks

Frontend:

```bash
cd frontend
pnpm lint
pnpm format:check
pnpm type-check
pnpm test
pnpm build
```

Backend:

```bash
cd backend
mvn test
mvn package -DskipTests
```

Recommended before committing:

```bash
cd backend && mvn test
cd ../frontend && pnpm test && pnpm type-check && pnpm build
```

Frontend tests cover core utilities, API modules, feed behavior, notifications, tag subscriptions, graph composables, recorder logic, offline queue, identity, time, and storage helpers. Add Vitest coverage when changing utilities, API contracts, cache or queue behavior, composables, or parsing logic.

## VS Code and IDEA

The repository includes `.vscode/launch.json` and `.vscode/tasks.json` for backend startup, frontend dev server, tests, and type checks.

Recommended VS Code extensions:

- Extension Pack for Java
- Vue - Official
- ESLint
- Prettier

IntelliJ IDEA:

1. Open the repository root, or import `backend/pom.xml`.
2. Select JDK 17 as the Project SDK.
3. Refresh Maven dependencies.
4. Create a Spring Boot Run Configuration with Main class `com.treehole.TreeholeApplication`.
5. Set the `.env` values for `DB_*`, `REDIS_*`, `BACKEND_PORT`, and `AI_API_KEY` explicitly in the Run Configuration.

## Windows Artifacts

GitHub Actions generates two Windows artifacts:

- `treehole-windows-${sha}.zip`: full Windows native deployment, requiring JDK 17, MySQL/MariaDB, a Redis-compatible service, and Windows Nginx.
- `treehole-windows-demo-${sha}.zip`: demo package requiring only JDK 17 and MySQL/MariaDB; demo profile replaces Redis runtime state with in-memory state and is not suitable for production.

Artifacts include the backend jar, frontend `dist`, environment templates, startup scripts, database scripts, and Windows deployment notes.

## GitHub Actions

- `.github/workflows/ci.yml`: builds the backend and frontend.
- `.github/workflows/package-windows.yml`: creates the full Windows and demo artifacts.

## Troubleshooting

### The frontend reports a backend error

Check backend logs first. Common causes are an uninitialized database, `.env` pointing to the wrong database, Redis connection failure, or a Redis password mismatch.

```bash
curl 'http://127.0.0.1:24191/api/messages?pageNum=1&pageSize=10'
```

### Database connection failed

Confirm `.env` matches the actual database:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=treehole
DB_USER=treehole_user
DB_USER_PASSWORD=your_password
```

Inside Docker Compose, the backend connects to `db:3306`; local command-line backend runs usually connect to `127.0.0.1:3306`.

### Redis connection failed or realtime statistics are empty

Confirm Redis is running and that `.env` has the correct port and password. Inside Docker Compose, the backend connects to `redis:6379`; local command-line backend runs usually connect to `127.0.0.1:6379`.

### Frontend proxy or WebSocket is not responding

- Confirm the backend is running on `BACKEND_PORT`.
- Confirm the frontend was started with `pnpm dev` on port `5173`.
- If WebSocket fails in the browser console, check that `/ws/treehole/{userId}` is proxied to the backend.

### Upload or log directory permission errors

Create runtime directories:

```bash
mkdir -p storage/uploads storage/logs
```

For Docker deployments, if backend logs report permission errors, check the mounted directory owner against the container user.

## Production Checklist

- `.env` uses strong real passwords and a real `AI_API_KEY`, and is not committed.
- The database has been initialized with `database/01_init.sql`.
- Redis is reachable.
- `storage/uploads` and `storage/logs` are writable.
- The frontend is reachable, and `/api`, `/uploads`, and `/ws` route to the backend correctly.
- The main flow has been tested: home page, posting, commenting, file upload, and WebSocket updates.
- Firewall or security group rules expose the required ports.

## License

License to be added.
