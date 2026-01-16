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
    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get orders by customer email
    const orders = await prisma.order.findMany({
      where: {
        customerEmail: user.email,
      },
      select: {
        id: true,
        orderCode: true,
        status: true,
        totalPrice: true,
        createdAt: true,
        serviceId: true,
        orderPackageType: true, // Loại gói: standard, gold, platinum, single
        service: {
          select: {
            name: true,
            chatbotLink: true, // Thêm link mặc định từ sản phẩm
          },
        },
        credential: {
          select: {
            accountInfo: true,
            password: true,
            notes: true,
          },
        },
        chatbotData: {
          select: {
            activationCode: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format orders with credentials from various sources
    const formattedOrders = await Promise.all(orders.map(async (order) => {
      let credentialData = null;

      // Hợp nhất dữ liệu từ nhiều nguồn
      if (order.credential) {
        // Ưu tiên 1: Dữ liệu từ bảng ProductCredential (đầy đủ nhất)
        credentialData = {
          accountInfo: order.credential.accountInfo,
          password: order.credential.password,
          notes: order.credential.notes,
        };
      } else if (order.chatbotData) {
        // Ưu tiên 2: Dữ liệu từ ChatbotInventory (mã kích hoạt)
        credentialData = {
          accountInfo: order.service.chatbotLink || "", // Link từ service
          password: order.chatbotData.activationCode,
          notes: "",
        };
      } else if (order.status === "confirmed" || order.status === "completed") {
        // Ưu tiên 3: Trường hợp Shared Chatbot (count = 1) - Không gán orderId
        // Thử tìm xem có mã dùng chung nào không
        const sharedBot = await prisma.chatbotInventory.findFirst({
          where: { serviceId: (order as any).serviceId } // Cần lấy thêm serviceId hoặc dùng relation
        });

        if (sharedBot) {
          credentialData = {
            accountInfo: order.service.chatbotLink || "",
            password: sharedBot.activationCode,
            notes: "Đây là mã dùng chung cho dịch vụ này.",
          };
        }
      }

      return {
        ...order,
        credential: credentialData
      };
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("Get customer orders error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

