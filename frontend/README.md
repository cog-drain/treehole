# 🌳 Treehole Frontend - 赛博前端手册

这是赛博树洞项目的 Vue 3 前端部分。我们致力于将 **赛博朋克黑客美学** 与 **禅意极简主义** 相结合，通过现代化的前端技术栈提供极致的交互体验。

---

## 🧪 核心技术演进

- **Vue 3 (Composition API)**: 深度使用 `<script setup>` 模式，逻辑解耦更彻底。
- **Tailwind CSS + Glassmorphism**: 核心 UI 风格为“毛玻璃”，通过 `backdrop-blur-md` 和精细的 `border-white/10` 实现。
- **Alter Ego Terminal**: 独立的终端仿真组件，支持动态打字机效果与矩阵背景动画。
- **3D Force-Directed Graph**: 广场模式采用基于 Three.js 的 3D 拓扑图，直观展示留言之间的“共鸣得分”。
- **Offline Sync (IndexedDB)**: 使用 `offlineQueue.js` 封装的请求队列，支持在断网状态下通过本地存储（Dexie/LocalForage 思想）封存留言。

---

## 📁 目录结构精解

- **`src/api/`**: 
  - `request.js`: 核心拦截器，自动从本地 `Identity` 模块提取 `userId` 并注入请求头 `X-User-Id`。
  - `modules/`: 按业务模块（留言、漂流瓶、AI）拆分的 API 定义。
- **`src/components/business/`**: 强业务关联组件。
  - `AlterEgo.vue`: 智能助手终端。
  - `DriftBottleDialog.vue`: 复杂的跨海洋交互对话框。
  - `EnergyStore.vue`: 装饰品兑换中心。
- **`src/utils/`**: 
  - `offlineQueue.js`: 离线同步引擎，处理网络恢复后的重发逻辑。
  - `time.js`: 统一的时间格式化处理。

---

## 🛠️ 工程化指令

### 1. 开发调试
```bash
pnpm install
pnpm dev
```
> **注意**：Vite 代理已配置。开发时确保后端服务在端口 `24191` 运行，前端会自动将 `/api` 和 `/ws` 请求转发过去。

### 2. 构建与部署
```bash
pnpm build
```
构建产物将位于 `dist/` 目录。项目中已包含专用的 `Dockerfile`，支持生产环境下由 Nginx 提供静态资源服务。

---

## 🔌 关键开发规范

1. **RESTful 命名**：在调用 `api` 模块时，请严格遵守复数路径规范（如 `api.getMessages` 而非 `/message`）。
2. **WebSocket 交互**：通过 `useWebSocket.js` 钩子管理连接。请注意，生产环境下的路径转发需配合 Nginx 的 `Upgrade` 请求头。
3. **样式优先级**：为了实现毛玻璃效果，部分 Element Plus 组件使用了 `!important` 覆盖。修改样式时请参考 `index.css` 中的全局变量。

---

## 📄 隐藏特性
- **Zen Mode (禅模式)**：在广场页面按下 `Z` 键，可快速隐藏所有 UI 元素，仅保留 3D 背景与白噪音音频。
