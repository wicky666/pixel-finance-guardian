import Decimal from "decimal.js";
import { getRealShadowPairs, saveRealShadowPair } from "./store";
import type { DateRangeInput, RealShadowPair, SnapshotPoint } from "./types";

function toPoint(
  quantity: string,
  avgCost: string,
  cashSpent: string,
  price: string,
  createdAt: string
): SnapshotPoint {
  return { quantity, avgCost, cashSpent, snapshotPrice: price, createdAt };
}

export function createRealShadowFromScenario(
  scenario: {
    id?: string;
    symbol: string;
    currentQuantity: string;
    currentAverageCost: string;
    currentPrice: string;
    addQuantity: string;
    addAmount: string;
    newAverageCost: string;
  }
): RealShadowPair {
  const now = new Date().toISOString();
  const q0 = new Decimal(scenario.currentQuantity);
  const c0 = new Decimal(scenario.currentAverageCost);
  const p = new Decimal(scenario.currentPrice);
  const q1 = new Decimal(scenario.addQuantity);
  const cashSpent = new Decimal(scenario.addAmount);
  const realAvg = new Decimal(scenario.newAverageCost);

  const realPoint = toPoint(
    q0.plus(q1).toFixed(8),
    realAvg.toFixed(8),
    cashSpent.toFixed(8),
    p.toFixed(8),
    now
  );
  const shadowPoint = toPoint(
    scenario.currentQuantity,
    scenario.currentAverageCost,
    "0",
    scenario.currentPrice,
    now
  );

  const pair: RealShadowPair = {
    scenarioId: scenario.id ?? crypto.randomUUID?.() ?? `pair-${Date.now()}`,
    symbol: scenario.symbol,
    createdAt: now,
    real: realPoint,
    shadow: shadowPoint,
    impact: {
      avgCostDiff: realAvg.minus(c0).toFixed(8),
      quantityDiff: q1.toFixed(8),
      impactScore: c0.gt(0) ? realAvg.minus(c0).div(c0).mul(-100).toNumber() : 0,
    },
  };
  saveRealShadowPair(pair);
  return pair;
}

export function getShadowHistory(limit = 20, range?: DateRangeInput): RealShadowPair[] {
  return getRealShadowPairs(range).slice(0, limit);
}

export function getChartData(pairs: RealShadowPair[]) {
  return pairs.map((p) => ({
    date: p.createdAt,
    realAvgCost: parseFloat(p.real.avgCost),
    shadowAvgCost: parseFloat(p.shadow.avgCost),
    impactScore: p.impact.impactScore,
  }));
}
