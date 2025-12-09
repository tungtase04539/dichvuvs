import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-32-character-secret-key!!";

function decrypt(text: string): string {
  try {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return text;
  }
}

// Get credentials for an order (customer view)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get("orderCode");
    const phone = searchParams.get("phone");

    if (!orderCode || !phone) {
      return NextResponse.json(
        { error: "Thiếu thông tin" },
        { status: 400 }
      );
    }

    // Find order and verify phone
    const order = await prisma.order.findFirst({
      where: {
        orderCode,
        customerPhone: phone,
      },
      include: {
        service: true,
        credential: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    // Only show credentials for confirmed orders
    if (order.status !== "confirmed" && order.status !== "completed") {
      return NextResponse.json({
        order: {
          orderCode: order.orderCode,
          status: order.status,
          service: order.service.name,
        },
        message: "Đơn hàng chưa được thanh toán",
        credential: null,
      });
    }

    // Return decrypted credentials
    if (order.credential) {
      return NextResponse.json({
        order: {
          orderCode: order.orderCode,
          status: order.status,
          service: order.service.name,
          icon: order.service.icon,
        },
        credential: {
          accountInfo: decrypt(order.credential.accountInfo),
          password: decrypt(order.credential.password),
          apiKey: order.credential.apiKey ? decrypt(order.credential.apiKey) : null,
          notes: order.credential.notes,
        },
      });
    }

    return NextResponse.json({
      order: {
        orderCode: order.orderCode,
        status: order.status,
        service: order.service.name,
      },
      message: "Tài khoản đang được chuẩn bị, vui lòng liên hệ hỗ trợ",
      credential: null,
    });
  } catch (error) {
    console.error("Get credentials error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

