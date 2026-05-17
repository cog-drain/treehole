# Treehole - 赛博树洞

[中文](README.md) | [English](README.en.md)

Treehole 是一个全栈匿名表达与互动应用。它包含 Vue 3 前端、Spring Boot 后端、MySQL/MariaDB 数据库、Redis 实时状态与缓存，以及 WebSocket 实时推送。

## 功能概览

- 匿名留言、图片/语音留言、楼中楼评论。
- 告解帖：24 小时后过期，使用见证机制替代普通评论，并支持 AI 回应。
- 漂流瓶：投递、捞取、回复陌生人的片段。
- 语气模式：悄悄话、大声说、梦话、电波、诗意等展示效果。
- AI 标签：发布后自动提取主题标签，用于热门话题和订阅通知。
- 实时互动：WebSocket 推送新留言、新评论、通知、在线人数和活动状态。
- Redis 能力：缓存、发帖/评论限流、在线用户 ZSet、热度排行、漂流瓶候选池、表情回响统计。
- 离线体验：前端可暂存断网留言，网络恢复后重试。

## 技术栈

- Backend: Java 17, Spring Boot 3, MyBatis-Plus, Spring Data Redis, WebSocket
- Frontend: Vue 3, Vite 8, Pinia, Element Plus, Tailwind CSS 4, TypeScript, Vitest, vue-tsc
- Data: MySQL 8+/MariaDB 11, Redis 7
- Deployment: Docker Compose, Windows native artifact, Windows demo artifact

## 项目结构

```text
.
  backend/                 Spring Boot 后端
  frontend/                Vue 3 + Vite 前端
  database/                初始化、测试数据和增量迁移 SQL
  deploy/windows/          Windows Nginx 与部署说明
  scripts/windows/         Windows 启动脚本
  storage/                 本地上传和日志目录，运行时生成
  compose.yml              Docker Compose 一键编排
```

## 环境变量

先复制模板：

```bash
cp .env.example .env
```

最少需要填写：

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

本地非 Docker 后端还可以按需补充：

```env
DB_HOST=127.0.0.1
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=
UPLOAD_PATH=../storage/uploads/
LOG_PATH=../storage/logs/
```

不要提交真实 `.env`、数据库密码、API Key、证书或私钥。

## 方式一：Docker Compose 启动

这是最完整的本地/服务器启动方式，会同时启动数据库、Redis、后端和前端 Nginx。

### 1. 启动

```bash
docker compose up -d --build
```

第一次启动时，`database/01_init.sql` 会自动初始化数据库。这个脚本是全量初始化脚本，会创建完整表结构。

### 2. 查看状态

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f redis
```

正常状态：

- `db` 健康检查通过。
- `backend` 能连接 `db:3306` 和 `redis:6379`。
- `frontend` 的 `/api`、`/uploads`、`/ws` 能代理到后端。

### 3. 访问

- 前端 HTTP：`http://localhost`
- 前端 HTTPS：`https://localhost:${FRONTEND_PORT}`
- 后端 API：`http://localhost:${BACKEND_PORT}`

如果部署在服务器上，将 `localhost` 换成服务器 IP 或域名，并确认防火墙/安全组开放对应端口。

### 4. 常用 Docker 命令

```bash
# 停止
docker compose down

# 重建后端
docker compose up -d --build backend

# 重建前端
docker compose up -d --build frontend

# 查看 Redis 缓存键
docker compose exec redis redis-cli KEYS 'treehole::*'
```

## 方式二：本地开发启动

本地开发通常只启动 MySQL/Redis 基础设施，后端和前端分别由 IDE 或命令行运行。这样调试更快，也不会每次都重建容器。

### 1. 准备 MySQL 和 Redis

你可以使用本机安装的 MySQL/Redis，也可以只用 Docker 启动基础设施。

使用仓库 Compose 的数据库和 Redis：

```bash
docker compose up -d db redis
```

或者使用你自己的 MySQL/Redis，只要 `.env` 中这些值能连通即可：

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=treehole
DB_USER=treehole_user
DB_USER_PASSWORD=your_password

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 2. 初始化或迁移数据库

命令行中的 `mysql` 不会自动读取 `.env`。如果你想直接复用 `.env` 里的变量，先导出它们：

```bash
set -a
. ./.env
set +a
```

全新数据库执行：

```bash
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_USER_PASSWORD" "$DB_NAME" < database/01_init.sql
```

已有旧库不要直接执行 `01_init.sql`，它会重建表。旧库升级先执行增量迁移：

```bash
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_USER_PASSWORD" "$DB_NAME" < database/03_add_camo_effect.sql
```

如果旧库缺少告解亭相关字段和表，需要补充：

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

可选导入演示数据：

```bash
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_USER_PASSWORD" "$DB_NAME" < database/02_test_data.sql
```

### 3. 命令行启动后端

```bash
cd backend
set -a
. ../.env
set +a
mvn spring-boot:run
```

默认使用 `dev` profile。Spring Boot 不会自动读取根目录 `.env`，所以上面的 `set -a; . ../.env; set +a` 用来把 `.env` 注入当前 shell。也可以用 IDE 的环境变量配置或系统环境变量达到同样效果。

后端检查：

```bash
curl 'http://127.0.0.1:24191/api/messages?pageNum=1&pageSize=10'
curl 'http://127.0.0.1:24191/api/tags/trending?limit=12'
```

### 4. 命令行启动前端

```bash
cd frontend
pnpm install
pnpm dev
```

访问：

```text
http://localhost:5173
```

Vite 开发服务器会将 `/api`、`/uploads`、`/ws` 代理到 `BACKEND_PORT`，默认 `24191`。本地开发不需要 Nginx。

## VS Code 开发

仓库提交了 `.vscode/launch.json` 和 `.vscode/tasks.json` 作为团队模板。

推荐插件：

- Extension Pack for Java
- Vue - Official
- ESLint
- Prettier

步骤：

1. 打开仓库根目录。
2. 准备 `.env`，并确认 MySQL/Redis 已启动。
3. 如有旧库，先执行必要 SQL 迁移。
4. 在 `Run and Debug` 中选择 `Run Spring Boot Backend` 启动后端。
5. 在 `Terminal -> Run Task...` 中执行 `frontend: install`，再执行 `frontend: dev`。
6. 访问 `http://localhost:5173`。

可用配置：

- `Run Spring Boot Backend`：普通本地后端，读取根目录 `.env`，使用默认 `dev` profile。
- `Run Spring Boot Backend (demo profile)`：demo profile，不连接 Redis；用于 Windows demo 包或只想用 MySQL 演示的场景。使用前先运行 `pnpm build`。
- `Run Full Local Stack`：先启动前端 dev task，再启动后端。
- `backend: test`、`frontend: test`、`frontend: type-check`：常用检查任务。

## IntelliJ IDEA 开发

1. 用 IDEA 打开仓库根目录，或导入 `backend/pom.xml`。
2. Project SDK 选择 JDK 17。
3. 在 Maven 面板刷新依赖。
4. 新建 Spring Boot Run Configuration：
   - Main class: `com.treehole.TreeholeApplication`
   - Working directory: `<repo>/backend`
   - Environment variables: 填入 `.env` 中的 `DB_*`、`REDIS_*`、`BACKEND_PORT`、`AI_API_KEY`
   - Active profiles: 默认留空即可使用 `dev`；演示模式填 `demo`
5. 后端启动后，在 IDEA Terminal 中运行：

```bash
cd frontend
pnpm install
pnpm dev
```

IDEA 默认不会自动读取根目录 `.env`。如果没有使用 dotenv 插件，建议在 Run Configuration 里显式填写环境变量。

## Windows 部署包

GitHub Actions 会生成两个 Windows artifact。

### 完整 Windows 包

`treehole-windows-${sha}.zip` 适合 Windows 原生完整部署，目标机器需要：

- JDK 17
- MySQL 8+ 或 MariaDB
- Redis-compatible 服务，例如 Memurai
- Windows Nginx

包内包含：

- 后端 jar
- 前端 `dist`
- `.env.windows.example`
- Windows Nginx 配置
- PowerShell 启动脚本
- 数据库 SQL
- `README-windows-artifact.md`

默认运行目录：

```text
C:\treehole
```

### Windows demo 包

`treehole-windows-demo-${sha}.zip` 适合演示机器只有 JDK 17 + MySQL 的情况。

- 不需要 Docker
- 不需要 Redis
- 不需要 Nginx
- 不需要 Node.js

demo profile 使用内存替代 Redis 实时状态，重启后会丢失在线人数、限流、漂流瓶候选池、活动排行等运行时状态。它适合演示，不适合生产。

默认运行目录：

```text
C:\treehole-demo
```

详细步骤见包内 `README-windows-demo.md`。

## GitHub Actions

当前 workflow：

- `.github/workflows/ci.yml`：基础 CI，构建后端和前端。
- `.github/workflows/package-windows.yml`：生成 Windows 完整包和 Windows demo 包。

手动打包：

1. 打开 GitHub 仓库的 `Actions`。
2. 选择 `Treehole Windows Package`。
3. 点击 `Run workflow`。
4. 在 workflow run 的 artifacts 中下载 zip。

## 测试与质量检查

前端：

```bash
cd frontend
pnpm lint
pnpm format:check
pnpm type-check
pnpm test
pnpm build
```

后端：

```bash
cd backend
mvn test
mvn package -DskipTests
```

提交前至少建议执行：

```bash
cd backend && mvn test
cd ../frontend && pnpm test && pnpm type-check && pnpm build
```

## 常见问题

### 前端提示“树洞服务器开小差了”

这是后端返回了业务响应 `code=500`。优先看后端控制台日志，常见原因：

- 数据库表结构不是最新，缺少 `camo_effect`、`message_type`、`expires_at`、`reactions` 等字段。
- `.env` 指向了错误数据库。
- Redis 连接失败或密码不匹配。

先检查：

```bash
curl 'http://127.0.0.1:24191/api/messages?pageNum=1&pageSize=10'
```

如果日志出现 `Unknown column 'camo_effect'`，执行：

```bash
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_USER_PASSWORD" "$DB_NAME" < database/03_add_camo_effect.sql
```

### 数据库连接失败

确认 `.env` 与实际数据库一致：

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=treehole
DB_USER=treehole_user
DB_USER_PASSWORD=your_password
```

Docker Compose 内部后端连接的是 `db:3306`；本地命令行后端通常连接 `127.0.0.1:3306`。

### Redis 连接失败或实时统计为空

确认 Redis 正在运行，并且 `.env` 中端口和密码正确。Docker Compose 内部后端连接 `redis:6379`；本地命令行后端通常连接 `127.0.0.1:6379`。

### 前端代理或 WebSocket 无响应

- 确认后端运行在 `BACKEND_PORT`。
- 确认前端由 `pnpm dev` 启动在 `5173`。
- 浏览器控制台如果 WebSocket 失败，检查 `/ws/treehole/{userId}` 是否被代理到后端。

### 上传或日志目录权限错误

创建运行时目录：

```bash
mkdir -p storage/uploads storage/logs
```

Docker 部署时如果后端日志提示权限错误，检查挂载目录 owner 与容器用户是否匹配。

## 生产发布检查

- `.env` 使用真实强密码和真实 `AI_API_KEY`，且未提交到仓库。
- 数据库已初始化或迁移到最新结构。
- Redis 可连接。
- `storage/uploads` 和 `storage/logs` 可写。
- 前端可访问，`/api`、`/uploads`、`/ws` 能正确到达后端。
- 已验证首页加载、发布留言、评论、上传文件、WebSocket 实时更新。
- 防火墙或安全组已开放必要端口。

## License

[MIT License](LICENSE)
