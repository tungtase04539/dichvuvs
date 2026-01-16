import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Generate order code
function generateOrderCode(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BL${dateStr}${random}`; // BL = Bundle
}

// POST: Tạo đơn hàng bộ trợ lý
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      bundleId,
      customerName, 
      customerPhone, 
      customerEmail, 
      packageType,
      referralCode,
      notes 
    } = body;

    if (!bundleId || !customerName || !customerPhone) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Get bundle
    const bundle = await prisma.assistantBundle.findUnique({
      where: { id: bundleId }
    });

    if (!bundle || !bundle.active) {
      return NextResponse.json({ error: "Bộ trợ lý không tồn tại" }, { status: 404 });
    }

    // Calculate price based on package type
    let totalPrice = bundle.price;
    if (packageType === "gold" && bundle.priceGold) {
      totalPrice = bundle.priceGold;
    } else if (packageType === "platinum" && bundle.pricePlatinum) {
      totalPrice = bundle.pricePlatinum;
    }

    // Handle referral
    let referrerId = null;
    let finalReferralCode = referralCode || null;

    if (finalReferralCode) {
      try {
        const refLink = await prisma.referralLink.findUnique({
          where: { code: finalReferralCode }
        });
        if (refLink) {
          referrerId = refLink.userId;
          // Update referral stats
          await prisma.referralLink.update({
            where: { id: refLink.id },
            data: {
              orderCount: { increment: 1 },
              revenue: { increment: totalPrice }
            }
          });
        } else {
          finalReferralCode = null;
        }
      } catch (e) {
        console.error("Referral lookup error:", e);
      }
    }

    const orderCode = generateOrderCode();

    const order = await prisma.bundleOrder.create({
      data: {
        orderCode,
        bundleId,
        customerName,
        customerPhone,
        customerEmail,
        basePrice: totalPrice,
        totalPrice,
        status: "pending",
        orderPackageType: packageType || "standard",
        referrerId,
        referralCode: finalReferralCode,
        notes,
      },
      include: {
        bundle: {
          select: {
            name: true,
            slug: true,
          }
        }
      }
    });

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Create bundle order error:", error);
    return NextResponse.json({ error: error.message || "Lỗi tạo đơn hàng" }, { status: 500 });
  }
}

// GET: Lấy đơn hàng theo mã
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get("code");
    const phone = searchParams.get("phone");

    if (!orderCode) {
      return NextResponse.json({ error: "Thiếu mã đơn hàng" }, { status: 400 });
    }

    const where: any = { orderCode };
    if (phone) {
      where.customerPhone = phone;
    }

    const order = await prisma.bundleOrder.findFirst({
      where,
      include: {
        bundle: {
          select: {
            id: true,
            name: true,
            slug: true,
            chatbotLink: true,
            chatbotLinkGold: true,
            chatbotLinkPlatinum: true,
          }
        },
        credential: true,
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    // Build delivery data
    let deliveryData = null;
    if ((order.status === "confirmed" || order.status === "completed") && order.credential) {
      let chatbotLink = order.bundle.chatbotLink;
      if (order.orderPackageType === "gold" && order.bundle.chatbotLinkGold) {
        chatbotLink = order.bundle.chatbotLinkGold;
      } else if (order.orderPackageType === "platinum" && order.bundle.chatbotLinkPlatinum) {
        chatbotLink = order.bundle.chatbotLinkPlatinum;
      }

      deliveryData = {
        chatbotLink,
        activationCode: order.credential.activationCode,
      };
    }

    return NextResponse.json({ 
      order: {
        ...order,
        deliveryData
      }
    });
  } catch (error) {
    console.error("Get bundle order error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
