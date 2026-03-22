# 单体仓库结构（对齐 aiforce 三端思路）

参考你 GitHub 上的 [aiforce-web](https://github.com/wicky666/aiforce-web)、[aiforce-admin](https://github.com/wicky666/aiforce-admin)、[aiforce-api](https://github.com/wicky666/aiforce-api)：**对外站点、管理后台、接口服务分目录管理**，便于独立部署与权限隔离。

| 目录 | 包名 | 说明 |
|------|------|------|
| 仓库根目录 | `pixel-finance-guardian` | **用户端 Web**（Next.js App Router），主产品界面 |
| `apps/api` | `@pfg/api` | **后端 API**（NestJS），当前为内存存储 + 可接 PostgreSQL |
| `apps/admin` | `@pfg/admin` | **管理端**（Vite + React），MVP 只读列表 |
| `packages/config` | `@pfg/config` | **共享环境变量 schema**（Zod），占位与文档对齐 |
| `packages/shared` | `@pfg/shared` | 共享类型（可继续扩展） |
| `supabase/`、`db/migrations/` | — | 历史/独立 PG 迁移脚本 |

## 常用命令

```bash
# 用户端
npm run dev

# API
npm run api:dev

# 管理端
npm run admin:dev
```

## 环境变量

见根目录 `.env.example`。原则：**未配置的项用默认或本地假数据，但键名固定**，上线只改环境变量即可。
