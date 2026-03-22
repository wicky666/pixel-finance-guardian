# Schema 表关系说明

## 表关系图（文字）

```
user_profiles (id, user_id UNIQUE, ...)
       ↑
       │ user_id (logical; no FK to auth in migration)
       │
portfolios (id, user_id, symbol UNIQUE(user_id,symbol), ...)
       │
       ├── simulation_scenarios (portfolio_id → portfolios.id, CASCADE)
       │         │
       │         ├── real_snapshots (scenario_id → simulation_scenarios.id, UNIQUE per scenario)
       │         └── shadow_snapshots (scenario_id → simulation_scenarios.id, UNIQUE per scenario)
       │
       └── behavior_events (portfolio_id → portfolios.id, SET NULL on delete)
                 (user_id 仅逻辑关联，不存敏感身份)
```

## 说明

- **user_profiles**：预留用户资料；`user_id` 后续可关联 `auth.users(id)`，当前无 FK。
- **portfolios**：每个用户每个标的一条记录，`UNIQUE(user_id, symbol)`。
- **simulation_scenarios**：一次成本模拟方案，归属一个 portfolio；删除 portfolio 时级联删除。
- **real_snapshots**：用户执行该方案后的“现实”快照，每个 scenario 一条。
- **shadow_snapshots**：用户当时什么都不做的“影子”快照，每个 scenario 一条。
- **behavior_events**：行为事件日志，`event_type` + `metadata_json` 可扩展；`portfolio_id` 可为空，删除 portfolio 时置为 NULL。

## 外键与索引

- 外键见 migration；时间字段均 `DEFAULT now()`。
- 索引：各表按 `user_id` / `portfolio_id` / `scenario_id` / `created_at` 查询已建索引；`behavior_events.metadata_json` 使用 GIN 以支持 JSON 查询。
