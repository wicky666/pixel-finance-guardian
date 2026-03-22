import { getBehaviorAnalysis } from "./behaviorService";
import { getScenarios } from "./store";

export type ReviewStyle = "standard" | "share";
export type ReviewTone = "calm" | "real" | "sharp";

export interface DailyReviewContent {
  fact: string[];
  context: string[];
  decision: string[];
  keyline: string[];
}

function pickBySeed(pool: string[][], seed: number): string[] {
  if (pool.length === 0) return [];
  const index = Math.abs(seed) % pool.length;
  return pool[index];
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

export function generateDailyReview(style: ReviewStyle, seed = 0, tone: ReviewTone = "real"): DailyReviewContent {
  const scenarios = getScenarios();
  const behavior = getBehaviorAnalysis();
  const todayCount = scenarios.length;
  const latest = scenarios[0];
  const frequent = behavior.saveCount24h > 5;
  const urgent = behavior.intervalMinutes !== null && behavior.intervalMinutes < 20;

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
          frequent ? "今天更像顺着情绪。": "今天大体按计划在动。",
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
