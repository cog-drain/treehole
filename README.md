# Treehole - 赛博树洞

[中文](README.md) | [English](README.en.md)

把说不出口的话，交给一片安静的赛博树洞。

Treehole 是一个全栈匿名表达与轻互动应用。它不是传统意义上的账号社区，也不要求用户先经营身份、关注关系或个人主页；用户可以直接生成匿名身份，写下一段留言、投递一只漂流瓶，或把更私密的内容放进 24 小时后过期的告解帖里。

项目围绕“发布、被看见、被回应、再回到现场”设计体验：留言可以带上图片、语音、情绪和主题效果；评论支持楼中楼回复和表情回响；WebSocket 会把新留言、新评论、通知和在线状态实时推到页面；标签订阅、漂流瓶、告解见证和意识图谱则让匿名内容不只是一次性沉底，而是能形成持续的回响。

工程上，Treehole 包含 Vue 3 前端、Spring Boot 后端、MariaDB/MySQL、Redis、WebSocket、Nginx、Docker Compose，以及 Windows 部署包。它既可以作为一个可演示的匿名社区产品，也适合作为前后端分离、缓存优化、实时通信和容器化部署的全栈实践项目。

亮点速览：

- 🕳️ 匿名表达：弱化身份压力，让用户先说出内容。
- 💬 实时回响：评论、通知、在线状态和活动事件即时更新。
- 🕯️ 情绪玩法：漂流瓶、告解帖、见证机制和 AI 温和回应。
- ⚙️ 工程完整：Redis 缓存与限流、Docker Compose 编排、Windows 部署 artifacts。

## 功能特性

- 📝 匿名留言：支持文本、图片、语音、情绪、语气模式和主题效果，适合快速记录当下想法。
- 💬 评论互动：支持楼中楼评论、表情回响、点赞和实时推送，让留言不只是静态展示。
- 🕯️ 告解帖：24 小时后过期，使用见证机制替代普通评论，并支持 AI 回应。
- 🧴 漂流瓶：投递、捞取和回复陌生人的片段，为匿名互动保留一点随机相遇感。
- 🏷️ 标签系统：AI 自动提取标签，支持热门标签、标签订阅和相关通知。
- ⚡ 实时体验：WebSocket 推送新留言、新评论、通知、在线人数和活动状态。
- 🧠 意识图谱：把留言、标签和情绪关系组织成可视化图谱，帮助观察社区内容脉络。
- 🧰 Redis 能力：缓存、限流、在线用户 ZSet、热度排行、漂流瓶候选池和互动统计。
- 📶 离线体验：前端可暂存断网留言，网络恢复后重试。
- 🪟 Windows 包：GitHub Actions 可生成完整 Windows 部署包和无 Redis 的 demo 包。

## 技术栈

- Backend: Java 17, Spring Boot 3, MyBatis-Plus, Spring Data Redis, WebSocket, springdoc-openapi
- Frontend: Vue 3, Vite 8, Pinia, Element Plus, Tailwind CSS 4, TypeScript, Vitest, vue-tsc
- Data: MariaDB 11 / MySQL 8, Redis 7
- Deployment: Docker Compose, Nginx, GitHub Actions, Windows native artifacts

## 项目结构

```text
.
  backend/                 Spring Boot 后端服务
  frontend/                Vue 3 + Vite 前端应用
  database/                数据库初始化脚本和可选演示数据
  deploy/windows/          Windows Nginx 配置与部署说明
  scripts/windows/         Windows 启动脚本
  storage/                 上传文件、日志、证书等运行时目录
  compose.yml              Docker Compose 编排
```

前端主要目录：

```text
frontend/src/
  api/                     请求封装与 resource modules
  assets/styles/           全局样式、效果、Element Plus 覆盖、过渡
  components/home/         首页编排、发帖框、Feed、弹窗、通知入口
  components/business/     留言、评论、告解、漂流瓶、图谱、商店
  composables/             业务逻辑 hooks
  stores/                  Pinia stores
  types/                   核心领域类型与 API 类型
  utils/                   工具函数
  views/                   页面入口
```

## 环境变量

复制模板并填写真实值：

```bash
cp .env.example .env
```

关键变量：

```env
DB_ROOT_PASSWORD=change-me-root-password
DB_USER=treehole_user
DB_USER_PASSWORD=change-me-user-password
DB_NAME=treehole

AI_API_KEY=your_ai_key

FRONTEND_PORT=443
BACKEND_PORT=23191
DB_PORT=3306
REDIS_PORT=6379
```

本地非 Docker 后端还可以按需设置：

```env
DB_HOST=127.0.0.1
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=
UPLOAD_PATH=../storage/uploads/
LOG_PATH=../storage/logs/
```

不要提交真实 `.env`、数据库密码、API Key、证书、私钥、运行日志或上传文件。

## 快速开始：Docker Compose

Docker Compose 会同时启动 MariaDB、Redis、后端和前端 Nginx。

```bash
docker compose up -d --build
```

首次启动时，MariaDB 容器会自动执行 `database/01_init.sql` 创建完整表结构。

查看状态和日志：

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f redis
```

访问地址：

- 前端 HTTP：`http://localhost`
- 前端 HTTPS：`https://localhost:${FRONTEND_PORT}`
- 后端 API：`http://localhost:${BACKEND_PORT}`

常用命令：

```bash
docker compose down
docker compose up -d --build backend
docker compose up -d --build frontend
docker compose exec redis redis-cli KEYS 'treehole::*'
```

## 数据库脚本

`database/` 只保留两类脚本：

- `01_init.sql`：全量初始化脚本，用于全新数据库。
- `02_test_data.sql`：可选演示数据，使用 `INSERT IGNORE`，可重复导入。

手动初始化数据库：

```bash
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_USER_PASSWORD" "$DB_NAME" < database/01_init.sql
```

导入演示数据：

```bash
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_USER_PASSWORD" "$DB_NAME" < database/02_test_data.sql
```

使用 Docker Compose 中的数据库导入演示数据：

```bash
docker compose exec -T db sh -lc 'MYSQL_PWD="$DB_USER_PASSWORD" mariadb -u"$DB_USER" "$DB_NAME"' < database/02_test_data.sql
```

## 本地开发

本地开发通常只用 Docker 启动数据库和 Redis，后端与前端分别由命令行或 IDE 运行。

```bash
docker compose up -d db redis
```

启动后端：

```bash
cd backend
set -a
. ../.env
set +a
mvn spring-boot:run
```

启动前端：

```bash
cd frontend
pnpm install
pnpm dev
```

前端开发服务器默认运行在 `http://localhost:5173`。`vite.config.ts` 会将 `/api`、`/uploads`、`/ws` 代理到后端端口，默认 `24191`。

## 开发约定

后端：

- 使用 Java 17 和 Spring Boot 3。
- Controller 保持薄层，业务逻辑放在 Service / ServiceImpl。
- MyBatis-Plus Mapper、Entity、DTO 按已有包结构扩展。
- Redis 相关能力优先复用现有 Realtime、Cache、限流和统计服务。

前端：

- 组件使用 PascalCase 文件名。
- 页面入口只负责装配，业务状态和副作用优先放入 composables。
- 优先复用 `src/types/`、`constants/`、`utils/`、Pinia store 和已有 API modules。
- 样式优先使用 Tailwind utility 和 `assets/styles/` 中的分层 CSS。
- 项目只维护当前浅色视觉体系，新增外观需沿用该体系。
- 图谱等重型视觉模块必须保持懒加载，避免回到大首屏 bundle。

TypeScript 状态：

- 项目采用渐进式 TypeScript，不是全量 TypeScript。
- API 请求、核心类型、Pinia stores、通知、标签订阅、离线队列、WebSocket、Feed 和部分 composables 已类型化。
- 避免一次性把所有 `.vue` 改为 `lang="ts"`；每次迁移都要保证 `pnpm type-check` 和 `pnpm test` 通过。

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

提交前建议执行：

```bash
cd backend && mvn test
cd ../frontend && pnpm test && pnpm type-check && pnpm build
```

前端测试覆盖基础工具、API modules、Feed 行为、通知、标签订阅、图谱 composables、录音、离线队列、身份、时间与存储工具。修改工具函数、API 合约、缓存/队列逻辑、composables 或解析逻辑时，应补充 Vitest 测试。

## VS Code 与 IDEA

仓库包含 `.vscode/launch.json` 和 `.vscode/tasks.json`，可用于启动后端、前端 dev server、测试和类型检查。

VS Code 推荐插件：

- Extension Pack for Java
- Vue - Official
- ESLint
- Prettier

IntelliJ IDEA：

1. 打开仓库根目录，或导入 `backend/pom.xml`。
2. Project SDK 选择 JDK 17。
3. 在 Maven 面板刷新依赖。
4. 新建 Spring Boot Run Configuration，Main class 填 `com.treehole.TreeholeApplication`。
5. 在 Run Configuration 中显式设置 `.env` 里的 `DB_*`、`REDIS_*`、`BACKEND_PORT`、`AI_API_KEY`。

## Windows 部署包

GitHub Actions 会生成两个 Windows artifact：

- `treehole-windows-${sha}.zip`：完整 Windows 原生部署包，需要 JDK 17、MySQL/MariaDB、Redis-compatible 服务和 Windows Nginx。
- `treehole-windows-demo-${sha}.zip`：演示包，只需要 JDK 17 和 MySQL/MariaDB；demo profile 用内存替代 Redis 运行时状态，不适合生产。

包内包含后端 jar、前端 `dist`、环境变量模板、启动脚本、数据库脚本和 Windows 部署说明。

## GitHub Actions

- `.github/workflows/ci.yml`：构建后端和前端。
- `.github/workflows/package-windows.yml`：生成 Windows 完整包和 demo 包。

## 常见问题

### 前端提示“树洞服务器开小差了”

这是后端返回了业务错误。优先查看后端日志，常见原因包括数据库未初始化、`.env` 指向错误数据库、Redis 连接失败或密码不匹配。

```bash
curl 'http://127.0.0.1:24191/api/messages?pageNum=1&pageSize=10'
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

Docker Compose 内部后端连接 `db:3306`；本地命令行后端通常连接 `127.0.0.1:3306`。

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
- 数据库已用 `database/01_init.sql` 初始化。
- Redis 可连接。
- `storage/uploads` 和 `storage/logs` 可写。
- 前端可访问，`/api`、`/uploads`、`/ws` 能正确到达后端。
- 已验证首页加载、发布留言、评论、上传文件、WebSocket 实时更新。
- 防火墙或安全组已开放必要端口。

## License

License 待补充。
