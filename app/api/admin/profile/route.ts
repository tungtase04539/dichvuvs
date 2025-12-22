import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const supabase = createServerSupabaseClient();
        if (!supabase) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dbUser = await prisma.user.findFirst({
            where: { email: authUser.email || "" },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                balance: true,
                phone: true,
                avatar: true,
                parentId: true,
                createdAt: true
            }
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user: dbUser });
    } catch (error) {
        console.error("Get profile error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
