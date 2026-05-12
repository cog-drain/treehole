# 🌳 Treehole Frontend - 赛博前沿手册

这是赛博树洞项目的前端工程档案。我们致力于将 **赛博朋克黑客美学** 与 **禅意极简主义** 相结合，通过现代化的前端技术栈提供极致且沉浸的交互体验。

---

## 🧪 核心架构与演进

- **Vue 3 (Composition API)**: 深度使用 `<script setup>` 与 `响应式 API`，逻辑完全解耦。
- **Tailwind CSS + Glassmorphism**: 抛弃繁杂的自定义 CSS 类，核心 UI 风格为“毛玻璃”，通过 `backdrop-blur-*` 和精细的 `border-white/10` 实现。
- **Tone & Atmosphere (语气与氛围渲染)**: 创新的消息渲染引擎，根据留言的 `mood` 字段（悄悄话、大声说、梦话、电波、诗意），通过纯 CSS 动态注入视觉滤镜与排版特性（定义在 `MessageCard.vue`）。
- **Offline Sync (离线暂存引擎)**: 使用 `offlineQueue.js` 封装的内存队列，支持在断网或后端不可用状态下暂存用户的灵感，并在网络恢复后自动进行重试。
- **Local vs Cloud State**: 采用渐进式持久化。用户的核心身份（Identity）和偏好会通过后端同步，而像能量值（Energy）、未结账的商品（Shop）等临时或单机状态则完全委托给 `appStore` 管理并存储于 `localStorage`。

---

## 📁 核心目录与骨架

- **`src/api/`**: 
  - `request.js`: 核心拦截器。自动拦截未鉴权状态，处理全局 `X-User-Id` 和 `X-Comment-Token` 的防刷验证。
  - `modules/`: 按领域拆分的 API 接口（`identity.js`, `messages.js` 等）。
- **`src/components/business/`**: 业务领域的灵魂。
  - `MessageCard.vue`: 最核心的渲染器。包含复杂的打字机动画、语气滤镜、标签高亮和快捷交互。
  - `AlterEgo.vue`: 智能助手终端，提供沉浸式的控制台体验。
  - `MindGraph.vue`: 3D 拓扑图，直观展示留言与标签之间的“共鸣得分”。
  - `DriftBottleDialog.vue`: 跨洋交互对话框，包含抛掷与打捞动画。
- **`src/stores/`**: 
  - 基于 Pinia 构建。其中 `user.js` 掌控身份与同步，`app.js` 掌控全局状态（黑暗模式、侧边栏、系统提示音等）。

---

## 🛠️ 工程化指令

### 1. 开发环境 (HMR)
```bash
pnpm install
pnpm dev
```
> **注意**：Vite 的 `proxy` 代理已自动配置。开发时只需确保后端在本地（默认端口 `24191`）运行，前端会自动将 `/api` 和 `/ws` 的流量完美转发。

### 2. 生产构建 (Build)
```bash
pnpm build
```
构建产物会输出至 `dist/` 目录。生产环境必须配合 Nginx 食用。

---

## 🔌 前端开发军规 (Guidelines)

1. **零弹窗原则 (Zero Pop-ups)**：尽可能使用内联展开（Inline Expand）或悬浮抽屉代替粗暴的模态框，保持用户的沉浸感（参考发布框的“语气选择器”重构）。
2. **RESTful 请求规范**：`api` 模块中的请求命名严格遵守语意（如 `api.getMessages`），并在前端层做好错误捕获，避免抛出 `Uncaught Promise`。
3. **样式优先级覆盖**：Element Plus 的默认样式较为生硬，如需修改，请统一使用全局变量覆写，或仅在必要时使用 `!important` 处理毛玻璃滤镜（见 `index.css`）。
4. **响应式断点**：项目采用 Mobile First（移动端优先）策略。开发新组件时，先写 `sm` 以下的样式，再用 `sm:`, `md:` 做大屏适配。

---

## 📄 隐藏特性与彩蛋

- **Zen Mode (禅定模式)**：在系统全局按下 `Z` 键，或在首页点击 🌙 图标，可快速隐藏所有多余的 UI 元素，并播放白噪音音频，进入极致的沉浸阅读状态。
- **Clipboard Fallback**: 考虑到开发环境大多为 `http://localhost`，剪贴板 API 采用了双重回退机制。如果 `navigator.clipboard` 因安全策略失效，系统会自动降级使用 `execCommand('copy')` 以保证开发体验。
