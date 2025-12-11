import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Singleton pattern - create client only once
let _supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!_supabase && supabaseUrl && supabaseAnonKey) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
};

// Initialize singleton on first import (for backward compatibility)
const _initSupabase = getSupabase();

// For backward compatibility - export the singleton
export const supabase = _initSupabase as SupabaseClient;

// Generate order code
export function generateOrderCode(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VS${dateStr}${random}`;
}

