import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Singleton pattern - create client only once
let _supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  // Get env vars at runtime (not at import time)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!_supabase && supabaseUrl && supabaseAnonKey) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
};

// For backward compatibility - lazy getter
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabase();
    if (!client) {
      console.warn("Supabase client not initialized");
      return undefined;
    }
    return (client as Record<string, unknown>)[prop as string];
  }
});

// Generate order code
export function generateOrderCode(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VS${dateStr}${random}`;
}

