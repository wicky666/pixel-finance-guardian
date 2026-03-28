# @pfg/admin

管理端控制台：聚合展示后端内存中的模拟记录与影子对照，并支持配置与运维操作。

- 本地开发：`npm run admin:dev`（在 monorepo 根目录执行）
- 默认通过 Vite 代理将 `/api` 转发到 `http://localhost:3100`
- 生产环境：构建前设置 `VITE_API_BASE_URL=https://your-api.example.com`
- 新增能力：
  - 仪表盘总览（指标、服务状态、最新影子对照）
  - 配置中心（环境、默认复盘策略、功能开关、风控规则）
  - 运维中心（任务执行、活动时间线）
