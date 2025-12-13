import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST() {
  const supabase = createServerSupabaseClient();
  
  if (supabase) {
    await supabase.auth.signOut();
  }
  
  return NextResponse.json({ success: true });
}
