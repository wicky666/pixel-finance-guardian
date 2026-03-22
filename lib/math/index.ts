/**
 * Sandbox math engine — public API.
 * Use for cost simulation; no UI, no advice text.
 */

export {
  calculateAddQuantityFromAmount,
  calculateNewAverageCost,
  calculateCostImprovementEfficiency,
  calculateBreakevenReboundPct,
  calculateAddQuantityFromAmountInteger,
} from "./sandbox";
export type { QuantityRoundStrategy } from "./sandbox";
export { PRECISION, ROUNDING_MODE } from "./constants";
