# Pixel Finance Guardian

Math simulation and behavior review tool. Cost analysis and decision impact—no price predictions, no trading advice.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Runtime:** Node.js
- **Math:** decimal.js (all cost/finance calculations)
- **Validation:** zod
- **Backend:** NestJS（`apps/api`），可选 PostgreSQL / Redis / OSS（见 `.env.example`）
- **Admin:** Vite + React（`apps/admin`），对齐 aiforce 三端拆分思路，现已提供配置与运维控制台
- **UI utilities:** clsx, tailwind-merge, react-hook-form

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)。

可选：在 `.env.local` 设置 `NEXT_PUBLIC_API_BASE_URL=http://localhost:3100`，保存模拟时会同步到后端内存（管理端可见）。

## Phase 1 Backend (NestJS)

```bash
# Start backend API
npm run api:dev
```

API default:
- `http://localhost:3100/api/health`
- `http://localhost:3100/swagger`

## Admin（管理端）

```bash
npm run admin:dev
```

默认 [http://localhost:5173](http://localhost:5173)，通过 Vite 代理访问 `/api`。

当前管理端能力：
- 总览驾驶舱：查看 API 健康、模拟/影子对照指标、告警任务
- 系统配置：环境、时区、默认复盘策略、功能开关、风控阈值
- 运维作业：手动执行审计/同步/守卫任务，并查看活动时间线

## 文档导航

| 文档 | 说明 |
|------|------|
| [项目全览](./docs/项目全览.md) | 项目做什么、能干什么、结构怎么理解 |
| [本地测试指南](./docs/本地测试指南.md) | 一步步在本地跑起来并自测 |
| [Monorepo 说明](./docs/MONOREPO.md) | 三端目录与命令 |
| [任务完成度](./docs/TASKS_STATUS.md) | tasks 002–006 对照 |

## Monorepo 说明

详见 [docs/MONOREPO.md](./docs/MONOREPO.md)。

## Scripts

| Command       | Description        |
| ------------- | ------------------ |
| `npm run dev` | Start dev server   |
| `npm run build` | Production build |
| `npm run start` | Start production  |
| `npm run lint` | Run ESLint        |
| `npm run api:dev` | Start NestJS API |
| `npm run api:build` | Build NestJS API |
| `npm run admin:dev` | Start admin (Vite) |
| `npm run admin:build` | Build admin |
| `npm run clean` | 清 Next 缓存（白屏/500 时用） |
| `npm run test` | 单元测试 |

## Project Structure

- `app/` — Next.js App Router pages and layouts（用户端 Web，等同 aiforce-web 角色）
- `components/` — Shared UI components
- `features/` — Feature modules (sandbox, shadow, behavior, vision, social, report)
- `lib/` — Utilities (math, db, compliance, ai, utils)
- `public/` — Static assets
- `styles/` — Global CSS
- `tasks/` — Task and docs
- `apps/api` — NestJS API（aiforce-api 角色）
- `apps/admin` — 管理端（aiforce-admin 角色）
- `packages/config` — 环境变量 schema（可配置占位）

## Environment

复制 `.env.example` 为 `.env.local`（Web）并在 `apps/api` 使用同名变量或进程环境变量。未填项使用默认/本地假数据，键名保持稳定便于上线切换。
