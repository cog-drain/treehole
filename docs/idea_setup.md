# Treehole (树洞) IDEA 开发与部署指南

这份指南将引导你完成「赛博树洞」项目的完整配置。

---

## 1. 环境基准 (Environment)

*   **JDK**: 17 (推荐 Amazon Corretto 或 Oracle JDK)
*   **Node.js**: v18+ (使用 `pnpm` 管理依赖)
*   **Database**: MySQL 8.0+
*   **Build Tool**: Maven 3.8+
*   **IDE**: IntelliJ IDEA 2023+ (需安装 Lombok 插件)

---

## 2. IDEA 项目初始化

### 2.1 导入模块
1.  启动 IntelliJ IDEA，选择 `Open`。
2.  **关键动作**：定位并选择项目根目录下的 **`backend`** 文件夹导入，IDEA 会自动识别 `pom.xml` 并构建依赖索引。
3.  进入 `File -> Project Structure`，确保 `Project SDK` 设置为 **Java 17**。

### 2.2 开启注解处理器 (Lombok)
进入 `Settings -> Build, Execution, Deployment -> Compiler -> Annotation Processors`，勾选 **Enable annotation processing**。

### 2.3 环境变量注入 (EnvFile)
由于项目采用零硬编码设计，必须注入环境变量：
1.  安装 IDEA 插件 **`EnvFile`**。
2.  在启动项 `TreeholeApplication` 的配置面板中，点击 `EnvFile` 选项卡。
3.  勾选 `Enable EnvFile`，添加根目录下的 `.env` 文件。

---

## 3. 项目结构导览

为了方便开发调试，请熟悉以下核心目录：

*   **`com.treehole.controller`**: REST 接口层，定义 API 路由。
*   **`com.treehole.service`**: 业务逻辑层，包含 AI 对话逻辑和漂流瓶状态机。
*   **`com.treehole.mapper`**: 数据持久层（MyBatis-Plus）。
*   **`com.treehole.config`**: 全局配置类（跨域、MyBatis 拦截器等）。
*   **`database/`**: 存放初始化 SQL (`01_init.sql`) 和测试数据 (`02_test_data.sql`)。

---

## 4. 数据库初始化

1.  根据 `.env` 文件中的配置，在 MySQL 中创建对应数据库（默认 `treehole`）。
2.  **执行顺序**：
    -   先运行 `database/01_init.sql` (创建表结构)。
    -   后运行 `database/02_test_data.sql` (填充赛博风测试数据)。

---

## 5. 项目构建与运行

### 5.1 本地调试
-   **后端**：运行 `TreeholeApplication.java`。
-   **前端**：进入 `frontend` 目录，执行 `pnpm install` 随后执行 `pnpm dev`。

### 5.2 生成作业 JAR 包 (Build Package)
若需提交可运行的二进制文件，在 IDEA Terminal 中执行：
```bash
cd backend
mvn clean package -DskipTests
```
生成的 JAR 包将位于 `backend/target/treehole-backend-1.0.0.jar`。

---

## 6. 常见问题 (Troubleshooting)
- **Maven 下载慢**：请在 IDEA 配置中将 Maven 镜像源指向阿里云镜像。
- **404 错误**：检查前端 `vite.config.js` 中的代理端口是否与后端 `application.yaml` 中的 `server.port` 一致。
- **MySQL 8.0 认证报错**：确保连接字符串中包含 `allowPublicKeyRetrieval=true`。
