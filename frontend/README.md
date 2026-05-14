# Treehole Frontend

赛博树洞前端是一个 Vue 3 + Vite 应用，负责匿名留言、评论楼中楼、告解亭、漂流瓶、意识图谱、能量商店、离线暂存和实时状态展示。

## 技术栈

- Vue 3 Composition API
- Vite 8 / Rolldown
- Pinia
- Element Plus
- Tailwind CSS 4
- Lucide Icons
- TypeScript-ready: `vue-tsc` + `src/types/`
- Vitest baseline tests
- Three.js / 3d-force-graph 用于意识图谱，按懒加载 chunk 分离

## 目录结构

```text
src/
  api/                  请求封装与 resource modules
  assets/styles/        base/effects/skins/element-overrides/transitions
  components/
    home/               首页编排、发帖框、Feed、弹窗、管理入口
    business/           留言、评论、告解、漂流瓶、图谱、商店
    common/             通用组件
    zen/                禅定模式特效
  composables/          业务逻辑 hooks
    feed/               Feed 分页、发布、评论行为
    graph/              3D 图谱逻辑
  constants/            常量与枚举，已迁移 TS
  stores/               Pinia stores
  tests/                Vitest setup
  types/                核心领域类型与 API 类型
  utils/                工具函数
  views/                页面入口
```

## 常用命令

```bash
pnpm install
pnpm dev
pnpm build
pnpm type-check
pnpm test
pnpm preview
```

开发服务器默认端口是 `5173`。`vite.config.js` 会把 `/api`、`/uploads`、`/ws` 代理到后端端口，默认 `24191`。

## 工程约定

- 新组件使用 PascalCase 文件名，复杂功能优先拆到领域目录，例如 `business/message/`、`business/comment/`、`home/compose/`。
- 业务逻辑优先放入 composables，页面组件只做装配和事件转发。
- 优先复用现有 `src/types/`、`constants/`、`utils/`，不要重复定义临时结构。
- 样式优先使用 Tailwind utility 和现有分层 CSS；Element Plus 覆盖放入 `assets/styles/element-overrides.css`。
- 不再引入暗色主题；新增外观只需要适配当前浅色体系。
- 重型视觉模块必须懒加载，避免回到大首屏 bundle。

## 测试策略

当前测试覆盖基础工具与解析逻辑：

- `utils/time`
- `utils/storage`
- `utils/clientIdentity`
- `utils/offlineQueue`
- `constants/reactions`

修改工具、离线队列、解析函数、API 合约或 composables 时，优先补 Vitest 测试。UI 变更至少运行：

```bash
pnpm test
pnpm type-check
pnpm build
```

## TypeScript 状态

项目处于 TS-ready 阶段，不是全量 TypeScript。当前已有：

- `tsconfig.json`
- `tsconfig.app.json`
- `env.d.ts`
- `src/types/`
- `vue-tsc --build --force`

推荐迁移顺序：

1. `api/request` 与 `api/modules`
2. `composables/feed`
3. `useRecorder`、`useWebSocket`、`audioProcessor`
4. 小型 Vue 组件
5. 大型业务组件

避免一次性把所有 `.vue` 改为 `lang="ts"`。

## Bundle 说明

Vite 构建使用 `manualChunks` 分包：

- `vue-vendor`: Vue / Pinia
- `ui-vendor`: Element Plus / Lucide
- `graph-vendor`: Three.js / 3d-force-graph
- `visual-vendor`: DiceBear / D3

`graph-vendor` 体积较大是预期结果，因为它承载 3D 图谱依赖；它已从首屏入口中隔离。

## 后续优化建议

- API 层类型化，收紧响应结构。
- 为 `useFeedMessages`、`useCommentActions`、`useRecorder` 增加测试。
- 清理未使用静态资产。
- 逐步迁移核心 composables 到 TypeScript。
