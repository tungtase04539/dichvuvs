import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

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
            // 1. Update application status
            await prisma.cTVApplication.update({
                where: { id: applicationId },
                data: {
                    status: "approved",
                    reviewedBy: user.email,
                    reviewedAt: new Date(),
                }
            });

            // 2. Update user role to collaborator (ctv)
            // Note: role in Prisma is 'collaborator', but user metadata might also need update
            await prisma.user.update({
                where: { id: application.userId },
                data: { role: "collaborator" }
            });

            // TODO: In a real app, you might want to update Supabase Auth metadata here as well
            // if using Supabase Auth for roles.

            return NextResponse.json({ success: true, message: "Approved successfully" });
        } else {
            // Reject
            await prisma.cTVApplication.update({
                where: { id: applicationId },
                data: {
                    status: "rejected",
                    reviewedBy: user.email,
                    reviewedAt: new Date(),
                    rejectReason: rejectReason || "Không đạt yêu cầu"
                }
            });

            return NextResponse.json({ success: true, message: "Rejected successfully" });
        }

    } catch (error: any) {
        console.error("CTV Approval error:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}
