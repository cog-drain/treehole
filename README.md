# 🌌 Treehole - 赛博树洞

一个基于 **深色极简主义 (Dark Minimalism)** 与 **毛玻璃美学 (Glassmorphism)** 设计的全栈匿名交流平台。在这里，你可以放下现实的身份，倾诉心声，或在星海中拾取他人的回响。

---

## ✨ 核心特性

- **🎭 绝对匿名**：基于 UUID 的身份体系，无需注册，即开即用。支持身份密钥的本地备份与跨设备还原。
- **🤖 Alter Ego (Danganronpa Theme)**：深度还原《弹丸论破》人工智能。内置 **[数据分析]** 与 **[希望注入]** 逻辑，通过 AI 实时对抗用户的“绝望感”。
- **📥 回响中心 (Echo Center)**：基于 WebSocket 的实时回响系统。当你的漂流瓶被捞起并回复时，回响将穿透深海，实时推送到你的屏幕。
- **🌊 漂流瓶系统**：异步社交核心。支持投掷、随机捞取、匿名回复及“扔回大海”的持有逻辑。
- **💸 能量经济系统 (Energy Store)**：发帖、互动可赚取「能量(⚡)」，可用于兑换 UI 劫持特效、光学迷彩等赛博装扮。
- **🎧 禅模式 (Zen Garden)**：集成沉浸式白噪音播放器（篝火、海浪、雨声），结合三维力导向图 (3D Force Graph) 视觉化展示心情。
- **💊 离线胶囊 (Offline Sync)**：内置本地 IndexedDB 缓存队列。断网时发布的心事会自动封存，并在检测到网络恢复后以 300ms 间隔有序发射。

---

## 🛠️ 技术栈

### 后端 (Backend)
- **核心框架**：Spring Boot 3 + Java 17
- **持久层**：MyBatis-Plus (支持单表主键映射与关联表操作)
- **数据库**：MySQL 8.0 (字符集: `utf8mb4`)
- **实时通信**：Jakarta WebSocket + Jackson JSR310 (Java 8 时间序列化支持)
- **AI 接入**：智谱 AI (GLM-4-Flash) 语义分析与对话生成

### 前端 (Frontend)
- **核心架构**：Vue 3 (Composition API) + Vite + Pinia
- **设计语言**：Tailwind CSS + Element Plus (Deeply Customized)
- **视觉增强**：Lucide Icons + 3D Force-Directed Graphs
- **包管理**：pnpm

---

## 🚀 生产级 Docker 部署

本项目已配置完善的多阶段构建 (Multi-Stage Build) 和反向代理，确保镜像极简化。

1. **环境准备**：确保服务器已安装 `Docker` 和 `docker-compose`。
2. **环境变量**：在根目录创建 `.env` 文件，配置数据库及 AI API Key。
   - `DB_ROOT_PASSWORD`：仅用于 MariaDB root 账户初始化
   - `DB_USER` / `DB_USER_PASSWORD` / `DB_NAME`：后端业务连接数据库使用
3. **一键启动**：
   ```bash
   docker-compose up -d --build
   ```
4. **访问服务**：
   - 前端：`http://your-server-ip/`
   - 后端 API：`http://your-server-ip/api`

---

## 💻 本地开发指南 (Windows / WSL 2)

### 后端启动
1. **依赖环境**：WSL 2 运行 Docker 容器 `mysql-global`。
2. **初始化**：运行根目录 `sql/init.sql`。
3. **环境变量**：
   ```powershell
   $env:AI_API_KEY='你的Key';
   $env:DB_USER='root'; $env:DB_USER_PASSWORD='root';
   # 若本地需要以 root 初始化数据库，再设置:
   # $env:DB_ROOT_PASSWORD='root'
   mvn spring-boot:run
   ```

### 前端调试
1. **安装依赖**：`pnpm install`
2. **启动预览**：`pnpm dev` (默认端口 `5173`)
3. **代理逻辑**：Vite 代理已配置 `/api` 和 `/ws` 至后端端口 `24191`。

---

## 🔐 隐藏机制
- **管理员面板**：在留言框输入 `sudo su - root` 即可唤醒隐藏登录入口。
- **变声滤镜**：发布语音时，按住 `Ctrl` 键可触发随机的“数字崩坏”音频混响特效。

---

## 📄 开源协议
[MIT License](LICENSE)
