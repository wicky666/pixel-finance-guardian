# 组件功能说明

本文档列出项目中各组件及其具体功能，便于维护与扩展。

---

## 一、应用框架（components/app）

| 组件 | 路径 | 功能 |
|------|------|------|
| **TopNav** | `components/app/TopNav.tsx` | 顶部导航栏。展示站点名「像素财务守护」及主导航链接（首页、成本模拟、影子账户、行为刹车、报告）；当前路由高亮；粘顶、像素风边框与背景。 |
| **PageLayout** | `components/app/PageLayout.tsx` | 统一页面布局容器。提供最大宽度、内边距，可选页面标题（h1）与描述段落，保证各页视觉一致。 |
| **LoadingState** | `components/app/LoadingState.tsx` | 加载中状态。显示旋转圆环图标与可配置文案（默认「加载中…」），用于异步加载时的占位。 |
| **EmptyState** | `components/app/EmptyState.tsx` | 空状态。无数据时展示可配置标题（默认「暂无数据」）与可选描述，用于列表/详情无内容时的提示。 |
| **ErrorState** | `components/app/ErrorState.tsx` | 错误状态。展示错误标题（默认「出错了」）、可选详情与可选「重试」按钮，用于请求失败或异常时的提示。 |

---

## 二、像素风基础组件（components/ui）

| 组件 | 路径 | 功能 |
|------|------|------|
| **PixelButton** | `components/ui/PixelButton.tsx` | 像素风按钮。支持四种变体（primary/danger/neutral/ghost）、三种尺寸（sm/md/lg）；按下有位移反馈；支持 disabled、focus-visible 样式；可传 type/onClick 等原生属性。 |
| **PixelCard** | `components/ui/PixelCard.tsx` | 像素风卡片。面板背景与 2px 边框；可选标题栏（左上标题）；内容区内边距可选 none/sm/md。用于分组展示内容。 |
| **PixelInput** | `components/ui/PixelInput.tsx` | 像素风输入框。与原生 input 属性对齐；支持 label、error 文案；focus/disabled/error 状态样式；可与 PixelLabel 组合。 |
| **PixelLabel** | `components/ui/PixelLabel.tsx` | 表单标签。用于与 input 关联（htmlFor）；可选必填星号（required）；主色/次级文字样式。 |
| **PixelBadge** | `components/ui/PixelBadge.tsx` | 状态标签。小尺寸色块+边框，变体：success/danger/muted/accent。用于状态、分类标记。 |
| **PixelProgressBar** | `components/ui/PixelProgressBar.tsx` | 进度条。XP 条风格；支持 value/max、variant（default/success/danger）；可选显示百分比标签；用于理智值、完成度等。 |
| **PixelToast** | `components/ui/PixelToast.tsx` | 通知提示。展示 message、可选 title；变体 info/success/danger；可选 onClose。适合右上角短暂提示。 |
| **PixelAchievementToast** | `components/ui/PixelToast.tsx` | 成就风格提示。固定「Advancement Made」风格，展示标题与说明；用于游戏化成就类提示。 |
| **PageSection** | `components/ui/PageSection.tsx` | 页面区块。可选区块标题（h2）与描述；包裹 children，统一区块间距。 |

---

## 三、合规组件（components/compliance）

| 组件 | 路径 | 功能 |
|------|------|------|
| **ComplianceNotice** | `components/compliance/ComplianceNotice.tsx` | 合规免责展示。展示统一短句（如「仅数学模拟，不构成金融建议」）；支持 inline/block 变体；可覆盖文案或传入 children。 |
| **FormulaExplanationNotice** | `components/compliance/FormulaExplanationNotice.tsx` | 公式说明区块。默认展示成本均摊公式说明与「计算说明」标题；可自定义 title/text/children。用于模拟页底部说明。 |
| **ReportWatermark** | `components/compliance/ReportWatermark.tsx` | 报告强制水印。半透明、倾斜文案覆盖在报告区域上；不阻挡点击（pointer-events-none）；用于截图/打印时保留免责声明。 |

---

## 四、成本模拟功能组件（features/sandbox）

| 组件 | 路径 | 功能 |
|------|------|------|
| **SandboxForm** | `features/sandbox/SandboxForm.tsx` | 成本模拟输入表单。包含：标的代码、当前持仓股数、当前平均成本、当前市价；加仓方式切换「金额」/「股数」及对应输入。受控组件，通过 state + onStateChange 与页面同步。 |
| **SandboxResults** | `features/sandbox/SandboxResults.tsx` | 模拟结果展示。当输入有效时展示：新平均成本、每万元成本改善、回本需反弹百分比；无法计算时展示提示「请填写当前持仓与加仓金额或股数后查看结果」。纯展示，数据由页面传入。 |
| **ScenarioCards** | `features/sandbox/ScenarioCards.tsx` | 方案对比卡片列表。展示已保存方案（最多 3 个）；每卡显示标的、加仓金额、加仓股数、新平均成本、效率/万元、回本反弹；每卡支持删除。无数据时提示从上方保存方案。 |

---

## 五、页面（app）

| 页面 | 路径 | 功能 |
|------|------|------|
| **首页** | `app/page.tsx` | 展示产品名称与简介、主流程说明、快捷入口按钮（成本模拟、影子账户、行为刹车、报告、组件演示）。 |
| **成本模拟** | `app/sandbox/page.tsx` | 承载 SandboxForm、SandboxResults、保存方案按钮、ScenarioCards；从 store 读写方案，保存时生成 Real/Shadow 快照；底部合规与公式说明。 |
| **影子账户** | `app/shadow/page.tsx` | 展示最新 Real vs Shadow 表格、当前影响（标的、成本差、影响得分）、趋势条、历史记录列表；无数据时 EmptyState 提示。 |
| **行为刹车** | `app/behavior/page.tsx` | 展示理智值进度条与等级标签、触发原因列表、24 小时活动统计；理智值低于 60 时显示警告文案。 |
| **报告** | `app/report/page.tsx` | 报告区域带 ReportWatermark；展示结果摘要（标的、影响、理智值、等级、方案数、生成时间）；底部免责与导出提示。 |
| **组件演示** | `app/ui-demo/page.tsx` | 展示所有 Pixel UI 组件及变体、状态，用于开发与验收。 |

---

## 六、服务与工具（非 UI 组件）

| 模块 | 路径 | 功能 |
|------|------|------|
| **store** | `lib/services/store.ts` | 前端持久化（localStorage）。保存/读取/删除模拟方案（最多 3 个）、Real-Shadow 快照对；供闭环各页共享数据。 |
| **shadowService** | `lib/services/shadowService.ts` | 根据方案生成 Real/Shadow 快照并计算 Impact；提供历史列表与图表用数据结构。 |
| **behaviorService** | `lib/services/behaviorService.ts` | 统计 24h 模拟/保存次数、上次操作时间、间隔；判断节奏是否合理并返回提示文案。 |
| **sanityService** | `lib/services/sanityService.ts` | 根据行为统计计算理智值分数、等级（健康/注意/警告/严重）及触发原因列表。 |
| **reportService** | `lib/services/reportService.ts` | 组装报告数据：标的、影响摘要、理智值与等级、方案数、免责文案、生成时间。 |
| **合规常量** | `lib/compliance/constants.ts` | 统一免责、公式说明、水印等文案常量。 |
| **敏感词检查** | `lib/compliance/sensitive-wording.ts` | 检查文本是否包含建议买入/卖出等敏感措辞，返回是否命中及建议替换。 |
| **数学引擎** | `lib/math/sandbox.ts` | 纯函数：加仓金额→股数、新平均成本、每万元成本改善、回本反弹百分比；Decimal.js 精度，边界返回 null。 |

---

以上为当前站点各组件与核心模块的功能说明，新增或修改组件时建议同步更新本文档。
