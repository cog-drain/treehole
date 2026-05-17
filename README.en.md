# Treehole

[中文](README.md) | [English](README.en.md)

An immersive, anonymous expression and interaction platform. Here, your secrets are safe. The project features rich social interaction mechanics, real-time bidirectional communication, and AI-driven content organization.

## ✨ Core Features

- **🌳 Anonymous Treehole & Threads**: A minimalist publishing experience supporting images, voice messages, and multi-level replies.
- **🕯️ Cyber Confessional**: Temporary confession posts expire after 24 hours, disable normal comments, use a dedicated candle-witness interaction, and receive an unconditional AI confessor response.
- **🎨 Tone Modes**: Breaking the monotony of plain text with 5 special rendering effects ("Whisper", "Shout", "Dream", "Glitch", "Poetic") to convey emotions vividly.
- **🌊 Cyber Drift Bottle**: Toss your thoughts into the sea or fish for a stranger's fleeting moment.
- **🤖 AI Smart Tags**: Automated tag extraction and categorization based on LLM semantic analysis, powering the trending resonance wall.
- **🛡️ Identity & Security**:
  - **Identity Backup & Restore**: Seamlessly sync your cloud identity and records across devices using a unique recovery key.
  - **Rate Limiting & Anti-Spam**: High-concurrency rate limiting backed by Redis (10s cooldown for posts, 5s for comments) to maintain a healthy community environment.
- **⚡ Real-time Echo**: Full-duplex communication via WebSocket pushing likes, comments, and new messages to the client instantly.
- **📡 Redis Realtime State**: Redis powers hot-path caches, online-user ZSets, ranking signals, the drift bottle pool, reaction counts, and confession witness counts, while WebSocket pushes live online and interaction updates.
- **🧘 Edge Experience Enhancements**: Offline draft box (auto-resend upon network recovery) and a focused Zen Mode (white noise + immersive reading).

## 📂 Project Structure

- `backend/`: Spring Boot 3 + MyBatis-Plus + WebSocket + Redis
- `frontend/`: Vue 3 + Vite + Pinia + Tailwind CSS
- `database/`: Database initialization and test data scripts
- `storage/`: Runtime uploads and log directories
- `compose.yml`: One-command Docker orchestration (db/backend/frontend/redis)

## 🛠 Tech Stack

- **Backend**: Java 17, Spring Boot 3, MyBatis-Plus, Spring Data Redis
- **Frontend**: Vue 3, Vite, Element Plus, Tailwind CSS, Pinia, Lucide Icons
- **Database & Cache**: MariaDB 11, Redis 7
- **Realtime**: WebSocket

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
REDIS_PORT=6379
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
docker compose logs -f redis
```

### 5. Verify Cache Demo

After startup, use the following commands to demonstrate that Redis caching is active:

```bash
# Hit read-heavy endpoints once to populate cache
curl -k https://127.0.0.1/api/tags/trending?limit=5
curl -k 'https://127.0.0.1/api/messages?pageNum=1&pageSize=5'
curl -k https://127.0.0.1/api/graph/data

# Inspect cache keys in Redis
docker compose exec redis redis-cli KEYS 'treehole::*'

# Check a sample TTL
docker compose exec redis redis-cli TTL 'treehole::graphData::latest'
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

## Existing Database Upgrade

If you already have an old database volume, editing `database/01_init.sql` will not alter existing tables. Run this SQL before using the Cyber Confessional feature:

```sql
ALTER TABLE `message`
  ADD COLUMN `message_type` VARCHAR(20) DEFAULT 'normal' AFTER `theme`,
  ADD COLUMN `expires_at` DATETIME DEFAULT NULL AFTER `message_type`,
  ADD INDEX `idx_message_type_expires` (`message_type`, `expires_at`);

CREATE TABLE IF NOT EXISTS `confession_witness` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `message_id` BIGINT NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_confession_witness_user` (`message_id`, `user_id`),
  INDEX `idx_confession_witness_message` (`message_id`),
  INDEX `idx_confession_witness_user` (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
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

# Start the full cache demo stack
docker compose up -d --build redis backend frontend

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
