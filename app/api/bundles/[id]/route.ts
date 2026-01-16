import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET: Chi tiết bộ trợ lý
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Try find by ID or slug
    const bundle = await prisma.assistantBundle.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      }
    });

    if (!bundle) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }

    return NextResponse.json({ bundle });
  } catch (error) {
    console.error("Get bundle error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// PUT: Cập nhật bộ trợ lý (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const { id } = params;
    const body = await request.json();

    const bundle = await prisma.assistantBundle.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        longDescription: body.longDescription,
        price: body.price ? parseFloat(body.price) : undefined,
        priceGold: body.priceGold ? parseFloat(body.priceGold) : null,
        pricePlatinum: body.pricePlatinum ? parseFloat(body.pricePlatinum) : null,
        image: body.image,
        videoUrl: body.videoUrl,
        featured: body.featured,
        active: body.active,
        industry: body.industry,
        chatbotLink: body.chatbotLink,
        chatbotLinkGold: body.chatbotLinkGold,
        chatbotLinkPlatinum: body.chatbotLinkPlatinum,
      }
    });

    return NextResponse.json({ bundle });
  } catch (error: any) {
    console.error("Update bundle error:", error);
    return NextResponse.json({ error: error.message || "Error" }, { status: 500 });
  }
}

// DELETE: Xóa bộ trợ lý (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const { id } = params;

    // Check if bundle has orders
    const orders = await prisma.bundleOrder.count({
      where: { bundleId: id }
    });

    if (orders > 0) {
      return NextResponse.json({ error: "Không thể xóa vì đã có đơn hàng" }, { status: 400 });
    }

    await prisma.assistantBundle.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete bundle error:", error);
    return NextResponse.json({ error: error.message || "Error" }, { status: 500 });
  }
}
