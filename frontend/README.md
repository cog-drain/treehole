# 🌳 Treehole Frontend - 技术开发手册

这是赛博树洞项目的 Vue 3 前端部分，负责所有的 UI 交互、3D 视觉展示以及语音留言处理。

## 🧪 核心技术栈
- **Vue 3 (SFC)**: 使用 `<script setup>` 组合式 API。
- **Vite**: 极速构建工具。
- **Tailwind CSS**: 采用原子类样式的现代化布局。
- **Element Plus**: 负责基础 UI 组件（弹窗、表单等）。
- **3D-Force-Graph**: 基于 Three.js 的 3D 拓扑图，用于展现留言之间的“情感链接”。
- **Pinia**: 轻量化状态管理（管理用户头像配置、本地标识等）。

## 📁 关键目录说明
- `src/components/`: 高复用业务组件（如 `MessageCard.vue`）。
- `src/api/`: 基于 Axios 的接口请求封装。
- `src/views/`: 页面级组件（如 3D 广场、留言列表）。
- `public/audio/`: 本地留言配音缓存。

## 🛠️ 开发常用指令
### 本地热更新启动
```bash
pnpm dev
```
### 代码打包（产物位于 dist/）
```bash
pnpm build
```
### 本地预览构建产物
```bash
pnpm preview
```

## 🔌 代理调试
前端通过 `vite.config.js` 自动读取根目录 `.env` 中的 `BACKEND_PORT`。在开发模式下，所有 `/api` 请求会被自动转发至后端服务。
