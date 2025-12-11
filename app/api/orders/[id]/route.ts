import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
      include: {
        service: true,
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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, assignedToId, notes } = body;

    // Get current order to check status change
    const currentOrder = await prisma.order.findUnique({
      where: { id: params.id },
      select: { status: true, customerEmail: true, customerName: true, customerPhone: true },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

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

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        service: true,
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    });

    // Tự động tạo tài khoản khách hàng khi thanh toán thành công
    if (
      status &&
      (status === "confirmed" || status === "completed") &&
      currentOrder.status !== "confirmed" &&
      currentOrder.status !== "completed" &&
      currentOrder.customerEmail
    ) {
      // Check if account already exists in database
      const existingUser = await prisma.user.findUnique({
        where: { email: currentOrder.customerEmail },
      });

      if (!existingUser) {
        // Import supabase admin client
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Create user in Supabase Auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: currentOrder.customerEmail,
          password: currentOrder.customerPhone, // Mật khẩu = số điện thoại
          email_confirm: true,
          user_metadata: {
            name: currentOrder.customerName,
            role: "customer",
          },
        });

        if (!authError && authUser.user) {
          // Create user in database with same ID
          await prisma.user.create({
            data: {
              id: authUser.user.id,
              email: currentOrder.customerEmail,
              password: currentOrder.customerPhone,
              name: currentOrder.customerName,
              phone: currentOrder.customerPhone,
              role: "customer",
            },
          });
        }
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

