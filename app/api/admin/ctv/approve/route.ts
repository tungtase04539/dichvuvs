import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// Supabase Admin client
function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    if (!supabaseServiceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

export async function POST(request: NextRequest) {
    try {
        const user = await getSession();
        if (!user || !(await isAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { applicationId, action, rejectReason } = body;

        if (!applicationId || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const application = await prisma.cTVApplication.findUnique({
            where: { id: applicationId },
            include: { user: true }
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        if (application.status !== "pending") {
            return NextResponse.json({ error: "Application already processed" }, { status: 400 });
        }

        if (action === "approve") {
            const supabaseAdmin = getSupabaseAdmin();

            // 1. Try to create Supabase Auth Account
            const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: application.email,
                password: application.phone,
                email_confirm: true,
                user_metadata: {
                    role: "collaborator",
                    phone: application.phone,
                    name: application.fullName
                }
            });

            if (createError) {
                // If user already exists, we need their ID to update them
                // We'll search for them in the user list
                const { data: { users: authUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
                if (listError) throw listError;

                const existingUser = authUsers?.find(u => u.email === application.email);
                if (existingUser) {
                    // Update existing user: Set password to phone and update metadata
                    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                        existingUser.id,
                        {
                            password: application.phone,
                            user_metadata: {
                                ...existingUser.user_metadata,
                                role: "collaborator",
                                phone: application.phone,
                                name: application.fullName
                            }
                        }
                    );
                    if (updateError) throw updateError;
                } else {
                    // This could happen if there are >50 users and the user is not on page 1
                    // or if the error was not "already exists"
                    throw createError;
                }
            }

            // 2. Update status and role in Prisma
            await prisma.cTVApplication.update({
                where: { id: applicationId },
                data: {
                    status: "approved",
                    reviewedBy: user.email,
                    reviewedAt: new Date(),
                }
            });

            await prisma.user.update({
                where: { id: application.userId },
                data: { role: "collaborator" }
            });

            return NextResponse.json({
                success: true,
                message: `Đã duyệt thành công.\nTài khoản: ${application.email}\nMật khẩu: ${application.phone}`
            });
        } else {
            // Reject logic
            await prisma.cTVApplication.update({
                where: { id: applicationId },
                data: {
                    status: "rejected",
                    reviewedBy: user.email,
                    reviewedAt: new Date(),
                    rejectReason: rejectReason || "Không đạt yêu cầu"
                }
            });

            return NextResponse.json({ success: true, message: "Đã từ chối đơn đăng ký" });
        }

    } catch (error: any) {
        console.error("CTV Approval error:", error);
        return NextResponse.json({
            error: error.message || "Lỗi hệ thống khi xử lý đơn",
            details: error
        }, { status: 500 });
    }
}
