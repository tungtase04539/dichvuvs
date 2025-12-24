import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Get inventory for a product
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const serviceId = searchParams.get("serviceId");

        if (!serviceId) {
            return NextResponse.json({ error: "Thiếu serviceId" }, { status: 400 });
        }

        const inventory = await prisma.chatbotInventory.findMany({
            where: { serviceId },
            orderBy: { createdAt: "desc" },
            include: {
                order: {
                    select: {
                        orderCode: true,
                        customerName: true
                    }
                }
            }
        });

        return NextResponse.json({ inventory });
    } catch (error) {
        console.error("Get inventory error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// Add new inventory item
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { serviceId, chatbotLink, activationCode } = body;

        if (!serviceId || !chatbotLink || !activationCode) {
            return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
        }

        const newItem = await prisma.chatbotInventory.create({
            data: {
                serviceId,
                chatbotLink,
                activationCode,
            },
        });

        return NextResponse.json({ item: newItem });
    } catch (error) {
        console.error("Add inventory error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// Delete inventory item
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });
        }

        await prisma.chatbotInventory.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete inventory error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
