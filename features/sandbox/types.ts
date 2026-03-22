/**
 * Sandbox form state and scenario entry types.
 * Kept separate so page and components share the same shape.
 */

export type AddInputMode = "amount" | "quantity";

export interface SandboxFormState {
  symbol: string;
  currentQuantity: string;
  currentAverageCost: string;
  currentPrice: string;
  addInputMode: AddInputMode;
  addAmount: string;
  addQuantity: string;
}

/** One saved scenario for comparison (max 3 on page) */
export interface ScenarioEntry {
  id: string;
  addAmount: string;
  addQuantity: string;
  newAverageCost: string;
  costImprovementEfficiency: string;
  breakevenReboundPct: string;
}
