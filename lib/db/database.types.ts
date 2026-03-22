/**
 * Supabase generated types would go here.
 * Run: npx supabase gen types typescript --project-id <id> > lib/db/database.types.ts
 * Until then, minimal type stub so client compiles. Replace with generated types when using Supabase CLI.
 */
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          nickname: string | null;
          avatar_seed: string | null;
          survival_level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_profiles"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Insert"]>;
      };
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          current_quantity: string;
          average_cost: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["portfolios"]["Row"]> & {
          user_id: string;
          symbol: string;
        };
        Update: Partial<Database["public"]["Tables"]["portfolios"]["Insert"]>;
      };
      simulation_scenarios: {
        Row: {
          id: string;
          portfolio_id: string;
          current_price: string;
          add_amount: string;
          add_quantity: string;
          simulated_avg_cost: string;
          cost_improvement_efficiency: string | null;
          breakeven_rebound_pct: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["simulation_scenarios"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["simulation_scenarios"]["Insert"]>;
      };
      real_snapshots: {
        Row: {
          id: string;
          portfolio_id: string;
          scenario_id: string;
          quantity: string;
          avg_cost: string;
          cash_spent: string;
          snapshot_price: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["real_snapshots"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["real_snapshots"]["Insert"]>;
      };
      shadow_snapshots: {
        Row: {
          id: string;
          portfolio_id: string;
          scenario_id: string;
          quantity: string;
          avg_cost: string;
          cash_spent: string;
          snapshot_price: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["shadow_snapshots"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["shadow_snapshots"]["Insert"]>;
      };
      behavior_events: {
        Row: {
          id: string;
          user_id: string;
          portfolio_id: string | null;
          event_type: string;
          metadata_json: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["behavior_events"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["behavior_events"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
