import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// SePay configuration
const SEPAY_BANK_ACCOUNT = process.env.SEPAY_BANK_ACCOUNT || "";
const SEPAY_BANK_NAME = process.env.SEPAY_BANK_NAME || "MB";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get("orderCode");

    if (!orderCode) {
      return NextResponse.json({ error: "Order code required" }, { status: 400 });
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { orderCode },
      include: { service: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get bank settings
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ["bank_name", "bank_account", "bank_owner"] },
      },
    });
    const bankSettings = settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {} as Record<string, string>
    );

    const bankAccount = bankSettings.bank_account || SEPAY_BANK_ACCOUNT;
    const bankName = bankSettings.bank_name || SEPAY_BANK_NAME;
    const bankOwner = bankSettings.bank_owner || "CONG TY VE SINH HCM";
    const amount = Math.round(order.totalPrice);
    const content = orderCode;

    // Generate SePay QR URL
    // Format: https://qr.sepay.vn/img?acc=ACCOUNT&bank=BANK&amount=AMOUNT&des=CONTENT
    const qrUrl = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${bankName}&amount=${amount}&des=${encodeURIComponent(content)}&template=compact`;

    return NextResponse.json({
      success: true,
      qrUrl,
      bankInfo: {
        bankName,
        bankAccount,
        bankOwner,
        amount,
        content,
      },
      order: {
        id: order.id,
        orderCode: order.orderCode,
        totalPrice: order.totalPrice,
        status: order.status,
        service: {
          name: order.service.name,
          icon: order.service.icon,
        },
      },
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

