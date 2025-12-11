import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface SepayWebhookPayload {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount: string | null;
  code: string | null;
  content: string;
  transferType: string;
  description: string;
  transferAmount: number;
  referenceCode: string;
  accumulated: number;
}

export async function POST(request: NextRequest) {
  try {
    const transaction: SepayWebhookPayload = await request.json();
    
    console.log("SePay webhook received:", transaction);

    // Only process incoming transfers (transferType = "in")
    if (transaction.transferType !== "in") {
      return NextResponse.json({ success: true, message: "Outgoing transfer ignored" });
    }

    // Extract order code from content
    // Format: "VS241209XXXX" - mã đơn hàng
    const content = transaction.content || transaction.description || "";
    const orderCodeMatch = content.match(/VS\d{6}[A-Z0-9]{4}/i);
    
    if (!orderCodeMatch) {
      console.log("No order code found in:", content);
      return NextResponse.json({ success: true, message: "No order code found" });
    }

    const orderCode = orderCodeMatch[0].toUpperCase();
    
    // Find order with service info
    const order = await prisma.order.findUnique({
      where: { orderCode },
      include: { service: true },
      // Include all fields needed for account creation
    });

    if (!order) {
      console.log("Order not found:", orderCode);
      return NextResponse.json({ success: true, message: "Order not found" });
    }

    // Check if already confirmed
    if (order.status !== "pending") {
      console.log("Order already processed:", orderCode);
      return NextResponse.json({ success: true, message: "Order already processed" });
    }

    // Check if payment amount matches (allow 1000đ tolerance)
    const tolerance = 1000;
    const isAmountMatch = Math.abs(transaction.transferAmount - order.totalPrice) <= tolerance;

    // Find available credential for this service
    const availableCredential = await prisma.productCredential.findFirst({
      where: {
        serviceId: order.serviceId,
        isUsed: false,
      },
      orderBy: { createdAt: "asc" }, // First in, first out
    });

    // Update order status to confirmed and assign credential
    const updateData: Record<string, unknown> = {
      status: "confirmed",
      notes: order.notes 
        ? `${order.notes}\n\n✅ Đã thanh toán ${transaction.transferAmount.toLocaleString('vi-VN')}đ qua ${transaction.gateway} lúc ${transaction.transactionDate}${!isAmountMatch ? ' (Số tiền không khớp)' : ''}`
        : `✅ Đã thanh toán ${transaction.transferAmount.toLocaleString('vi-VN')}đ qua ${transaction.gateway} lúc ${transaction.transactionDate}${!isAmountMatch ? ' (Số tiền không khớp)' : ''}`,
    };

    await prisma.order.update({
      where: { id: order.id },
      data: updateData,
    });

    // Assign credential if available
    if (availableCredential) {
      await prisma.productCredential.update({
        where: { id: availableCredential.id },
        data: {
          isUsed: true,
          orderId: order.id,
        },
      });
      console.log(`✅ Credential assigned to order ${orderCode}`);
    } else {
      console.log(`⚠️ No credential available for service ${order.service.name}`);
    }

    console.log(`✅ Order ${orderCode} confirmed with payment ${transaction.transferAmount}`);

    // Tạo tài khoản khách hàng sau khi thanh toán thành công
    if (order.customerEmail && order.customerPhone) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY
          );

          const customerEmail = order.customerEmail;
          const customerPhone = order.customerPhone;

          // Check if user already exists in Supabase Auth
          const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
          const authUserExists = existingAuthUsers?.users?.some(
            (u) => u.email === customerEmail
          );

          let authUserId: string | null = null;

          if (authUserExists) {
            const existingAuthUser = existingAuthUsers?.users?.find(
              (u) => u.email === customerEmail
            );
            authUserId = existingAuthUser?.id || null;
            console.log("Auth user already exists:", authUserId);
          } else {
            // Create user in Supabase Auth
            const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
              email: customerEmail,
              password: customerPhone, // Mật khẩu = số điện thoại
              email_confirm: true,
              user_metadata: {
                name: order.customerName,
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

          // Create user in database if not exists
          if (authUserId) {
            const existingDbUser = await prisma.user.findUnique({
              where: { email: customerEmail },
            });

            if (!existingDbUser) {
              await prisma.user.create({
                data: {
                  id: authUserId,
                  email: customerEmail,
                  password: customerPhone,
                  name: order.customerName,
                  phone: customerPhone,
                  role: "customer",
                },
              });
              console.log("Created database user for:", customerEmail);
            }
          }

          // Update referral stats if applicable
          if (order.referralCode) {
            await prisma.referralLink.update({
              where: { code: order.referralCode },
              data: {
                orderCount: { increment: 1 },
                revenue: { increment: order.totalPrice },
              },
            }).catch(e => console.error("Referral update error:", e));
          }
        }
      } catch (accountError) {
        console.error("Error creating customer account:", accountError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Order ${orderCode} confirmed` 
    });
  } catch (error) {
    console.error("SePay webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// SePay may send GET to verify endpoint
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "SePay webhook endpoint is active" 
  });
}
