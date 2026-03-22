import { getScenarios } from "./store";
import type { DateRangeInput } from "./types";

const MS_24H = 24 * 60 * 60 * 1000;

export interface BehaviorAnalysis {
  simCount24h: number;
  saveCount24h: number;
  lastActionAt: string | null;
  intervalMinutes: number | null;
  isSignificant: boolean;
  message: string;
}

export function getBehaviorAnalysis(range?: DateRangeInput): BehaviorAnalysis {
  const list = getScenarios(range);
  const now = Date.now();
  const cutoff = new Date(now - MS_24H).toISOString();
  const recent = list.filter((s) => s.createdAt >= cutoff);
  const sorted = [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const last = sorted[0]?.createdAt ?? null;
  const intervalMinutes =
    sorted.length >= 2
      ? Math.round(
          (new Date(sorted[0].createdAt).getTime() -
            new Date(sorted[1].createdAt).getTime()) /
            (60 * 1000)
        )
      : null;

  const saveCount24h = recent.length;
  const simCount24h = saveCount24h;
  const isSignificant = saveCount24h <= 5 && (intervalMinutes === null || intervalMinutes >= 30);
  const message =
    saveCount24h === 0
      ? "过去 24 小时内没有模拟记录。"
      : isSignificant
        ? "你的操作节奏比较平稳。"
        : "24 小时内操作偏频繁，建议拉长决策间隔。";

  return { simCount24h, saveCount24h, lastActionAt: last, intervalMinutes, isSignificant, message };
}
