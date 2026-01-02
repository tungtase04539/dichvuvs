import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fullName, phone, email, website } = body;

        // 1. Anti-spam: Honeypot check
        if (website) {
            return NextResponse.json({ error: "Xác minh không thành công" }, { status: 400 });
        }

        if (!fullName || !phone || !email) {
            return NextResponse.json(
                { error: "Vui lòng nhập đầy đủ họ tên, số điện thoại và email" },
                { status: 400 }
            );
        }

        // 2. Stricter validation
        const phoneRegex = /^(0|84)(3|5|7|8|9)([0-9]{8})$/;
        if (!phoneRegex.test(phone)) {
            return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
        }

        // 3. Check if user already exists in Prisma or create one
        let user = await prisma.user.findUnique({
            where: { email }
        });

        // Also check if phone is already used by another user to prevent multi-email/phone spam
        const userByPhone = await prisma.user.findFirst({
            where: { phone }
        });

        if (!user && userByPhone) {
            return NextResponse.json({ error: "Số điện thoại này đã được đăng ký với email khác" }, { status: 400 });
        }

        if (!user) {
            // Create a skeleton user if not exists
            user = await prisma.user.create({
                data: {
                    email,
                    name: fullName,
                    phone,
                    password: "", // No password needed for initial application
                    role: "customer" // Default role
                }
            });
        }

        // 2. Check if there's already an application for this user
        const existingApp = await prisma.cTVApplication.findUnique({
            where: { userId: user.id }
        });

        if (existingApp) {
            if (existingApp.status === "pending") {
                return NextResponse.json({
                    message: "Bạn đã gửi đơn đăng ký rồi. Vui lòng đợi Admin duyệt!",
                    status: "pending"
                });
            } else if (existingApp.status === "approved") {
                return NextResponse.json({
                    message: "Chúc mừng! Bạn đã là Cộng tác viên của hệ thống.",
                    status: "approved"
                });
            }
        }

        // 3. Create the application
        await prisma.cTVApplication.create({
            data: {
                userId: user.id,
                fullName,
                phone,
                email,
                status: "pending"
            }
        });

        return NextResponse.json({
            success: true,
            message: "Đăng ký thành công! Vui lòng tham gia nhóm Zalo để được hỗ trợ."
        });

    } catch (error: any) {
        console.error("CTV Application error:", error);
        return NextResponse.json(
            { error: "Lỗi hệ thống khi gửi đơn đăng ký", details: error.message },
            { status: 500 }
        );
    }
}
