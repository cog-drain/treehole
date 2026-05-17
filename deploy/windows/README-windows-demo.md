# Treehole Windows Demo Deployment

This demo package is for Windows machines that have JDK 17 and MySQL/MariaDB, but do not have Docker, Redis, Nginx, or Node.js.

Demo mode is not a production deployment. Redis-backed runtime state is replaced by in-memory state, so rate limits, online users, activity ranks, reaction user choices, and drift bottle candidates reset when the Java process restarts.

## Contents

```text
treehole-windows-demo/
  backend/
    treehole-backend.jar
  frontend/
    index.html
    assets/
  scripts/
    start-demo.ps1
  database/
    01_init.sql
    02_test_data.sql
    03_add_camo_effect.sql
  .env.demo.windows.example
  README-windows-demo.md
```

## Install Layout

Extract the package so the final layout is:

```text
C:\treehole-demo\
  backend\
    treehole-backend.jar
  frontend\
    index.html
    assets\
  scripts\
    start-demo.ps1
  database\
    01_init.sql
  storage\
    uploads\
    logs\
  .env
```

Copy the environment template:

```powershell
copy C:\treehole-demo\.env.demo.windows.example C:\treehole-demo\.env
notepad C:\treehole-demo\.env
```

Fill in your own MySQL account. Do not use `root` for the application account.

```env
SPRING_PROFILES_ACTIVE=demo
BACKEND_PORT=24191

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=treehole
DB_USER=treehole_user
DB_USER_PASSWORD=your_password

AI_API_KEY=your_ai_key

FRONTEND_PATH=C:/treehole-demo/frontend
UPLOAD_PATH=C:/treehole-demo/storage/uploads
LOG_PATH=C:/treehole-demo/storage/logs
```

## MySQL Setup

Create a database and a non-root application account:

```sql
CREATE DATABASE treehole CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'treehole_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON treehole.* TO 'treehole_user'@'localhost';
FLUSH PRIVILEGES;
```

Initialize the schema with the same account configured in `.env`:

```powershell
mysql -u treehole_user -p treehole < C:\treehole-demo\database\01_init.sql
```

Optional demo data:

```powershell
mysql -u treehole_user -p treehole < C:\treehole-demo\database\02_test_data.sql
```

## Start

Start MySQL first, then run:

```powershell
powershell -ExecutionPolicy Bypass -File C:\treehole-demo\scripts\start-demo.ps1
```

Open:

```text
http://localhost:24191
```

The same Java process serves:

- Frontend static files from `FRONTEND_PATH`
- API routes under `/api`
- Upload files under `/uploads`
- WebSocket route under `/ws/treehole/{userId}`

## Notes

- JDK 17 and MySQL/MariaDB are required.
- Docker, Redis, Nginx, and Node.js are not required for this demo package.
- Change `BACKEND_PORT` in `.env` if port `24191` is already in use.
- The package contains only templates. Real passwords and API keys stay in `C:\treehole-demo\.env`.
