import { Injectable } from "@nestjs/common";
import type { ScenarioRecord } from "../scenario/scenario.service";
import { ScenarioService } from "../scenario/scenario.service";

export type ReviewStyle = "standard" | "share";
export type ReviewTone = "calm" | "real" | "sharp";

export interface DailyReviewContent {
  fact: string[];
  context: string[];
  decision: string[];
  keyline: string[];
}

const MS_24H = 24 * 60 * 60 * 1000;

function pickBySeed(pool: string[][], seed: number): string[] {
  if (pool.length === 0) return [];
  const index = Math.abs(seed) % pool.length;
  return pool[index];
}

function analyzeFromScenarios(list: ScenarioRecord[]): {
  saveCount24h: number;
  intervalMinutes: number | null;
  frequent: boolean;
  urgent: boolean;
} {
  const now = Date.now();
  const cutoff = new Date(now - MS_24H).toISOString();
  const recent = list.filter((s) => s.createdAt >= cutoff);
  const sorted = [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const intervalMinutes =
    sorted.length >= 2
      ? Math.round(
          (new Date(sorted[0].createdAt).getTime() -
            new Date(sorted[1].createdAt).getTime()) /
            (60 * 1000)
        )
      : null;
  const saveCount24h = recent.length;
  return {
    saveCount24h,
    intervalMinutes,
    frequent: saveCount24h > 5,
    urgent: intervalMinutes !== null && intervalMinutes < 20,
  };
}

function pickKeyline(args: {
  frequent: boolean;
  urgent: boolean;
  style: ReviewStyle;
  tone: ReviewTone;
  seed: number;
}): string[] {
  const { frequent, urgent, style, tone, seed } = args;
  if (style === "share") {
    const sharePoolCalm: string[][] = [
      ["今天其实不复杂。", "复杂的是心。", "我又快了半拍。"],
      ["市场没催我。", "是我在催自己。", "手还是快了。"],
    ];
    const sharePoolReal: string[][] = [
      ["今天的问题，", "不是看错，", "是手太快。"],
      ["不是没计划。", "是波动一来，", "我就不想等。"],
      ["其实可以不动。", "但我还是动了。", "有点急。"],
    ];
    const sharePoolSharp: string[][] = [
      ["我最会的不是判断。", "是在犹豫里", "抢着下手。"],
      ["不是市场难。", "是我不肯等。", "又想立刻翻盘。"],
    ];
    if (tone === "calm") return pickBySeed(sharePoolCalm, seed + (frequent ? 1 : 0));
    if (tone === "sharp") return pickBySeed(sharePoolSharp, seed + (urgent ? 2 : 0));
    return pickBySeed(sharePoolReal, seed + (frequent && urgent ? 3 : 0));
  }
  if (tone === "calm") {
    if (frequent && urgent) return ["今天不是看错。是节奏太赶。"];
    if (frequent) return ["我想得不少。等得不够。"];
    return ["今天先慢一点。就对了。"];
  }
  if (tone === "sharp") {
    if (frequent && urgent) return ["今天不是失误。是急着证明自己。"];
    if (frequent) return ["我不是没逻辑。是怕错过。"];
    return ["手快这件事。比看错更伤。"];
  }
  if (frequent && urgent) return ["今天的问题。不是看错。是太急。"];
  if (frequent) return ["不是没想清楚。是不愿意等。"];
  return ["有时候亏损。不是判断错。是手快。"];
}

@Injectable()
export class ReviewService {
  constructor(private readonly scenarios: ScenarioService) {}

  generate(style: ReviewStyle, seed: number, tone: ReviewTone): DailyReviewContent {
    const list = this.scenarios.listAll(100);
    const { frequent, urgent } = analyzeFromScenarios(list);
    const todayCount = list.length;
    const latest = list[0];
    const factPool =
      todayCount === 0
        ? ["今天还没动仓位。", "先把想法写下来。"]
        : [
            `今天动了 ${todayCount} 次。`,
            latest?.addAmount && Number(latest.addAmount) > 0 ? "有补仓动作。" : "动作偏试探。",
          ];
    const fact = [...factPool];
    if (seed % 2 === 1 && todayCount > 0) {
      fact[1] = "来回确认了几次。";
    }
    const context = [
      frequent ? "今天波动感更强。" : "市场不算清晰。",
      seed % 3 === 0 ? (urgent ? "节奏偏快。" : "情绪偏谨慎。") : urgent ? "有点赶节奏。" : "节奏还算稳。",
    ];
    const decision =
      todayCount === 0
        ? ["今天先不动。", "这是克制，不是犹豫。"]
        : [
            frequent ? "今天更像顺着情绪。" : "今天大体按计划在动。",
            urgent ? "有点急着把亏损拉回来。" : "节奏还算稳。",
            tone === "calm"
              ? "先停十秒。再决定。"
              : tone === "sharp"
                ? "我又在波动里抢答。"
                : style === "share"
                  ? "其实可以再等等。"
                  : "下次先等三分钟。",
          ];
    return {
      fact,
      context,
      decision,
      keyline: pickKeyline({ frequent, urgent, style, tone, seed }),
    };
  }
}
