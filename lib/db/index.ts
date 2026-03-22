/**
 * DB access layer — Supabase client and table helpers.
 * Use from server or client; ensure RLS is configured in Supabase for production.
 */

export { supabase, getSupabase } from "./client";
export type { Database } from "./database.types";
export type {
  UserProfile,
  Portfolio,
  SimulationScenario,
  RealSnapshot,
  ShadowSnapshot,
  BehaviorEvent,
  UserProfileInsert,
  PortfolioInsert,
  SimulationScenarioInsert,
  RealSnapshotInsert,
  ShadowSnapshotInsert,
  BehaviorEventInsert,
  Json,
} from "./types";

import { supabase } from "./client";

/** Table names for type-safe access */
export const tables = {
  user_profiles: "user_profiles",
  portfolios: "portfolios",
  simulation_scenarios: "simulation_scenarios",
  real_snapshots: "real_snapshots",
  shadow_snapshots: "shadow_snapshots",
  behavior_events: "behavior_events",
} as const;

/** Portfolio by user + symbol (convenience) */
export async function getPortfolioByUserAndSymbol(userId: string, symbol: string) {
  const { data, error } = await supabase
    .from(tables.portfolios)
    .select("*")
    .eq("user_id", userId)
    .eq("symbol", symbol)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Scenarios for a portfolio, newest first */
export async function getScenariosByPortfolio(portfolioId: string, limit = 20) {
  const { data, error } = await supabase
    .from(tables.simulation_scenarios)
    .select("*")
    .eq("portfolio_id", portfolioId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

/** Real and shadow snapshots for a scenario (for comparison) */
export async function getSnapshotsByScenario(scenarioId: string) {
  const [real, shadow] = await Promise.all([
    supabase.from(tables.real_snapshots).select("*").eq("scenario_id", scenarioId).maybeSingle(),
    supabase.from(tables.shadow_snapshots).select("*").eq("scenario_id", scenarioId).maybeSingle(),
  ]);
  if (real.error) throw real.error;
  if (shadow.error) throw shadow.error;
  return { real: real.data, shadow: shadow.data };
}
