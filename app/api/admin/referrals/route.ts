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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const { data: dbUser } = await supabase
      .from("User")
      .select("id, role")
      .eq("email", user.email)
      .single();

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAdmin = dbUser.role === "admin";
    const isCTV = dbUser.role === "ctv" || dbUser.role === "collaborator";

    // CTV only sees their own referral links
    const whereFilter = isAdmin ? {} : { userId: dbUser.id };

    const referralLinks = await prisma.referralLink.findMany({
      where: whereFilter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { revenue: "desc" },
    });

    return NextResponse.json({ referralLinks });
  } catch (error) {
    console.error("Get referrals error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
