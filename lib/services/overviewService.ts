import { getRealShadowPairs, getScenarios } from "./store";
import type { CoreMetrics, DateRangeInput, TrendPoint } from "./types";

export function getCoreMetrics(range?: DateRangeInput): CoreMetrics {
  const scenarios = getScenarios(range);
  const pairs = getRealShadowPairs(range);
  const total = pairs.reduce((sum, p) => sum + p.impact.impactScore, 0);
  const positive = pairs.filter((p) => p.impact.impactScore >= 0).length;
  const negative = pairs.length - positive;
  const winRate = pairs.length > 0 ? `${((positive / pairs.length) * 100).toFixed(1)}%` : "0%";
  const avgWin =
    positive > 0
      ? pairs.filter((p) => p.impact.impactScore >= 0).reduce((s, p) => s + p.impact.impactScore, 0) /
        positive
      : 0;
  const avgLoss =
    negative > 0
      ? Math.abs(
          pairs
            .filter((p) => p.impact.impactScore < 0)
            .reduce((s, p) => s + p.impact.impactScore, 0) / negative
        )
      : 0;
  const ratio = avgLoss > 0 ? (avgWin / avgLoss).toFixed(1) : "0.0";
  const expected = pairs.length > 0 ? (total / pairs.length).toFixed(2) : "0";
  return {
    totalReturn: total.toFixed(2),
    winRate,
    winLossCount: `${positive} 胜 ${negative} 负`,
    profitLossRatio: `${ratio}x`,
    expectedPnl: expected,
    logCompleteness: scenarios.length > 0 ? "100%" : "0%",
    logCount: `${scenarios.length} 条已记录`,
    avgHoldingDays: "0.0 天",
  };
}

export function getRecentScenariosForOverview(limit = 10, range?: DateRangeInput) {
  const scenarios = getScenarios(range).slice(0, limit);
  const pairs = getRealShadowPairs(range);
  return scenarios.map((s) => {
    const pair = pairs.find((p) => p.scenarioId === s.id) ?? pairs.find((p) => p.symbol === s.symbol);
    return {
      id: s.id,
      symbol: s.symbol,
      market: "模拟",
      entryPrice: s.currentPrice,
      entryReason: "成本模拟加仓",
      pnl: pair ? `${pair.impact.impactScore.toFixed(2)}%` : "—",
      summary: `新成本 ${s.newAverageCost}`,
      createdAt: s.createdAt,
    };
  });
}

export function getImpactTrend(range?: DateRangeInput): TrendPoint[] {
  const pairs = [...getRealShadowPairs(range)].reverse();
  let running = 0;
  return pairs.map((p, idx) => {
    running += p.impact.impactScore;
    return { label: `${idx + 1}`, value: Number(running.toFixed(2)) };
  });
}

export function getEmotionWinRateBars(range?: DateRangeInput): TrendPoint[] {
  const scenarios = getScenarios(range);
  const pairs = getRealShadowPairs(range);
  const groups = ["冷静", "兴奋", "焦虑", "FOMO"];
  const result: TrendPoint[] = [];
  for (let i = 0; i < groups.length; i++) {
    const subset = scenarios.filter((_, idx) => idx % 4 === i);
    const win = subset.filter((s) => {
      const p = pairs.find((x) => x.scenarioId === s.id);
      return p ? p.impact.impactScore >= 0 : false;
    }).length;
    const value = subset.length > 0 ? (win / subset.length) * 100 : 0;
    result.push({ label: groups[i], value: Number(value.toFixed(1)) });
  }
  return result;
}
