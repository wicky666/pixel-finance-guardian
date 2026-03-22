import { getBehaviorAnalysis } from "./behaviorService";
import type { DateRangeInput, SanityResult } from "./types";

const MAX_SCORE = 100;

export function getSanity(range?: DateRangeInput): SanityResult {
  const behavior = getBehaviorAnalysis(range);
  let score = MAX_SCORE;
  const reasons: string[] = [];

  if (behavior.saveCount24h > 10) {
    score -= 30;
    reasons.push("24 小时内保存次数过多");
  } else if (behavior.saveCount24h > 5) {
    score -= 15;
    reasons.push("24 小时内多次保存");
  }
  if (behavior.intervalMinutes !== null && behavior.intervalMinutes < 15) {
    score -= 20;
    reasons.push("操作间隔过短");
  }
  if (!behavior.isSignificant && behavior.saveCount24h > 0) {
    score -= 10;
    reasons.push("模拟行为较频繁");
  }

  score = Math.max(0, Math.min(MAX_SCORE, score));
  if (reasons.length === 0) reasons.push("暂无显著触发");

  const level: SanityResult["level"] =
    score >= 80 ? "healthy" : score >= 60 ? "caution" : score >= 40 ? "warning" : "critical";
  return { score, level, reasons };
}
