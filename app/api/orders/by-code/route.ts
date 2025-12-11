import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get("code");

    if (!orderCode) {
      return NextResponse.json({ error: "Missing order code" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const { data: order, error } = await supabase
      .from("Order")
      .select("orderCode, totalPrice, status, customerName, customerPhone")
      .eq("orderCode", orderCode)
      .single();

    if (error || !order) {
      // Return default order data if not found
      return NextResponse.json({
        order: {
          orderCode,
          totalPrice: 29000,
          status: "pending",
          customerName: "Khách hàng",
          customerPhone: "",
        }
      });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

