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
      select: { 
        status: true, 
        customerEmail: true, 
        customerName: true, 
        customerPhone: true,
        referralCode: true,
        referrerId: true,
        totalPrice: true,
      },
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
      currentOrder.customerEmail &&
      currentOrder.customerPhone
    ) {
      console.log("Creating customer account for:", currentOrder.customerEmail);
      
      try {
        // Import supabase admin client
        const { createClient } = await import("@supabase/supabase-js");
        
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
          console.error("SUPABASE_SERVICE_ROLE_KEY is not set!");
        } else {
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY
          );

          // Check if user already exists in Supabase Auth
          const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
          const authUserExists = existingAuthUsers?.users?.some(
            (u) => u.email === currentOrder.customerEmail
          );

          let authUserId: string | null = null;

          if (authUserExists) {
            // Get existing auth user ID
            const existingAuthUser = existingAuthUsers?.users?.find(
              (u) => u.email === currentOrder.customerEmail
            );
            authUserId = existingAuthUser?.id || null;
            console.log("Auth user already exists:", authUserId);
          } else {
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

            if (authError) {
              console.error("Error creating auth user:", authError.message);
            } else if (authUser.user) {
              authUserId = authUser.user.id;
              console.log("Created auth user:", authUserId);
            }
          }

          // Check if user exists in database
          if (authUserId) {
            const existingDbUser = await prisma.user.findUnique({
              where: { email: currentOrder.customerEmail },
            });

            if (!existingDbUser) {
              // Create user in database
              await prisma.user.create({
                data: {
                  id: authUserId,
                  email: currentOrder.customerEmail,
                  password: currentOrder.customerPhone,
                  name: currentOrder.customerName,
                  phone: currentOrder.customerPhone,
                  role: "customer",
                },
              });
              console.log("Created database user for:", currentOrder.customerEmail);
            } else {
              console.log("Database user already exists:", currentOrder.customerEmail);
            }
          }
        }
      } catch (createError) {
        console.error("Error creating customer account:", createError);
      }

      // Cập nhật stats cho CTV khi đơn hàng được xác nhận
      if (currentOrder.referralCode && currentOrder.referrerId) {
        try {
          await prisma.referralLink.update({
            where: { code: currentOrder.referralCode },
            data: {
              orderCount: { increment: 1 },
              revenue: { increment: currentOrder.totalPrice },
            },
          });
          console.log("Updated referral stats for code:", currentOrder.referralCode);
        } catch (refError) {
          console.error("Error updating referral stats:", refError);
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

