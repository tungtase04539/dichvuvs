import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Get all products (admin)
export async function GET() {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create new product
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, longDescription, price, icon, featured, active } = body;

    if (!name || !slug || !price) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Check if slug exists
    const existing = await prisma.service.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Slug đã tồn tại" },
        { status: 400 }
      );
    }

    const product = await prisma.service.create({
      data: {
        name,
        slug,
        description: description || null,
        longDescription: longDescription || null,
        price: parseFloat(price),
        unit: "bot",
        icon: icon || "🤖",
        featured: featured || false,
        active: active !== false,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

