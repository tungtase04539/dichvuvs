import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET: Fetch CTV ranking by revenue
export async function GET(request: NextRequest) {
  try {
    // Check admin
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });

    if (dbUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all CTV users with referral stats
    const ctvUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: "ctv" },
          { role: "senior_ctv" },
          { role: "agency" },
        ]
      },
      include: {
        referralLinks: {
          select: {
            code: true,
            orderCount: true,
            revenue: true,
          }
        }
      }
    });

    // Calculate total revenue per CTV and sort
    const rankings = ctvUsers.map(user => {
      const totalRevenue = user.referralLinks.reduce((sum, link) => sum + (link.revenue || 0), 0);
      const totalOrders = user.referralLinks.reduce((sum, link) => sum + (link.orderCount || 0), 0);
      const refCode = user.referralLinks[0]?.code || "";

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        orderCount: totalOrders,
        revenue: totalRevenue,
        refCode,
      };
    });

    // Sort by revenue descending
    rankings.sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({ rankings });
  } catch (error) {
    console.error("CTV ranking error:", error);
    return NextResponse.json({ error: "Lỗi lấy dữ liệu" }, { status: 500 });
  }
}
