import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
