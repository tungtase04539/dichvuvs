import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Get all credentials for a service
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");

    const where = serviceId ? { serviceId } : {};

    const credentials = await prisma.productCredential.findMany({
      where,
      include: {
        service: { select: { id: true, name: true, icon: true } },
        order: { select: { id: true, orderCode: true, customerName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ credentials });
  } catch (error) {
    console.error("Get credentials error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create new credential
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, accountInfo, password, apiKey, notes } = body;

    if (!serviceId || !accountInfo || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Check service exists
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 400 });
    }

    // Store credentials (plain text - Supabase RLS provides security)
    const credential = await prisma.productCredential.create({
      data: {
        serviceId,
        accountInfo,
        password,
        apiKey: apiKey || null,
        notes: notes || null,
      },
      include: {
        service: { select: { id: true, name: true, icon: true } },
      },
    });

    return NextResponse.json({ credential });
  } catch (error) {
    console.error("Create credential error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
