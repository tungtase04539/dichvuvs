import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, facebook, experience, reason } = body;

    // Validate required fields
    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, SĐT, Email)" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    // Validate phone format (Vietnamese phone)
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    const cleanPhone = phone.replace(/\s/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Số điện thoại không hợp lệ" },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Check if user already has a CTV application
      const existingApplication = await prisma.cTVApplication.findUnique({
        where: { userId: user.id },
      });

      if (existingApplication) {
        if (existingApplication.status === "pending") {
          return NextResponse.json(
            { error: "Bạn đã có đơn đăng ký đang chờ duyệt" },
            { status: 400 }
          );
        } else if (existingApplication.status === "approved") {
          return NextResponse.json(
            { error: "Bạn đã được duyệt làm CTV rồi" },
            { status: 400 }
          );
        }
      }
    } else {
      // Create new user with default password (user will reset later)
      const defaultPassword = await bcrypt.hash("temp123456", 10);
      user = await prisma.user.create({
        data: {
          email,
          password: defaultPassword,
          name,
          phone: cleanPhone,
          role: "customer", // Default role, will be changed to "collaborator" when approved
        },
      });
    }

    // Create or update CTV application
    const application = await prisma.cTVApplication.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: name,
        phone: cleanPhone,
        email,
        facebook: facebook || null,
        zalo: null, // Can be extracted from facebook field if needed
        experience: experience || null,
        reason: reason || null,
        status: "pending",
      },
      update: {
        fullName: name,
        phone: cleanPhone,
        email,
        facebook: facebook || null,
        zalo: null,
        experience: experience || null,
        reason: reason || null,
        status: "pending", // Reset to pending if updating
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong vòng 24h.",
      applicationId: application.id,
    });
  } catch (error: any) {
    console.error("CTV registration error:", error);
    
    // Handle unique constraint errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email hoặc số điện thoại đã được sử dụng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}


