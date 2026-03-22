import Decimal from "decimal.js";
import {
  calculateAddQuantityFromAmount,
  calculateBreakevenReboundPct,
  calculateCostImprovementEfficiency,
  calculateNewAverageCost,
} from "@/lib/math";
import { getBehaviorAnalysis } from "./behaviorService";

export type DecisionAction = "add" | "reduce" | "hold";
export type DecisionInputMode = "amount" | "quantity";

export interface DecisionInput {
  currentQuantity: string;
  costPrice: string;
  currentPrice: string;
  action: DecisionAction;
  inputMode: DecisionInputMode;
  changeValue: string;
}

export interface DecisionResult {
  valid: boolean;
  newAverageCost: string;
  breakevenPrice: string;
  riskChange: string;
  explanationLines: string[];
  addAmountForSave: string;
  addQuantityForSave: string;
  reminder: string;
}

function invalid(reminder: string): DecisionResult {
  return {
    valid: false,
    newAverageCost: "—",
    breakevenPrice: "—",
    riskChange: "—",
    explanationLines: ["先写下这次想动的念头，再看看结果会怎样。"],
    addAmountForSave: "0",
    addQuantityForSave: "0",
    reminder,
  };
}

export function analyzeDecision(input: DecisionInput): DecisionResult {
  const q0 = Number(input.currentQuantity);
  const c0 = Number(input.costPrice);
  const p = Number(input.currentPrice);
  if (!Number.isFinite(q0) || !Number.isFinite(c0) || !Number.isFinite(p) || q0 < 0 || c0 < 0 || p <= 0) {
    return invalid("先把当前持仓、成本价和当前价写完整。");
  }

  const behavior = getBehaviorAnalysis();
  const frequent = behavior.saveCount24h > 5;
  const drop = p < c0;

  const action = input.action;
  const mode = input.inputMode;
  const raw = input.changeValue.trim();
  const value = Number(raw);

  if (action !== "hold" && (!Number.isFinite(value) || value <= 0)) {
    return invalid("这次想动多少还没写清楚。");
  }

  if (action === "hold") {
    return {
      valid: true,
      newAverageCost: c0.toFixed(4),
      breakevenPrice: c0.toFixed(4),
      riskChange: "风险基本不变",
      explanationLines: [
        `成本保持在 ${c0.toFixed(4)}，回本价也是 ${c0.toFixed(4)}。`,
        "先不动，通常能让你少受情绪干扰。",
      ],
      addAmountForSave: "0",
      addQuantityForSave: "0",
      reminder: frequent ? "你最近动作有点频繁，先不动反而更稳。" : "先不动不是拖延，是给自己留一次冷静判断。",
    };
  }

  let changeQty = "0";
  let changeAmount = "0";
  if (mode === "amount") {
    changeAmount = raw;
    const qty = calculateAddQuantityFromAmount(raw, input.currentPrice);
    if (!qty) return invalid("金额或价格不合理，没法算出股数。");
    changeQty = qty;
  } else {
    changeQty = raw;
    try {
      changeAmount = new Decimal(raw).times(input.currentPrice).toFixed(8);
    } catch {
      return invalid("股数输入不合理。");
    }
  }

  if (action === "add") {
    const newAvg = calculateNewAverageCost(input.currentQuantity, input.costPrice, changeQty, input.currentPrice);
    if (!newAvg) return invalid("这组输入暂时算不出来。");
    const reb = calculateBreakevenReboundPct(newAvg, input.currentPrice);
    const eff = calculateCostImprovementEfficiency(input.costPrice, newAvg, changeAmount);
    const newQty = q0 + Number(changeQty);
    const risk = newQty >= q0 * 1.4 ? "风险明显变重" : newQty > q0 ? "风险略有上升" : "风险变化不大";
    const rebPct = reb ? `${(Number(reb) * 100).toFixed(2)}%` : "—";
    return {
      valid: true,
      newAverageCost: Number(newAvg).toFixed(4),
      breakevenPrice: Number(newAvg).toFixed(4),
      riskChange: risk,
      explanationLines: [
        `成本从 ${c0.toFixed(4)} 变成 ${Number(newAvg).toFixed(4)}。`,
        `回本压力${Number(newAvg) < c0 ? "会小一些" : "没有明显变小"}，当前到回本还差 ${rebPct}。`,
        `每投入 1 万，成本改善大约 ${eff ?? "—"}。`,
      ],
      addAmountForSave: changeAmount,
      addQuantityForSave: changeQty,
      reminder: frequent
        ? "你最近补仓有点频繁，这次更像在急着回本。"
        : drop
          ? "这次更像在抹平亏损，先确认是不是计划内动作。"
          : "这次动作看起来还算克制，记得给自己留止损边界。",
    };
  }

  // reduce
  const reduceQty = Number(changeQty);
  const afterQty = Math.max(0, q0 - reduceQty);
  const risk = afterQty < q0 * 0.6 ? "风险明显下降" : afterQty < q0 ? "风险有所下降" : "风险变化不大";
  return {
    valid: true,
    newAverageCost: afterQty > 0 ? c0.toFixed(4) : "0.0000",
    breakevenPrice: afterQty > 0 ? c0.toFixed(4) : "0.0000",
    riskChange: risk,
    explanationLines: [
      `仓位从 ${q0.toFixed(4)} 变成 ${afterQty.toFixed(4)}。`,
      "减仓不会改变剩余仓位的成本，但会减轻后续波动压力。",
      drop ? "在亏损时减仓会更轻松，但也可能锁定一部分亏损。" : "如果你只是想降波动，这次动作是更克制的。",
    ],
    addAmountForSave: "0",
    addQuantityForSave: "0",
    reminder: frequent ? "你最近动作偏密集，减一点仓位反而能让决策更稳。" : "这次更像计划内降风险，而不是情绪化追涨杀跌。",
  };
}
