/**
 * Sandbox Math Engine — cost simulation core.
 * All financial/price/quantity calculations use Decimal.js. Pure functions only.
 */

import Decimal from "decimal.js";
import { PRECISION, ROUNDING_MODE } from "./constants";

// --- Input validation helpers (pure) ---

function toDecimal(value: unknown): Decimal | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Decimal) return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return new Decimal(value);
  }
  if (typeof value === "string") {
    const d = new Decimal(value);
    return d.isFinite() ? d : null;
  }
  return null;
}

/** Require positive (strictly > 0) for divisor / meaningful math */
function requirePositive(d: Decimal | null): d is Decimal {
  return d !== null && d.gt(0);
}

function roundToPrecision(value: Decimal, decimals: number): string {
  return value.toDecimalPlaces(decimals, ROUNDING_MODE).toFixed(decimals);
}

// --- Core functions ---

/**
 * Compute add quantity from add amount and current price.
 * Allows fractional shares; result rounded to PRECISION.quantity.
 * Returns null if currentPrice <= 0 or addAmount <= 0 or invalid input.
 */
export function calculateAddQuantityFromAmount(
  addAmount: Decimal.Value,
  currentPrice: Decimal.Value
): string | null {
  const amount = toDecimal(addAmount);
  const price = toDecimal(currentPrice);
  if (!requirePositive(amount) || !requirePositive(price)) return null;
  const qty = amount.div(price);
  return roundToPrecision(qty, PRECISION.quantity);
}

/**
 * New average cost after adding: Cn = (Q0*C0 + Q1*P) / (Q0 + Q1).
 * Returns null if total quantity would be 0 (e.g. Q0=0 and Q1=0) or any invalid input.
 */
export function calculateNewAverageCost(
  currentQuantity: Decimal.Value,
  currentAverageCost: Decimal.Value,
  addQuantity: Decimal.Value,
  currentPrice: Decimal.Value
): string | null {
  const q0 = toDecimal(currentQuantity);
  const c0 = toDecimal(currentAverageCost);
  const q1 = toDecimal(addQuantity);
  const p = toDecimal(currentPrice);
  if (q0 === null || c0 === null || q1 === null || p === null) return null;
  if (q0.lt(0) || c0.lt(0) || q1.lt(0) || p.lt(0)) return null;

  const totalQty = q0.plus(q1);
  if (totalQty.lte(0)) return null;

  const numerator = q0.times(c0).plus(q1.times(p));
  const cn = numerator.div(totalQty);
  return roundToPrecision(cn, PRECISION.price);
}

/**
 * Cost improvement efficiency: how much average cost drops per 10k added.
 * E = (C0 - Cn) / (addAmount / 10000).
 * Returns null if addAmount <= 0 or invalid input. If C0 <= Cn, efficiency is 0 or negative (valid).
 */
export function calculateCostImprovementEfficiency(
  originalAverageCost: Decimal.Value,
  newAverageCost: Decimal.Value,
  addAmount: Decimal.Value
): string | null {
  const c0 = toDecimal(originalAverageCost);
  const cn = toDecimal(newAverageCost);
  const amount = toDecimal(addAmount);
  if (c0 === null || cn === null || amount === null) return null;
  if (!requirePositive(amount)) return null;

  const costDrop = c0.minus(cn);
  const per10k = amount.div(10000);
  const efficiency = costDrop.div(per10k);
  return roundToPrecision(efficiency, PRECISION.efficiency);
}

/**
 * Rebound % from current price to breakeven: breakeven = Cn/P - 1.
 * (e.g. 0.05 means 5% rebound needed.)
 * Returns null if currentPrice <= 0 or invalid input.
 */
export function calculateBreakevenReboundPct(
  newAverageCost: Decimal.Value,
  currentPrice: Decimal.Value
): string | null {
  const cn = toDecimal(newAverageCost);
  const p = toDecimal(currentPrice);
  if (cn === null || p === null) return null;
  if (!requirePositive(p)) return null;

  const ratio = cn.div(p);
  const reboundPct = ratio.minus(1);
  return roundToPrecision(reboundPct, PRECISION.percentage);
}

// --- Optional: integer quantity (e.g. for markets that don't allow fractional shares) ---

/** Rounding strategy when fractional shares are not allowed */
export type QuantityRoundStrategy = "floor" | "round" | "ceil";

/**
 * Like calculateAddQuantityFromAmount but returns integer quantity.
 * Uses floor by default (conservative: don't over-buy).
 */
export function calculateAddQuantityFromAmountInteger(
  addAmount: Decimal.Value,
  currentPrice: Decimal.Value,
  strategy: QuantityRoundStrategy = "floor"
): string | null {
  const result = calculateAddQuantityFromAmount(addAmount, currentPrice);
  if (result === null) return null;
  const d = new Decimal(result);
  const rounded =
    strategy === "floor"
      ? d.floor()
      : strategy === "ceil"
        ? d.ceil()
        : d.toDecimalPlaces(0, ROUNDING_MODE);
  return rounded.toFixed(0);
}
