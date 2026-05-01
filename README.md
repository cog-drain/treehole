# 🌌 Treehole - 匿名树洞

一个基于 **深色极简主义 (Dark Minimalism)** 与 **毛玻璃美学 (Glassmorphism)** 设计的全栈匿名交流平台。在这里，你可以放下身份，倾诉心声。

---

## ✨ 核心特性

- **视觉至上**：深度定制的深色模式，配合细腻的毛玻璃滤镜与丝滑的微交互反馈。
- **匿名纯粹**：基于 UUID 的身份体系，无需注册，即开即用。
- **功能丰富**：支持发布消息、评论回复、点赞互动、心情标签以及随机缘分匹配。
- **安全防御**：内置敏感词过滤与基于 IP/Token 的发布频率限制。
- **现代化架构**：前后端彻底分离，支持 Docker 一键部署。

---

## 🛠️ 技术栈

### 后端 (Backend)
- **核心框架**：Spring Boot 3
- **持久层**：MyBatis-Plus
- **数据库**：MariaDB / MySQL 8.0
- **工具类**：Lombok, HuTool
- **安全**：全局异常拦截, RESTful 响应规范

### 前端 (Frontend)
- **框架**：Vue 3 (Composition API)
- **样式**：Tailwind CSS
- **图标**：Lucide-vue-next
- **包管理**：pnpm (corepack)

---

## 📂 项目结构

```text
.
├── sql/                # 数据库初始化脚本
├── src/                # Spring Boot 后端源码
├── treehole-frontend/  # Vue 3 前端源码
├── uploads/            # 用户上传文件存储位 (Git 已忽略内容)
├── Dockerfile          # 后端镜像构建文件
└── docker-compose.yml  # 多容器一键部署配置
```

---

## 🚀 快速启动 (推荐使用 Docker)

如果你已安装 Docker 和 Docker Compose，只需运行：

```bash
docker-compose up -d --build
```

启动完成后：
- **前端地址**：`http://localhost`
- **后端 API**：`http://localhost:8080`
- **数据库**：`localhost:3307`

---

## 🛠️ 本地开发环境配置

### 后端运行
1. 准备 MariaDB/MySQL 数据库。
2. 运行 `sql/init.sql` 初始化表结构。
3. 修改 `src/main/resources/application.yml` 中的数据库连接信息。
4. 运行 `mvn spring-boot:run` 或在 IDE 中启动 `TreeholeBackendApplication`。

### 前端运行
1. 进入目录：`cd treehole-frontend`
2. 安装依赖：`pnpm install`
3. 启动开发服务器：`pnpm dev`

---

## 📝 开发规范
本项目遵循严格的开发规范：
- **后端**：必须使用 `com.treehole.common.Result` 包装返回结果。
- **前端**：禁止手写冗长 CSS，优先使用 Tailwind 实用类。
- **UI**：保持极简深色风格，容器需带有 `backdrop-blur-md` 效果。

---

## 📄 开源协议
[MIT License](LICENSE)
