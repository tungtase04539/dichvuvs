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

        // Create user if not exists
        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    id: authUser.id,
                    email: authUser.email || "",
                    name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
                    role: authUser.user_metadata?.role || "customer",
                    phone: authUser.user_metadata?.phone || "",
                    password: "",
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    phone: true,
                }
            });
        }

        // AGGRESSIVE SYNC: If role in DB is different from Metadata (or Metadata is missing)
        // We trust the DB as the source of truth for administrative roles
        const metadataRole = authUser.user_metadata?.role;
        if (dbUser.role !== metadataRole) {
            console.log(`[Sync] Updating metadata role for ${dbUser.email} to ${dbUser.role}`);
            const { createAdminSupabaseClient } = await import("@/lib/supabase-server");
            const adminSupabase = createAdminSupabaseClient();

            if (adminSupabase) {
                await adminSupabase.auth.admin.updateUserById(authUser.id, {
                    user_metadata: { ...authUser.user_metadata, role: dbUser.role }
                });
            }
        }

        return NextResponse.json({ user: dbUser });
    } catch (error) {
        console.error("[GET /api/auth/me] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
