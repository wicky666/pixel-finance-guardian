import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Supabase client for server or client (anon key).
 * If env vars are missing, a placeholder client is returned; requests will fail until URL/key are set.
 * For server-only with service role, create a separate client using SUPABASE_SERVICE_ROLE_KEY.
 */
export const supabase: SupabaseClient<Database> =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : createClient<Database>(
        "https://placeholder.supabase.co",
        "placeholder",
        { auth: { persistSession: false } }
      );

export function getSupabase(): SupabaseClient<Database> {
  return supabase;
}
