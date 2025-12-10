import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Update credential
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { accountInfo, password, apiKey, notes } = body;

    if (!accountInfo || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    const credential = await prisma.productCredential.update({
      where: { id: params.id },
      data: {
        accountInfo,
        password,
        apiKey: apiKey || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ credential });
  } catch (error) {
    console.error("Update credential error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete credential
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const credential = await prisma.productCredential.findUnique({
      where: { id: params.id },
    });

    if (!credential) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }

    if (credential.isUsed) {
      return NextResponse.json(
        { error: "Không thể xóa tài khoản đã gán cho đơn hàng" },
        { status: 400 }
      );
    }

    await prisma.productCredential.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete credential error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
