import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import Decimal from "decimal.js";
import type { CreateShadowDto } from "./dto/create-shadow.dto";

export interface SnapshotPoint {
  quantity: string;
  avgCost: string;
  cashSpent: string;
  snapshotPrice: string;
  createdAt: string;
}

export interface RealShadowPair {
  scenarioId: string;
  userId: string;
  symbol: string;
  createdAt: string;
  real: SnapshotPoint;
  shadow: SnapshotPoint;
  impact: {
    avgCostDiff: string;
    quantityDiff: string;
    impactScore: number;
  };
}

const MAX_PAIRS = 500;

@Injectable()
export class ShadowService {
  private pairs: RealShadowPair[] = [];

  listByUser(userId: string, limit = 20): RealShadowPair[] {
    return this.pairs.filter((p) => p.userId === userId).slice(0, limit);
  }

  listAll(limit = 100): RealShadowPair[] {
    return this.pairs.slice(0, limit);
  }

  latestByUser(userId: string): RealShadowPair | null {
    return this.pairs.find((p) => p.userId === userId) ?? null;
  }

  latest(): RealShadowPair | null {
    return this.pairs[0] ?? null;
  }

  createFromScenario(userId: string, input: CreateShadowDto): RealShadowPair {
    const now = new Date().toISOString();
    const q0 = new Decimal(input.currentQuantity);
    const c0 = new Decimal(input.currentAverageCost);
    const p = new Decimal(input.currentPrice);
    const q1 = new Decimal(input.addQuantity);
    const cashSpent = new Decimal(input.addAmount);
    const realAvg = new Decimal(input.newAverageCost);

    const toPoint = (
      quantity: string,
      avgCost: string,
      spent: string,
      price: string
    ): SnapshotPoint => ({
      quantity,
      avgCost,
      cashSpent: spent,
      snapshotPrice: price,
      createdAt: now,
    });

    const realPoint = toPoint(
      q0.plus(q1).toFixed(8),
      realAvg.toFixed(8),
      cashSpent.toFixed(8),
      p.toFixed(8)
    );
    const shadowPoint = toPoint(
      input.currentQuantity,
      input.currentAverageCost,
      "0",
      input.currentPrice
    );

    const pair: RealShadowPair = {
      scenarioId: input.id ?? randomUUID(),
      userId,
      symbol: input.symbol.trim().toUpperCase(),
      createdAt: now,
      real: realPoint,
      shadow: shadowPoint,
      impact: {
        avgCostDiff: realAvg.minus(c0).toFixed(8),
        quantityDiff: q1.toFixed(8),
        impactScore: c0.gt(0)
          ? realAvg.minus(c0).div(c0).mul(-100).toNumber()
          : 0,
      },
    };
    this.pairs = [pair, ...this.pairs.filter((p) => p.scenarioId !== pair.scenarioId)].slice(0, MAX_PAIRS);
    return pair;
  }
}
