/**
 * Database types for Pixel Finance Guardian (Supabase/PostgreSQL).
 * Match tables: user_profiles, portfolios, simulation_scenarios,
 * real_snapshots, shadow_snapshots, behavior_events.
 */

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export interface UserProfile {
  id: string;
  user_id: string;
  nickname: string | null;
  avatar_seed: string | null;
  survival_level: number;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  symbol: string;
  current_quantity: string;
  average_cost: string;
  created_at: string;
  updated_at: string;
}

export interface SimulationScenario {
  id: string;
  portfolio_id: string;
  current_price: string;
  add_amount: string;
  add_quantity: string;
  simulated_avg_cost: string;
  cost_improvement_efficiency: string | null;
  breakeven_rebound_pct: string | null;
  created_at: string;
}

export interface RealSnapshot {
  id: string;
  portfolio_id: string;
  scenario_id: string;
  quantity: string;
  avg_cost: string;
  cash_spent: string;
  snapshot_price: string;
  created_at: string;
}

export interface ShadowSnapshot {
  id: string;
  portfolio_id: string;
  scenario_id: string;
  quantity: string;
  avg_cost: string;
  cash_spent: string;
  snapshot_price: string;
  created_at: string;
}

/** event_type examples: simulation_run | scenario_saved | consecutive_add | high_freq_warning */
export interface BehaviorEvent {
  id: string;
  user_id: string;
  portfolio_id: string | null;
  event_type: string;
  metadata_json: Record<string, Json> | null;
  created_at: string;
}

/** Insert types (omit id, created_at, updated_at where defaulted) */
export type UserProfileInsert = Omit<UserProfile, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PortfolioInsert = Omit<Portfolio, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type SimulationScenarioInsert = Omit<SimulationScenario, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type RealSnapshotInsert = Omit<RealSnapshot, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type ShadowSnapshotInsert = Omit<ShadowSnapshot, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type BehaviorEventInsert = Omit<BehaviorEvent, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
