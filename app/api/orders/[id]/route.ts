import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateAndCreateCommissions } from "@/lib/commission";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        orderCode: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        status: true,
        totalPrice: true,
        quantity: true,
        basePrice: true,
        notes: true,
        referralCode: true,
        referrerId: true,
        scheduledDate: true,
        scheduledTime: true,
        createdAt: true,
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            chatbotLink: true,
          }
        },
        assignedTo: {
          select: { id: true, name: true, phone: true, email: true },
        },
        chatSession: {
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    // Auth check: Admin/Staff or Customer (owner) or CTV (referrer)
    const isAdminOrStaff = ["admin", "staff"].includes(user.role);
    const isOwner = order.customerEmail === user.email;
    const isReferrer = order.referrerId === user.id;

    if (!isAdminOrStaff && !isOwner && !isReferrer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user || !["admin", "staff"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, assignedToId, notes, chatbotLink } = body;

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
    }
    if (assignedToId !== undefined) {
      updateData.assignedToId = assignedToId || null;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (chatbotLink !== undefined) {
      updateData.chatbotLink = chatbotLink;
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        orderCode: true,
        status: true,
        totalPrice: true,
        notes: true,
        referrerId: true,
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            chatbotLink: true,
          }
        },
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    });

    // Tự động tính commission khi đơn hàng được xác nhận
    if (status === "confirmed" && order.referrerId) {
      try {
        const commissions = await calculateAndCreateCommissions(order.id);
        console.log(`[Order ${order.orderCode}] Created ${commissions.length} commissions`);
      } catch (commError) {
        console.error(`[Order ${order.orderCode}] Commission calculation error:`, commError);
        // Không throw error để không ảnh hưởng đến việc update order
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.order.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

