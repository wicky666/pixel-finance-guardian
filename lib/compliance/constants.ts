/**
 * Compliance copy — single source of truth.
 * Use these constants everywhere; do not inline financial disclaimers.
 */

/** System-level mandatory line (logs / internal) */
export const SYSTEM_DISCLAIMER =
  "[SYSTEM] This is a mathematical simulation. Not a financial recommendation.";

/** Short disclaimer for headers / banners（用户可见） */
export const SHORT_DISCLAIMER =
  "仅数学模拟，不构成金融建议。";

/** Footer text for simulation pages */
export const FOOTER_MATH_NOTICE =
  "结果基于公式与您的输入，不含价格预测或交易建议。";

/** Text for report watermark / share screens */
export const REPORT_WATERMARK_TEXT =
  "数学模拟 · 非金融建议";

/** Formula explanation block (cost averaging) */
export const FORMULA_EXPLANATION_COST_AVG =
  "新平均成本 = (原持仓数量 × 原平均成本 + 加仓数量 × 加仓价格) / (原持仓数量 + 加仓数量)。纯算术，无预测。";
