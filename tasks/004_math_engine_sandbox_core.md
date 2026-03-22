# 任务名称
实现成本模拟核心数学引擎（Sandbox Math Engine）

## 任务目标
实现“加仓成本推演引擎”的核心数学逻辑，要求精确、纯净、可测试。
这是整个产品最核心的底层能力，所有计算必须可靠。

## 产品背景
这个模块用于帮助用户回答：
1. 如果我继续加仓，我的新平均成本是多少？
2. 我每投入一笔钱，成本改善了多少？
3. 当前价格反弹多少，我才能回本？

这不是预测模块，而是数学推演模块。

## 技术要求
- 使用 TypeScript
- 所有金融/价格/成本计算必须使用 `decimal.js`
- 不允许直接依赖 JS 原生浮点进行核心计算
- 核心函数必须设计为纯函数
- 必须编写单元测试

## 本任务要实现的核心函数
请在 `lib/math/sandbox.ts` 或类似位置实现以下函数：

### 1. calculateAddQuantityFromAmount
根据加仓金额和当前价格，计算加仓股数

输入建议：
- addAmount
- currentPrice

输出：
- addQuantity

请明确处理：
- 是否允许小数股
- 如果不允许，使用何种取整策略
- 如果允许，也请说明保留位数策略

### 2. calculateNewAverageCost
根据已有持仓和新加仓信息，计算新的平均成本

公式：
Cn = (Q0 * C0 + Q1 * P) / (Q0 + Q1)

输入建议：
- currentQuantity (Q0)
- currentAverageCost (C0)
- addQuantity (Q1)
- currentPrice (P)

输出：
- simulatedAverageCost

### 3. calculateCostImprovementEfficiency
计算每投入 1 万资金，平均成本下降了多少

建议公式：
E = (C0 - Cn) / (A1 / 10000)

输入建议：
- originalAverageCost
- newAverageCost
- addAmount

输出：
- efficiency

### 4. calculateBreakevenReboundPct
计算从当前价格反弹多少百分比才能平本

公式：
breakeven = Cn / P - 1

输入建议：
- newAverageCost
- currentPrice

输出：
- reboundPct

## 需要处理的边界情况
请明确并实现对以下情况的处理：
- currentQuantity = 0
- currentPrice <= 0
- addAmount <= 0
- addQuantity <= 0
- currentAverageCost < 0
- 分母为 0
- 非法输入或缺失输入

## 保留位数要求
请为以下结果设计合理的默认保留位数策略：
- 股数
- 平均成本
- 效率值
- 百分比

请保持策略一致，不要让不同函数各自随意处理。

## 输出结果
你需要输出：
1. 数学引擎代码
2. 单元测试
3. 必要的类型定义
4. 对关键边界处理的说明

## 验收标准
- 所有核心计算都使用 decimal.js
- 核心函数尽量纯净、无副作用
- 测试覆盖正常情况与边界情况
- 代码结构清晰，便于前端 UI 和后端逻辑复用
- 不夹杂任何 UI 逻辑
- 不出现任何“建议买入/卖出”的文字

## 编码要求
- 代码可读性强
- 用英文写简短注释
- 不要过度封装
- 可以增加辅助函数，但要保持简单
