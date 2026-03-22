import { getBehaviorAnalysis } from "./behaviorService";
import { getSanity } from "./sanityService";
import type { BehaviorIndicators, DateRangeInput } from "./types";

export function getBehaviorIndicators(range?: DateRangeInput): BehaviorIndicators {
  const behavior = getBehaviorAnalysis(range);
  const sanity = getSanity(range);
  const calmPct = sanity.score;
  const emotionalPct = 100 - sanity.score;
  const plannedPct = behavior.isSignificant ? 62 : 38;
  const impulsePct = 100 - plannedPct;

  return {
    calmVsEmotional: {
      calm: `冷静 ${calmPct}%`,
      emotional: `情绪化 ${emotionalPct}%`,
    },
    plannedVsImpulse: {
      planned: `有计划 ${plannedPct}%`,
      impulse: `冲动 ${impulsePct}%`,
    },
    stopLossExecution: {
      value: "0/0",
      label: "笔在计划止损位附近执行",
    },
    multiSignalWinRate: "三重确认: 0%",
  };
}
