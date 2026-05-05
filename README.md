# 🌌 Treehole - 赛博树洞

一个基于 **深色极简主义 (Dark Minimalism)** 与 **毛玻璃美学 (Glassmorphism)** 设计的全栈匿名交流平台。在这里，你可以放下现实的身份，倾诉心声，或在星海中拾取他人的回响。

---

## ✨ 核心特性

- **🎭 绝对匿名**：基于 UUID 的身份体系，无需注册，即开即用。支持身份密钥的备份与还原。
- **💸 能量经济系统 (Energy Store)**：发帖、点赞可赚取「能量(⚡)」，可用于在能量中心兑换特效装备。
- **✨ 赛博装扮系统**：购买并装备《攻壳机动队》光学迷彩、《女神异闻录5》UI 劫持等专属定制特效。
- **🌊 漂流瓶系统**：将秘密封装进瓶子投入大海，等待有缘人的捞取与回信。
- **🎧 禅模式 (Zen Garden)**：进入白噪音空间，聆听篝火与海浪，屏蔽外界干扰，专注内心的平静。
- **💊 离线胶囊**：断网时发布的心事会自动封存为胶囊，待网络恢复后自动发射。
- **🎙️ 拟态变声系统**：支持发送语音留言，并内置“黑客”、“深空”、“电流”等变声滤镜。
- **🤖 守望者 AI**：系统自带一个智能体潜伏在树洞中，会偶尔给出神秘的哲学回复与全局播报。

---

## 🛠️ 技术栈

### 后端 (Backend)
- **核心框架**：Spring Boot 3 + Java 17
- **持久层**：MyBatis-Plus
- **数据库**：MariaDB 11 / MySQL 8.0
- **AI 接入**：Google Gemini 2.0 (通过 Spring AI)
- **其他**：HuTool, Lombok, 全局异常拦截, RESTful 规范

### 前端 (Frontend)
- **框架**：Vue 3 (Composition API) + Vite
- **状态管理**：Pinia
- **样式**：Tailwind CSS + 原生 CSS 特效动画
- **图标**：Lucide-vue-next
- **包管理**：pnpm

---

## 🚀 生产级 Docker 部署

本项目已配置完善的多阶段构建 (Multi-Stage Build) 和反向代理 (Nginx)，非常适合一键部署至云服务器。

1. 确保服务器已安装 `Docker` 和 `docker-compose`。
2. 将项目源码克隆至服务器。
3. 在项目根目录执行：

```bash
docker-compose up -d --build
```

启动完成后：
- **前端页面**：`http://你的服务器IP/`
- 数据库端口已在内部隔离，极大增强了生产环境防御。

---

## 🎲 趣味测试数据注入 (可选)

如果你刚部署完项目，觉得页面空空如也，可以注入我们准备好的 **“趣味测试数据集”**。这会添加一些来自赛博朋克、动漫人物的趣味留言和互动。

在项目根目录运行以下命令：

```bash
docker exec -i treehole-db mysql -uroot -proot treehole < sql/test_data.sql
```
> 注：Windows 用户如果使用 PowerShell，请使用 `cmd /c "docker exec -i treehole-db mysql -uroot -proot treehole < sql\test_data.sql"`

刷新页面，你就能看到一个热闹的赛博树洞了！

---

## 💻 本地开发环境配置

### 后端运行
1. 进入目录：`cd backend`
2. 准备本地 MariaDB/MySQL 数据库。
3. 运行 `sql/init.sql` 初始化表结构（脚本在根目录）。
4. 修改根目录下的 `.env` 文件。
5. 运行 `mvn spring-boot:run` 或在 IDE 中启动。

### 前端运行
1. 进入目录：`cd frontend`
2. 安装依赖：`pnpm install`
3. 启动开发服务器：`pnpm dev`

---

## 🔐 隐藏的管理员模式

在输入框内输入 `sudo su - root` 并发布，即可唤醒超级管理员登录面板。
初始预设密码为 `admin123`。管理员可以强制删除违规内容，封禁/解封 IP。

---

## 📄 开源协议
[MIT License](LICENSE)
