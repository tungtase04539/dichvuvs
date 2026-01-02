import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fullName, phone, email } = body;

        if (!fullName || !phone || !email) {
            return NextResponse.json(
                { error: "Vui lòng nhập đầy đủ họ tên, số điện thoại và email" },
                { status: 400 }
            );
        }

        // 1. Check if user already exists in Prisma or create one
        // Note: We don't necessarily need a Supabase user for the initial application
        // but the schema says ctvApplication belongs to a User.
        // So we lookup by email.

        let user = await prisma.user.findUnique({
            where: { email }
        });

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
