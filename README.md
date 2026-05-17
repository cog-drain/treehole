# Treehole - 赛博树洞

[中文](README.md) | [English](README.en.md)

一个沉浸式的匿名表达与互动平台。在这里，你的秘密很安全。项目包含丰富的社交互动机制、实时双向通信以及基于 AI 的内容整理能力。

## ✨ 核心功能 (Core Features)

- **🌳 匿名树洞 & 楼中楼**：极简的发布体验，支持图片、语音留言，以及多层级回复。
- **🕯️ 赛博告解亭**：发布 24 小时后自动熄灭的告解帖，关闭评论，改为独立「点燃蜡烛」见证，并由 AI 赛博神父给出无条件回应。
- **🎨 语气模式 (Tone Modes)**：打破单调的文字，支持「悄悄话、大声说、梦话、电波、诗意」5 种特殊渲染效果，情绪传达更生动。
- **🌊 赛博漂流瓶**：扔出你的心事，或者捞起陌生人的瞬间。
- **🤖 AI 智能标签**：基于大语言模型的语义分析，自动提取留言标签并归类，支持热门共鸣墙。
- **🛡️ 身份与安全机制**：
  - **身份备份与恢复**：通过唯一恢复密钥，在不同设备间无缝同步云端身份与记录。
  - **防御性频控策略**：基于 Redis 的 `ID + IP` 双重高并发限流（发帖 10 秒冷却，评论 5 秒冷却），彻底杜绝脚本换号刷屏。
  - **内容硬拦截**：严格的留言（1000字）与评论（500字）长度拦截，防止恶意长文本耗尽服务器内存及 AI 计费 Token。
- **⚡ 实时回响**：基于 WebSocket 的全双工通信，点赞、评论、新留言实时推送到客户端。
- **🔔 站内通知中心**：核心互动、告解见证和订阅话题新内容可进入通知中心，支持未读数、实时提醒、已读状态和定位。
- **📡 Redis 实时状态**：Redis 负责高频缓存、在线人数 ZSet、热度排行、漂流瓶池、表情回响统计与告解见证计数，WebSocket 推送实时在线与互动变化。
- **🧘 边缘体验增强**：断网离线暂存箱（网络恢复后自动重发）、专注禅定模式（白噪音+沉浸式阅读）。

## 📂 项目结构

- `backend/`: Spring Boot 3 + MyBatis-Plus + WebSocket + Redis
- `frontend/`: Vue 3 + Vite + Pinia + Tailwind CSS + 渐进式 TypeScript + Vitest
- `database/`: 数据库初始化与测试数据脚本
- `storage/`: 运行时上传与日志目录
- `compose.yml`: Docker 一键编排（db/backend/frontend/redis）

## 🛠 技术栈

- **Backend**: Java 17, Spring Boot 3, MyBatis-Plus, Spring Data Redis
- **Frontend**: Vue 3, Vite 8, Element Plus, Tailwind CSS 4, Pinia, Lucide Icons, TypeScript, Vitest, vue-tsc
- **Database & Cache**: MariaDB 11, Redis 7
- **Realtime**: WebSocket

## 快速启动（Docker，推荐）

### 1. 准备 `.env`

在项目根目录创建 `.env`（可参考 `.env.example`）：

```env
DB_ROOT_PASSWORD=<PLACEHOLDER_DB_ROOT_PASSWORD>
DB_USER=<PLACEHOLDER_DB_USER>
DB_USER_PASSWORD=<PLACEHOLDER_DB_PASSWORD>
DB_NAME=<PLACEHOLDER_DB_NAME>
AI_API_KEY=<PLACEHOLDER_AI_API_KEY>

FRONTEND_PORT=<PLACEHOLDER_FRONTEND_PORT>
BACKEND_PORT=<PLACEHOLDER_BACKEND_PORT>
DB_PORT=<PLACEHOLDER_DB_PORT>
REDIS_PORT=<PLACEHOLDER_REDIS_PORT>
```

### 2. 启动服务

```bash
docker compose up -d --build
```

### 3. 访问地址

- 前端（HTTPS）：`https://your-domain-or-ip:${FRONTEND_PORT}`
- 前端（HTTP，自动跳转）：`http://your-domain-or-ip/`
- 后端：`http://your-server-ip:${BACKEND_PORT}`

### 4. 查看状态与日志

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f redis
```

云端检查点：

- 后端容器状态为 running，`docker compose logs -f backend` 无数据库、Redis 或端口绑定错误。
- MariaDB 健康检查通过，`.env` 中 `DB_NAME`、`DB_USER`、`DB_USER_PASSWORD` 已注入后端容器。
- Redis 容器可用，在线人数、热门标签、回响统计和缓存相关功能不报连接错误。
- 前端静态服务可访问，`/api`、`/uploads`、`/ws` 能代理到后端。
- WebSocket 地址 `/ws/treehole/{userId}` 可连接，实时留言、评论、通知和在线人数可更新。

### 5. 缓存演示验证

启动后可用下面这组命令快速演示 Redis 缓存已生效：

```bash
# 先访问一次热门标签、留言列表或图谱接口，触发缓存写入
curl -k https://127.0.0.1/api/tags/trending?limit=5
curl -k 'https://127.0.0.1/api/messages?pageNum=1&pageSize=5'
curl -k https://127.0.0.1/api/graph/data

# 查看 Redis 中的缓存键
docker compose exec redis redis-cli KEYS 'treehole::*'

# 查看缓存剩余 TTL（示例）
docker compose exec redis redis-cli TTL 'treehole::graphData::latest'
```

## Windows 原生部署（后端 Jar + 前端静态文件）

如果要在另一台 Windows 设备上不用 Docker 运行完整应用，可以采用：

- MySQL 8 或 MariaDB：持久化业务数据。
- Memurai：Windows 原生 Redis-compatible 服务，用于缓存、限流、在线状态、热度排行和实时统计。
- Java 17：运行 Spring Boot 后端 Jar。
- Nginx for Windows：托管 Vite 打包后的静态文件，并反代 `/api`、`/uploads`、`/ws` 到后端。

前端生产代码当前使用相对路径：

- API：`/api`
- 上传文件访问：`/uploads`
- WebSocket：`/ws/treehole/{userId}`

因此 Windows 原生部署时通常不需要配置 `VITE_API_BASE_URL`，关键是 Nginx 反代路径要正确。

### 1. 准备 Windows 目录

推荐目录结构：

```text
C:\treehole\
  backend\
    treehole-backend.jar
  frontend\
    index.html
    assets\
  storage\
    uploads\
    logs\
  .env
```

仓库内提供了三个模板：

- `.env.windows.example`：Windows 原生运行环境变量模板。
- `scripts/windows/start-backend.ps1`：读取 `C:\treehole\.env` 并启动 Jar。
- `deploy/windows/nginx-treehole.conf`：Windows Nginx 站点配置模板。

### 2. 准备 `.env`

复制模板到 Windows 运行目录：

```powershell
copy .env.windows.example C:\treehole\.env
```

按实际情况替换占位符：

```env
SPRING_PROFILES_ACTIVE=prod
BACKEND_PORT=24191

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=treehole
DB_USER=treehole_user
DB_USER_PASSWORD=your_db_password

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

AI_API_KEY=your_ai_key

UPLOAD_PATH=C:/treehole/storage/uploads
LOG_PATH=C:/treehole/storage/logs
```

注意：

- `.env` 不会被 `java -jar` 自动读取，需要通过 PowerShell 脚本或系统服务注入。
- Windows 路径建议在环境变量中写成 `C:/treehole/storage/uploads` 这种格式。
- 当前 `prod` 配置没有读取 `REDIS_PASSWORD`，如果给 Redis-compatible 服务加密码，需要同步扩展后端配置。

### 3. 初始化数据库

先在 MySQL/MariaDB 中创建数据库和业务账号，然后在项目根目录执行：

```powershell
mysql -u treehole_user -p treehole < database\01_init.sql
```

如果是已有数据库升级，还需要执行最新迁移：

```powershell
mysql -u treehole_user -p treehole < database\03_add_camo_effect.sql
```

如需导入演示数据：

```powershell
mysql -u treehole_user -p treehole < database\02_test_data.sql
```

### 4. 打包并复制后端 Jar

```powershell
cd backend
mvn clean package -DskipTests
copy target\*.jar C:\treehole\backend\treehole-backend.jar
cd ..
```

启动后端：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\windows\start-backend.ps1
```

如果脚本不在当前仓库目录执行，可以指定路径：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\windows\start-backend.ps1 `
  -EnvFile C:\treehole\.env `
  -JarPath C:\treehole\backend\treehole-backend.jar
```

后端检查：

```powershell
curl http://127.0.0.1:24191/api/messages
```

### 5. 打包并复制前端静态文件

```powershell
cd frontend
pnpm install
pnpm build
```

将 `frontend\dist\` 下的内容复制到：

```text
C:\treehole\frontend\
```

### 6. 配置 Windows Nginx

将 `deploy/windows/nginx-treehole.conf` 合并到 Windows Nginx 配置中，或作为站点配置引用。默认配置假设：

- 静态文件目录：`C:/treehole/frontend`
- 后端地址：`http://127.0.0.1:24191`
- 对外 HTTP 端口：`80`

核心反代路径：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:24191;
}

location /uploads/ {
    proxy_pass http://127.0.0.1:24191;
}

location /ws/ {
    proxy_pass http://127.0.0.1:24191;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

启动或重载 Nginx 后访问：

```text
http://localhost
```

如果要让局域网其它设备访问，使用 Windows 设备的局域网 IP，并在 Windows 防火墙中开放 `80` 端口。

### 7. Windows 启动顺序

1. 启动 MySQL/MariaDB。
2. 启动 Memurai。
3. 运行 `scripts/windows/start-backend.ps1` 启动后端 Jar。
4. 启动或重载 Nginx。
5. 浏览器访问 `http://localhost` 或 `http://<Windows设备IP>`。

## 测试数据导入

`database/02_test_data.sql` 可重复导入（`INSERT IGNORE`），并会在末尾刷新 `message.comment_count`。

在项目根目录执行：

```bash
# 使用 .env 中业务账号导入（推荐）
docker compose exec -T db sh -lc 'MYSQL_PWD="$DB_USER_PASSWORD" mariadb -u"$DB_USER" "$DB_NAME"' < database/02_test_data.sql
```

如需使用 root 账号导入：

```bash
docker compose exec -T db sh -lc 'MYSQL_PWD="$DB_ROOT_PASSWORD" mariadb -uroot "$DB_NAME"' < database/02_test_data.sql
```

## 现有数据库升级

如果你已经有旧数据库卷，只改 `database/01_init.sql` 不会自动修改现有表。升级到告解亭功能需要执行：

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

## 本地开发

本地开发可以用命令行、VS Code 或 IntelliJ IDEA。三种方式都依赖同一套前置条件：

```bash
# 1. 准备环境变量
cp .env.example .env
# 按本地 MySQL/Redis 配置填写 DB_*、REDIS_*、BACKEND_PORT、AI_API_KEY

# 2. 启动本地 MySQL（如果使用 /home/ember/infra/mysql）
docker compose -f /home/ember/infra/mysql/compose.yaml up -d
docker ps --format '{{.Names}} {{.Ports}}' | grep mysql-global

# Redis 也需要运行；如果使用已有全局 Redis，确认容器存在
docker ps --format '{{.Names}} {{.Ports}}' | grep redis-global

# 3. 初始化或迁移数据库
set -a
. ./.env
set +a
docker exec -i mysql-global mysql -u"$DB_USER" -p"$DB_USER_PASSWORD" "$DB_NAME" < database/03_add_camo_effect.sql
```

如果是全新数据库，可以先创建库和账号，再执行 `database/01_init.sql`。不要把真实 `.env` 提交到仓库。

### 命令行启动

```bash
# 终端 1：启动后端，默认读取根目录 .env
cd backend
mvn spring-boot:run
```

```bash
# 终端 2：启动前端开发服务器
cd frontend
pnpm install
pnpm dev
```

- 默认本地端口：`5173`
- 后端默认端口：`.env` 中的 `BACKEND_PORT`，通常是 `24191`
- 本地 `pnpm dev` 走 Vite 开发服务器，不走 Nginx；`frontend/vite.config.ts` 会把 `/api`、`/uploads`、`/ws` 代理到后端端口。

后端接口快速检查：

```bash
curl 'http://127.0.0.1:24191/api/messages?pageNum=1&pageSize=10'
curl 'http://127.0.0.1:24191/api/tags/trending?limit=12'
```

常用质量检查：

```bash
cd frontend
pnpm lint
pnpm format:check
pnpm build
pnpm type-check
pnpm test
```

后端测试：

```bash
cd backend
mvn test
```

### VS Code 启动

仓库提交了 `.vscode/launch.json` 和 `.vscode/tasks.json` 作为团队模板。推荐安装：

- Extension Pack for Java
- Vue - Official
- ESLint
- Prettier

使用步骤：

1. 打开仓库根目录 `/home/ember/test/micro/domTree`。
2. 确认根目录 `.env` 已填写本地 `DB_*`、`REDIS_*`、`BACKEND_PORT`。
3. 确认 MySQL/Redis 已启动，并已执行必要数据库迁移。
4. 在 VS Code `Run and Debug` 中选择 `Run Spring Boot Backend` 启动后端。
5. 在 `Terminal -> Run Task...` 中执行 `frontend: install`，再执行 `frontend: dev`。
6. 浏览器访问 `http://localhost:5173`。

可用模板：

- `Run Spring Boot Backend`：普通本地后端，读取根目录 `.env`，默认 `dev` profile。
- `Run Spring Boot Backend (demo profile)`：demo profile 后端，使用 `FRONTEND_PATH=${workspaceFolder}/frontend/dist`；使用前先运行 `pnpm build`。
- `Run Full Local Stack`：启动前端 dev task 后再启动普通后端。
- `backend: test`、`frontend: test`、`frontend: type-check`：常用检查任务。

### IntelliJ IDEA 启动

1. 用 IDEA 打开仓库根目录，或直接导入 `backend/pom.xml` 作为 Maven 项目。
2. Project SDK 选择 JDK 17。
3. 在 Maven 面板刷新 `backend` 依赖。
4. 新建 Spring Boot Run Configuration：
   - Main class: `com.treehole.TreeholeApplication`
   - Working directory: `$PROJECT_DIR$/backend`
   - Environment variables: 从根目录 `.env` 复制需要的 `DB_*`、`REDIS_*`、`BACKEND_PORT`、`AI_API_KEY`
   - Active profiles: 默认可留空，应用会使用 `dev`；如需演示版可填 `demo`
5. 启动后端后，在 IDEA Terminal 中启动前端：

```bash
cd frontend
pnpm install
pnpm dev
```

IDEA 不会自动读取根目录 `.env`，除非安装并配置 dotenv 类插件；最稳妥的方式是在 Run Configuration 里显式填环境变量。

## 前端工程结构

前端已按功能边界拆分，避免继续堆叠超大组件：

- `src/components/home/`: 首页编排、发帖框、Feed、弹窗、管理入口。
- `src/components/business/`: 留言卡片、评论、告解亭、漂流瓶、意识图谱、能量商店等业务组件。
- `src/composables/`: 可复用业务逻辑，`feed/` 和 `graph/` 已按领域拆分。
- `src/api/modules/`: 按资源拆分的请求封装。
- `src/types/`: 核心领域类型与 API 类型。
- `src/assets/styles/`: `base`、`effects`、`skins`、`element-overrides`、`transitions` 分层样式。
- `src/tests/` 与 `*.test.ts`: Vitest 基础测试与测试环境初始化。

当前前端采用渐进式 TypeScript：API 请求层、feed 发布/分页/评论状态、发帖框、录音、音频处理与实时 WebSocket 逻辑已类型化，少量历史 store、图谱和大型业务组件仍保留 JavaScript。`HomeView` 已收敛为页面装配层，业务状态由 composables 管理，通用样式迁移到 `src/assets/styles/`。构建通过 Vite/Rolldown `manualChunks` 分包，`three` 与 `3d-force-graph` 已隔离到懒加载图谱 chunk，首屏主入口体积显著降低。

### 后端

```bash
cd backend
mvn spring-boot:run
```

或运行测试：

```bash
cd backend
mvn test
```

## 配置说明

### 关于 `FRONTEND_PORT`

- `FRONTEND_PORT` 控制的是 **Docker 中 frontend 容器对宿主机暴露的 HTTPS 端口**（`compose.yml` 的 443 映射）。
- 容器内 Nginx 固定监听 `80` 和 `443`：`80` 提供 HTTP，`443` 提供 HTTPS。
- 本地前端开发（`pnpm dev`）默认还是 5173，和 `FRONTEND_PORT` 无关。

### 关于 HTTPS 证书

- 前端容器会从 `storage/certs/origin.crt` 与 `storage/certs/origin.key` 读取源站证书。
- 若你使用 Cloudflare，推荐直接在面板生成 **Cloudflare Origin Certificate** 并保存到上述两个路径。
- 若只是临时联通测试，也可以先放置自签名证书，并将 Cloudflare `SSL/TLS` 模式设为 `Full`。

### 关于 `application-prod.yaml`

- 生产配置文件在 `backend/src/main/resources/application-prod.yaml`。
- 如果该文件被 `.gitignore` 忽略，团队协作时建议改为提交模板文件，再通过环境变量注入敏感配置。

## 常见问题排查

### 1) 数据库连接失败：`Access denied for user ... to database ...`

优先检查三项是否一致：

- `.env` 的 `DB_USER` / `DB_USER_PASSWORD` / `DB_NAME`
- `compose.yml` 中 db 服务环境变量
- backend 实际运行环境变量（可 `docker compose exec backend env | grep DB_`）

如果数据库是旧卷初始化的，改了账号或库名后需要重建 db 卷：

```bash
docker compose down
docker volume ls | grep treehole
# 确认后删除对应 volume，再重新 up -d --build
```

### 4) Redis 连接失败或实时统计为空

- 检查 `REDIS_HOST`、`REDIS_PORT` 是否与运行方式一致。
- 云端 Docker Compose 中后端应连接 `redis:6379`，本地开发通常连接 `/home/ember/infra` 暴露的 Redis 端口。
- 用 `docker compose ps` 确认 Redis 容器存在并处于运行状态。

### 5) 前端代理或 WebSocket 无响应

- 本地开发确认 Vite dev server 已启动，且后端运行在 `BACKEND_PORT` 对应端口。
- 云端确认前端容器 Nginx 已加载配置，`/api` 和 `/ws` 都能转发到后端。
- 浏览器控制台若出现 WebSocket 连接失败，优先检查域名协议、端口、防火墙和前端容器证书。

### 6) 环境变量缺失

- 复制 `.env.example` 为 `.env`，将 `<PLACEHOLDER>` 示例替换为本地或部署环境的真实值。
- 不要把真实密码、API Key、证书或私有地址写回仓库。

### 2) 后端日志报权限错误：`/app/logs/spring.log (Permission denied)`

```bash
cd /path/to/treehole
mkdir -p storage/logs storage/uploads

docker exec treehole-backend sh -lc 'id appuser'
# 例如返回 uid=1000 gid=1000

sudo chown -R 1000:1000 storage/logs storage/uploads
sudo chmod -R u+rwX,g+rwX storage/logs storage/uploads

docker compose restart backend
```

### 3) 为什么有时需要 `:5173`，有时不需要？

- 若服务映射到 5173，访问 `http://ip:5173`
- 若映射到 443，访问 `https://域名/` 或 `https://ip:443`

以 `docker compose ps` 里 frontend 的 `PORTS` 为准。

## 其他命令

```bash
# 停止服务
docker compose down

# 仅重建后端
docker compose up -d --build backend

# 启动缓存演示所需服务
docker compose up -d --build redis backend frontend

# 仅重启前端
docker compose restart frontend
```

## 最小生产发布清单

上线前至少确认以下 5 项：

- `.env` 已使用真实强密码与真实 `AI_API_KEY`，且未提交到仓库。
- `FRONTEND_PORT` / `BACKEND_PORT` 与防火墙、安全组放行规则一致。
- `docker compose ps` 显示 `db` 为 `healthy`，`backend`/`frontend` 为 `Up`。
- 已执行一次关键链路自测：打开首页、发留言、发评论、调用一个后端 API。
- `storage/logs` 与 `storage/uploads` 权限正确，`docker compose logs -f backend` 无持续报错。

## License

[MIT License](LICENSE)
