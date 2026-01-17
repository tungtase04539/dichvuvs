import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { createReferralLinkForUser } from "@/lib/referral";

// Supabase Admin client
function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
    if (!supabaseServiceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

export async function POST(request: NextRequest) {
    try {
        const adminUser = await getSession();
        if (!adminUser || !(await isAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { applicationId, action, rejectReason } = body;

        if (!applicationId || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ error: "Yêu cầu không hợp lệ" }, { status: 400 });
        }

        const application = await prisma.cTVApplication.findUnique({
            where: { id: applicationId },
            include: { user: true }
        });

        if (!application) {
            return NextResponse.json({ error: "Không tìm thấy đơn đăng ký" }, { status: 404 });
        }

        if (application.status !== "pending") {
            return NextResponse.json({ error: "Đơn này đã được xử lý" }, { status: 400 });
        }

        if (action === "approve") {
            const supabaseAdmin = getSupabaseAdmin();
            let authId = null;

            // 1. Giai đoạn 1: Đảm bảo tồn tại tài khoản Supabase Auth
            try {
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
                    // Nếu đã tồn tại, ta thử lấy User ID
                    if (createError.message.toLowerCase().includes("already exists") || createError.status === 422) {
                        try {
                            const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
                            if (listError) throw listError;

                            const existingUser = users.find(u => u.email === application.email);
                            if (existingUser) {
                                authId = existingUser.id;
                                // Cập nhật mật khẩu và metadata cho user hiện có
                                const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                                    authId,
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
                                if (updateError) console.warn("Supabase Auth Update Warning:", updateError.message);
                            }
                        } catch (innerError: any) {
                            console.error("List users fallback failed:", innerError);
                            // Nếu listUsers cũng lỗi (Database error finding users), ta vẫn cho phép duyệt trong Prisma
                            // nhưng cần cảnh báo là có thể Auth chưa đồng bộ.
                            // Ở đây ta có thể chọn throw hoặc tiếp tục.
                        }
                    } else {
                        throw createError;
                    }
                } else {
                    authId = createData.user?.id;
                }
            } catch (authError: any) {
                console.error("Supabase Auth Logic Error:", authError);
                // Nếu lỗi "Database error finding users" xảy ra ở đây, ta ném lỗi ra cho admin biết
                return NextResponse.json({
                    error: `Lỗi kết nối Supabase Auth: ${authError.message}. Vui lòng kiểm tra lại cấu hình Auth hoặc thử lại sau.`,
                    details: authError
                }, { status: 500 });
            }

            // 2. Giai đoạn 2: Cập nhật Prisma
            await prisma.user.update({
                where: { id: application.userId },
                data: { role: "collaborator" }
            });

            await prisma.cTVApplication.update({
                where: { id: applicationId },
                data: {
                    status: "approved",
                    reviewedBy: adminUser.email,
                    reviewedAt: new Date(),
                }
            });

            // 3. Tự động tạo referral link cho CTV mới
            let referralCode = null;
            try {
                const referralLink = await createReferralLinkForUser(application.userId);
                referralCode = referralLink?.code || null;
            } catch (refError) {
                console.error("[Referral] Silent failure during CTV approval:", refError);
            }

            return NextResponse.json({
                success: true,
                message: `Phê duyệt CTV thành công!\nEmail: ${application.email}\nMật khẩu: ${application.phone}${referralCode ? `\nMã giới thiệu: ${referralCode}` : ''}`,
                referralCode
            });
        } else {
            // Reject logic
            await prisma.cTVApplication.update({
                where: { id: applicationId },
                data: {
                    status: "rejected",
                    reviewedBy: adminUser.email,
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
            details: typeof error === 'object' ? { message: error.message, stack: error.stack } : String(error)
        }, { status: 500 });
    }
}
