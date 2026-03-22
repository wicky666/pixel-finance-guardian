import { REPORT_WATERMARK_TEXT } from "@/lib/compliance";
import { getRealShadowPairs, getScenarios } from "./store";
import { getSanity } from "./sanityService";
import type { DateRangeInput, ReportData } from "./types";

export function getReportData(range?: DateRangeInput): ReportData {
  const scenarios = getScenarios(range);
  const pairs = getRealShadowPairs(range);
  const sanity = getSanity(range);
  const symbol = scenarios[0]?.symbol ?? "—";
  const lastPair = pairs[0];
  const impactSummary = lastPair
    ? `平均成本影响：${lastPair.impact.avgCostDiff}（得分 ${lastPair.impact.impactScore.toFixed(1)}）`
    : "暂无影响数据。";
  return {
    symbol,
    impactSummary,
    sanityScore: sanity.score,
    sanityLevel: sanity.level,
    scenariosCount: scenarios.length,
    disclaimer: REPORT_WATERMARK_TEXT,
    generatedAt: new Date().toISOString(),
  };
}
