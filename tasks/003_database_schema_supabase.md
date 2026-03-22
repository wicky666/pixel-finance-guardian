# 任务名称
设计并实现 Supabase/PostgreSQL 数据模型（Database Schema）

## 任务目标
为“AI 成本模拟器 & 行为约束系统”设计第一阶段可用的数据表结构，支持以下 MVP 功能：
1. 持仓信息
2. 模拟方案保存
3. 影子账户快照
4. 行为事件记录
5. 后续扩展用户系统、Vision 分析、社交广场

## 产品背景
本产品不是券商交易系统，不存储真实身份敏感信息。
数据库应围绕“模拟记录”和“行为复盘”设计，而不是围绕“真实账户身份”设计。

需要遵守：
- 仅存储业务必要数据
- 避免与真实身份证、实名信息绑定
- 支持数学模拟与行为分析
- 支持未来扩展 AI 分析和社交功能

## 技术要求
- 使用 PostgreSQL / Supabase
- 输出 SQL schema 或 Supabase migration
- 设计表关系清晰
- 合理使用 timestamp
- 合理预留 JSONB 字段
- 命名清晰一致

## 本任务需要设计并实现的表
### 1. portfolios
用于保存一个用户的某个标的持仓基础信息

建议字段：
- id
- user_id
- symbol
- current_quantity
- average_cost
- created_at
- updated_at

### 2. simulation_scenarios
用于保存一次成本模拟方案

建议字段：
- id
- portfolio_id
- current_price
- add_amount
- add_quantity
- simulated_avg_cost
- cost_improvement_efficiency
- breakeven_rebound_pct
- created_at

### 3. real_snapshots
用于记录用户执行该模拟操作后的“现实快照”

建议字段：
- id
- portfolio_id
- scenario_id
- quantity
- avg_cost
- cash_spent
- snapshot_price
- created_at

### 4. shadow_snapshots
用于记录如果用户当时什么都不做的“影子快照”

建议字段：
- id
- portfolio_id
- scenario_id
- quantity
- avg_cost
- cash_spent
- snapshot_price
- created_at

### 5. behavior_events
用于记录行为相关事件，例如：
- 模拟
- 保存方案
- 连续补仓
- 高频操作预警

建议字段：
- id
- user_id
- portfolio_id
- event_type
- metadata_json
- created_at

### 6. user_profiles
预留基础用户资料

建议字段：
- id
- user_id
- nickname
- avatar_seed
- survival_level
- created_at
- updated_at

## 可选预留表（如果你认为结构合理，也可以一并建立）
- vision_analyses
- posts
- comments
- likes

但请注意：
本次重点是先把 MVP 所需表建好，不要为了“未来可能用到”而做过度复杂设计。

## 还需要完成的内容
1. 为关键字段添加合理约束
2. 添加必要索引
3. 设计外键关系
4. 为时间字段设置默认值
5. 输出一个简洁的 db access 基础层（如 `lib/db` 占位）
6. 如适合，可补充 TypeScript 类型定义

## 输出结果
你需要输出：
1. SQL schema 或 migration
2. 表关系说明
3. 基础 db 文件或访问层占位代码
4. 必要的类型定义

## 验收标准
- 表结构能支持 MVP 需求
- 字段命名统一
- 外键关系合理
- 可以支持 scenario -> real/shadow snapshot 的双快照关系
- behavior_events 支持未来扩展不同事件类型
- 不包含真实敏感身份字段
- 不做不必要的过度建模

## 编码要求
- 结构清晰
- 注释简洁
- 如果使用 JSONB，必须解释它的用途
- 不要把业务逻辑写进 migration
