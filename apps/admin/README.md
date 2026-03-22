# @pfg/admin

管理端 MVP：只读展示后端内存中的模拟记录与影子对照。

- 本地开发：`npm run admin:dev`（在 monorepo 根目录执行）
- 默认通过 Vite 代理将 `/api` 转发到 `http://localhost:3100`
- 生产环境：构建前设置 `VITE_API_BASE_URL=https://your-api.example.com`
