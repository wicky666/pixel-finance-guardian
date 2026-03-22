import { apiPostJson } from "./client";
import type { ScenarioRecord } from "@/lib/services/types";

/** 将本地保存的一条模拟同步到后端（内存库），失败静默 */
export async function syncScenarioToApi(record: ScenarioRecord): Promise<void> {
  const res = await apiPostJson("/scenarios", {
    id: record.id,
    createdAt: record.createdAt,
    symbol: record.symbol,
    currentQuantity: record.currentQuantity,
    currentAverageCost: record.currentAverageCost,
    currentPrice: record.currentPrice,
    addAmount: record.addAmount,
    addQuantity: record.addQuantity,
    newAverageCost: record.newAverageCost,
  });
  if (!res.ok && !("skipped" in res && res.skipped)) {
    console.warn("[pfg] sync scenario failed", res);
  }
}

export async function syncShadowPairToApi(payload: {
  id: string;
  symbol: string;
  currentQuantity: string;
  currentAverageCost: string;
  currentPrice: string;
  addQuantity: string;
  addAmount: string;
  newAverageCost: string;
}): Promise<void> {
  const res = await apiPostJson("/shadow/pairs", {
    id: payload.id,
    symbol: payload.symbol,
    currentQuantity: payload.currentQuantity,
    currentAverageCost: payload.currentAverageCost,
    currentPrice: payload.currentPrice,
    addQuantity: payload.addQuantity,
    addAmount: payload.addAmount,
    newAverageCost: payload.newAverageCost,
  });
  if (!res.ok && !("skipped" in res && res.skipped)) {
    console.warn("[pfg] sync shadow failed", res);
  }
}
