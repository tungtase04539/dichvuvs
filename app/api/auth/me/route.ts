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

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch user info from Prisma database
        let dbUser = await prisma.user.findUnique({
            where: { email: authUser.email || "" },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
            }
        });

        // Sync role if different
        if (dbUser && dbUser.role !== authUser.user_metadata?.role && authUser.user_metadata?.role) {
            dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: { role: authUser.user_metadata.role },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    phone: true,
                }
            });
        }

        return NextResponse.json({ user: dbUser });
    } catch (error) {
        console.error("[GET /api/auth/me] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
