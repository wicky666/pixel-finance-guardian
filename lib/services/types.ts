export interface DateRangeInput {
  dateFrom?: string;
  dateTo?: string;
}

export interface ScenarioRecord {
  id: string;
  symbol: string;
  currentQuantity: string;
  currentAverageCost: string;
  currentPrice: string;
  addAmount: string;
  addQuantity: string;
  newAverageCost: string;
  costImprovementEfficiency: string;
  breakevenReboundPct: string;
  createdAt: string;
}

export interface SnapshotPoint {
  quantity: string;
  avgCost: string;
  cashSpent: string;
  snapshotPrice: string;
  createdAt: string;
}

export interface RealShadowPair {
  scenarioId: string;
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

export interface BehaviorAnalysisResult {
  simCount24h: number;
  saveCount24h: number;
  lastActionAt: string | null;
  intervalMinutes: number | null;
  isSignificant: boolean;
  message: string;
}

export interface SanityResult {
  score: number;
  level: "healthy" | "caution" | "warning" | "critical";
  reasons: string[];
}

export interface ReportData {
  symbol: string;
  impactSummary: string;
  sanityScore: number;
  sanityLevel: SanityResult["level"];
  scenariosCount: number;
  disclaimer: string;
  generatedAt: string;
}

export interface CoreMetrics {
  totalReturn: string;
  winRate: string;
  winLossCount: string;
  profitLossRatio: string;
  expectedPnl: string;
  logCompleteness: string;
  logCount: string;
  avgHoldingDays: string;
}

export interface BehaviorIndicators {
  calmVsEmotional: { calm: string; emotional: string };
  plannedVsImpulse: { planned: string; impulse: string };
  stopLossExecution: { value: string; label: string };
  multiSignalWinRate: string;
}

export interface TrendPoint {
  label: string;
  value: number;
}
