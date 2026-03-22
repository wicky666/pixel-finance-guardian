# Refactor Scope — Salesforce-style FE/BE + 參考圖（盈鑑概覽 / 行為模式分析）

## Main loop (closed)
輸入持倉 → 成本模擬 → 保存方案 → 生成 Real/Shadow → 概覽看核心指標與近期快覽 → 影子賬戶看影響 → 行為分析看六大指標 → 報告生成與導出

- **概覽 (/)**: 核心指標 6 卡、累計影響曲線占位、入場情緒×勝率占位、近期模擬快覽表；數據來自 `getCoreMetrics()` + `getRecentScenariosForOverview()`。
- **成本模擬 (/sandbox)**: 表單 + 數學引擎 → 保存方案 → `saveScenario()` + `createRealShadowFromScenario()` (localStorage)。
- **影子賬戶 (/shadow)**: Real vs Shadow、Impact、趨勢、歷史。
- **行為分析 (/behavior)**: 日期範圍 + 生成完整報告按鈕；情緒分佈/入場理由勝率/持倉×盈虧三圖占位；理智值、觸發原因、24h 活動、六大行為指標（`getBehaviorIndicators()`）。
- **報告 (/report)**: 日期範圍 + 生成完整報告；摘要 + 水印 + 導出。

## Frontend (FE) — implemented
- **FE-01** `components/app`: TopNav, PageLayout; root layout uses pixel theme + TopNav.
- **FE-02** Existing Pixel UI (button, input, card, badge, progress, toast).
- **FE-03** Sandbox page: symbol, position, price, add amount/quantity, validation, realtime results.
- **FE-04** Scenario cards: save (max 3), delete, horizontal compare; data from `lib/services` store.
- **FE-05** Shadow page: Real vs Shadow table, Impact card, trend (impact score bars), history list.
- **FE-06** Behavior page: sanity progress + level badge, trigger reasons, 24h activity, low-score warning.
- **FE-07** Report page: summary (symbol, impact, sanity), watermark, disclaimer, export hint.
- **FE-08** `LoadingState`, `EmptyState`, `ErrorState` in `components/app`.

## Backend / Services (BE) — implemented
- **BE-01** Data model: existing Supabase types; MVP uses `lib/services/store` (localStorage).
- **BE-02** Math engine: existing `lib/math`.
- **BE-03** Scenario: `getScenarios`, `saveScenario`, `deleteScenario`, max 3 (store).
- **BE-04** Shadow: `createRealShadowFromScenario`, `getShadowHistory`, `getChartData`.
- **BE-05** Behavior: `getBehaviorAnalysis()` (24h counts, interval, message).
- **BE-06** Sanity: `getSanity()` (score, level, reasons).
- **BE-07** Compliance: existing constants + components.
- **BE-08** Report: `getReportData()` (symbol, impact, sanity, disclaimer, generatedAt).
