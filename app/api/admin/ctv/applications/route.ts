import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = await getSession();
        if (!user || !(await isAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "pending";

        const applications = await prisma.cTVApplication.findMany({
            where: { status },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ applications });
    } catch (error: any) {
        console.error("Fetch CTV Applications error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
