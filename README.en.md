# Treehole

[中文](README.md) | [English](README.en.md)

An anonymous expression and interaction platform with message posting, threaded comments, drift bottles, real-time echo (WebSocket), and AI-related capabilities.

## Project Structure

- `backend/`: Spring Boot 3 + MyBatis-Plus + WebSocket
- `frontend/`: Vue 3 + Vite + Pinia
- `database/`: Database initialization and test data scripts
- `storage/`: Runtime uploads and log directories
- `compose.yml`: One-command Docker orchestration (db/backend/frontend)

## Tech Stack

- Backend: Java 17, Spring Boot 3, MyBatis-Plus
- Frontend: Vue 3, Vite, Element Plus, Tailwind CSS
- Database: MariaDB 11 (MySQL-compatible syntax)
- Realtime: WebSocket

## Quick Start (Docker, Recommended)

### 1. Prepare `.env`

Create `.env` in the project root (you can copy from `.env.example`):

```env
DB_ROOT_PASSWORD=your_root_password
DB_USER=student
DB_USER_PASSWORD=your_password
DB_NAME=treehole
AI_API_KEY=your_api_key

FRONTEND_PORT=443
BACKEND_PORT=24191
DB_PORT=3306
```

### 2. Start Services

```bash
docker compose up -d --build
```

### 3. Access URLs

- Frontend (HTTPS): `https://your-domain-or-ip:${FRONTEND_PORT}`
- Frontend (HTTP, auto-redirect): `http://your-domain-or-ip/`
- Backend: `http://your-server-ip:${BACKEND_PORT}`

### 4. Check Status and Logs

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f db
```

## Import Test Data

`database/02_test_data.sql` is safe to re-import (`INSERT IGNORE`) and refreshes `message.comment_count` at the end.

Run from the project root:

```bash
# Import using business account from .env (recommended)
docker compose exec -T db sh -lc 'MYSQL_PWD="$DB_USER_PASSWORD" mariadb -u"$DB_USER" "$DB_NAME"' < database/02_test_data.sql
```

If you prefer importing with root:

```bash
docker compose exec -T db sh -lc 'MYSQL_PWD="$DB_ROOT_PASSWORD" mariadb -uroot "$DB_NAME"' < database/02_test_data.sql
```

## Local Development

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

- Default local port: `5173`
- Local `pnpm dev` uses the Vite dev server, not Nginx

### Backend

```bash
cd backend
mvn spring-boot:run
```

Or run tests:

```bash
cd backend
mvn test
```

## Configuration Notes

### About `FRONTEND_PORT`

- `FRONTEND_PORT` controls the **HTTPS port exposed by the frontend container on the host** (the 443 mapping in `compose.yml`).
- Nginx inside the container always listens on both `80` and `443`: `80` serves HTTP, and `443` serves HTTPS.
- Local frontend development (`pnpm dev`) still runs on 5173 by default and is independent of `FRONTEND_PORT`.

### About HTTPS Certificates

- The frontend container reads the origin certificate from `storage/certs/origin.crt` and `storage/certs/origin.key`.
- If you use Cloudflare, the recommended setup is to generate a **Cloudflare Origin Certificate** and save it to those two paths.
- For temporary connectivity testing, a self-signed certificate also works if Cloudflare `SSL/TLS` mode is set to `Full`.

### About `application-prod.yaml`

- Production config file is at `backend/src/main/resources/application-prod.yaml`.
- If this file is ignored by `.gitignore`, for team collaboration you should commit a template and inject sensitive values via environment variables.

## Troubleshooting

### 1) DB connection failed: `Access denied for user ... to database ...`

Check these three places first:

- `DB_USER` / `DB_USER_PASSWORD` / `DB_NAME` in `.env`
- Environment variables of the `db` service in `compose.yml`
- Actual backend runtime variables (`docker compose exec backend env | grep DB_`)

If your DB volume was initialized earlier and you changed user/db settings, recreate the DB volume:

```bash
docker compose down
docker volume ls | grep treehole
# Confirm and remove the target volume, then run up -d --build again
```

### 2) Backend logging permission error: `/app/logs/spring.log (Permission denied)`

```bash
cd /path/to/treehole
mkdir -p storage/logs storage/uploads

docker exec treehole-backend sh -lc 'id appuser'
# Example: uid=1000 gid=1000

sudo chown -R 1000:1000 storage/logs storage/uploads
sudo chmod -R u+rwX,g+rwX storage/logs storage/uploads

docker compose restart backend
```

### 3) Why do I sometimes need `:5173` and sometimes not?

- If frontend is mapped to 5173, use `http://ip:5173`
- If mapped to 443, use `https://domain/` or `https://ip:443`

Always trust the `PORTS` column in `docker compose ps`.

## Other Commands

```bash
# Stop all services
docker compose down

# Rebuild backend only
docker compose up -d --build backend

# Restart frontend only
docker compose restart frontend
```

## Minimal Production Release Checklist

Before release, verify at least these 5 items:

- `.env` uses real strong passwords and a real `AI_API_KEY`, and is not committed.
- `FRONTEND_PORT` / `BACKEND_PORT` are aligned with firewall and security group rules.
- `docker compose ps` shows `db` as `healthy`, and `backend`/`frontend` as `Up`.
- Critical path smoke test is done: open home page, post a message, post a comment, call one backend API.
- `storage/logs` and `storage/uploads` permissions are correct, and `docker compose logs -f backend` has no persistent errors.

## License

[MIT License](LICENSE)
