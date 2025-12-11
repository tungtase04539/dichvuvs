import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get orders by customer email
    const orders = await prisma.order.findMany({
      where: {
        customerEmail: user.email,
      },
      select: {
        id: true,
        orderCode: true,
        status: true,
        totalPrice: true,
        createdAt: true,
        service: {
          select: {
            name: true,
            icon: true,
          },
        },
        credentials: {
          select: {
            username: true,
            password: true,
            note: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format orders with credentials
    const formattedOrders = orders.map((order) => ({
      ...order,
      credential: order.credentials?.[0] || null,
      credentials: undefined,
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("Get customer orders error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

