import { NextResponse } from "next/server";
import { isStaff } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await isStaff())) {
      return NextResponse.json({ count: 0 });
    }

    // Count sessions with unread messages from guests
    const unreadCount = await prisma.message.count({
      where: {
        senderType: "guest",
        read: false,
        createdAt: {
          // Messages in the last 7 days
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return NextResponse.json({ count: unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    // Return 0 on error to not break the UI
    return NextResponse.json({ count: 0 });
  }
}
