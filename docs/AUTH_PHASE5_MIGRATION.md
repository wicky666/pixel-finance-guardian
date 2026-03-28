# Phase 5 手动迁移步骤（Auth 持久化到 PostgreSQL）

## 1) 配置环境变量
在 `.env.local` / 部署环境中至少配置：

- `DATABASE_URL`
- `AUTH_SECRET`
- `SESSION_COOKIE_NAME`（默认 `pfg_session`）
- `AUTH_SESSION_TTL_HOURS`（默认 `168`）
- `SUPER_ADMIN_EMAIL`（可选，首次引导）
- `SUPER_ADMIN_PASSWORD`（可选，首次引导）
- `DB_SSL`（生产常为 `true`）
- `DB_POOL_MAX`

## 2) 执行数据库迁移
使用 psql 手动执行：

```bash
psql "$DATABASE_URL" -f db/migrations/001_init_postgres.sql
psql "$DATABASE_URL" -f db/migrations/002_auth_persistence.sql
```

> 若 001 已执行过，只执行 002 即可。

## 3) 启动 API 并验证
```bash
npm run api:dev
```

验证接口：

1. 注册：`POST /api/auth/register`
2. 登录：`POST /api/auth/login`（应收到 `Set-Cookie`）
3. 当前会话：`GET /api/auth/me`
4. 登出：`POST /api/auth/logout`

## 4) 首个 super_admin
若 `users` 中尚无 `super_admin`，且配置了 `SUPER_ADMIN_EMAIL + SUPER_ADMIN_PASSWORD`，服务启动后会自动创建（或提升同邮箱用户）。

## 5) 回滚策略
如需紧急回退：
1. 使用上一版 API 镜像（内存 Auth）
2. 保留本次新增表，不影响旧代码运行
