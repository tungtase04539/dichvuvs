import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerSupabaseClient();
        if (!supabase) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get DB user for role and ID
        const dbUser = await prisma.user.findFirst({
            where: { email: authUser.email || "" }
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found in database" }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        let whereClause: any = {};

        // Nếu không phải admin, chỉ xem hoa hồng của mình
        if (dbUser.role !== "admin") {
            whereClause.userId = dbUser.id;
        }

        const [commissions, total] = await Promise.all([
            prisma.commission.findMany({
                where: whereClause,
                include: {
                    order: {
                        select: {
                            orderCode: true,
                            customerName: true,
                            totalPrice: true,
                            service: { select: { name: true } }
                        }
                    },
                    user: {
                        select: { name: true, email: true, role: true }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.commission.count({ where: whereClause })
        ]);

        return NextResponse.json({
            commissions,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Get commissions error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
