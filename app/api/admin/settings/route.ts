import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Keys we want to manage for packages
const PACKAGE_SETTING_KEYS = [
    "price_gold",
    "price_platinum",
    "features_gold",
    "features_platinum",
    "chatbot_link_gold",
    "chatbot_link_platinum",
    "description_gold",
    "description_platinum",
    "price_standard",
    "features_standard",
    "description_standard"
];

// Get global settings (Public)
export async function GET() {
    try {

        const settings = await prisma.setting.findMany({
            where: {
                key: { in: PACKAGE_SETTING_KEYS }
            }
        });

        // Convert to key-value object
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json({ settings: settingsObj });
    } catch (error) {
        console.error("Get settings error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// Update settings
export async function POST(request: NextRequest) {
    try {
        if (!(await isStaff())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Validate and update each setting
        const updates = Object.entries(body).filter(([key]) => PACKAGE_SETTING_KEYS.includes(key));

        if (updates.length > 0) {
            await prisma.$transaction(
                updates.map(([key, value]) =>
                    prisma.setting.upsert({
                        where: { key },
                        update: { value: String(value) },
                        create: { key, value: String(value) },
                    })
                )
            );
        }

        return NextResponse.json({ success: true, message: "Cập nhật cấu hình thành công" });
    } catch (error) {
        console.error("Update settings error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
