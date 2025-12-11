import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" });
    }

    // Get all orders
    const { data: orders, error: ordersError } = await supabase
      .from("Order")
      .select("id, orderCode, customerName, status, totalPrice, createdAt")
      .order("createdAt", { ascending: false })
      .limit(20);

    // Get all services
    const { data: services, error: servicesError } = await supabase
      .from("Service")
      .select("id, name, price")
      .limit(10);

    // Get auth user
    const { data: { user: authUser } } = await supabase.auth.getUser();

    // Get DB user if auth exists
    let dbUser = null;
    if (authUser?.email) {
      const { data } = await supabase
        .from("User")
        .select("id, email, role, name")
        .eq("email", authUser.email)
        .single();
      dbUser = data;
    }

    return NextResponse.json({
      orders: orders || [],
      ordersError: ordersError?.message,
      ordersCount: orders?.length || 0,
      services: services || [],
      servicesError: servicesError?.message,
      authUser: authUser ? { email: authUser.email, id: authUser.id } : null,
      dbUser,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: String(error) });
  }
}

