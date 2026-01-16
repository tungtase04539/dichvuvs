import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET: Lấy danh sách bộ trợ lý (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry");
    const featured = searchParams.get("featured");

    const where: any = { active: true };
    
    if (industry) {
      where.industry = industry;
    }
    if (featured === "true") {
      where.featured = true;
    }

    const bundles = await prisma.assistantBundle.findMany({
      where,
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" }
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        priceGold: true,
        pricePlatinum: true,
        image: true,
        featured: true,
        industry: true,
      }
    });

    return NextResponse.json({ bundles, total: bundles.length });
  } catch (error) {
    console.error("Get bundles error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// POST: Tạo bộ trợ lý mới (Admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });

    if (dbUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      longDescription,
      price,
      priceGold,
      pricePlatinum,
      image,
      videoUrl,
      featured,
      industry,
      chatbotLink,
      chatbotLinkGold,
      chatbotLinkPlatinum,
    } = body;

    if (!name || !slug || !description || !price) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Check if slug exists
    const existing = await prisma.assistantBundle.findUnique({
      where: { slug }
    });
    if (existing) {
      return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 400 });
    }

    const bundle = await prisma.assistantBundle.create({
      data: {
        name,
        slug,
        description,
        longDescription,
        price: parseFloat(price),
        priceGold: priceGold ? parseFloat(priceGold) : null,
        pricePlatinum: pricePlatinum ? parseFloat(pricePlatinum) : null,
        image,
        videoUrl,
        featured: featured || false,
        industry,
        chatbotLink,
        chatbotLinkGold,
        chatbotLinkPlatinum,
      }
    });

    return NextResponse.json({ bundle });
  } catch (error: any) {
    console.error("Create bundle error:", error);
    return NextResponse.json({ error: error.message || "Error" }, { status: 500 });
  }
}
