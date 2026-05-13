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
- **📡 Redis 实时状态**：Redis 负责高频缓存、在线人数 ZSet、热度排行、漂流瓶池、表情回响统计与告解见证计数，WebSocket 推送实时在线与互动变化。
- **🧘 边缘体验增强**：断网离线暂存箱（网络恢复后自动重发）、专注禅定模式（白噪音+沉浸式阅读）。

## 📂 项目结构

- `backend/`: Spring Boot 3 + MyBatis-Plus + WebSocket + Redis
- `frontend/`: Vue 3 + Vite + Pinia + Tailwind CSS
- `database/`: 数据库初始化与测试数据脚本
- `storage/`: 运行时上传与日志目录
- `compose.yml`: Docker 一键编排（db/backend/frontend/redis）

## 🛠 技术栈

- **Backend**: Java 17, Spring Boot 3, MyBatis-Plus, Spring Data Redis
- **Frontend**: Vue 3, Vite, Element Plus, Tailwind CSS, Pinia, Lucide Icons
- **Database & Cache**: MariaDB 11, Redis 7
- **Realtime**: WebSocket

## 快速启动（Docker，推荐）

### 1. 准备 `.env`

在项目根目录创建 `.env`（可参考 `.env.example`）：

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

### 前端

```bash
cd frontend
pnpm install
pnpm dev
```

- 默认本地端口：`5173`
- 本地 `pnpm dev` 走 Vite 开发服务器，不走 Nginx

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
