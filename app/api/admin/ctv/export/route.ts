import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET: Export CTV accounts to CSV
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

    // Fetch all CTV users with their applications
    const ctvUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: "ctv" },
          { role: "senior_ctv" },
          { role: "agency" },
        ]
      },
      include: {
        ctvApplication: true,
        referralLinks: {
          select: {
            code: true,
            orderCount: true,
            revenue: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Build CSV content
    const headers = [
      "ID",
      "Họ tên",
      "Email",
      "Số điện thoại",
      "Vai trò",
      "Mã giới thiệu",
      "Số đơn giới thiệu",
      "Doanh thu giới thiệu",
      "Ngày tạo",
    ];

    const rows = ctvUsers.map(user => {
      const app = user.ctvApplication; // 1-1 relation, not array
      const refLink = user.referralLinks[0];
      
      return [
        user.id,
        user.name || app?.fullName || "",
        user.email || app?.email || "",
        app?.phone || "",
        user.role === "senior_ctv" ? "Senior CTV" : user.role === "agency" ? "Đại lý" : "CTV",
        refLink?.code || "",
        refLink?.orderCount || 0,
        refLink?.revenue || 0,
        user.createdAt.toISOString().split("T")[0],
      ];
    });

    // Create CSV string with BOM for Excel UTF-8 support
    const BOM = "\uFEFF";
    const csvContent = BOM + [
      headers.join(","),
      ...rows.map(row => 
        row.map(cell => {
          // Escape quotes and wrap in quotes if contains comma
          const str = String(cell);
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(",")
      )
    ].join("\n");

    // Return as CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ctv_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error("Export CTV error:", error);
    return NextResponse.json({ error: "Lỗi xuất dữ liệu" }, { status: 500 });
  }
}
