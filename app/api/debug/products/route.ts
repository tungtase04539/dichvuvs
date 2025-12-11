import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check env vars
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };

    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ 
        error: "No supabase client",
        envCheck 
      });
    }

    // Get products
    const { data: products, error: productsError } = await supabase
      .from("Service")
      .select("id, name, slug, price, active, featured")
      .limit(10);

    return NextResponse.json({
      envCheck,
      products: products || [],
      productsError: productsError?.message,
      productsCount: products?.length || 0,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: String(error) });
  }
}

