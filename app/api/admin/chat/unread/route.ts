import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSession();
    
    if (!user || (user.role !== "admin" && user.role !== "staff")) {
      return NextResponse.json({ count: 0 });
    }

    // Count sessions with unread messages (where admin hasn't responded to the latest message)
    const unreadSessions = await prisma.chatSession.count({
      where: {
        messages: {
          some: {
            role: "user",
            createdAt: {
              // Messages in the last 24 hours that might need response
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        },
        // Check if the latest message is from user (not admin)
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    // Alternative: Count based on sessions without admin reply
    const sessionsNeedingReply = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT cs.id) as count
      FROM "ChatSession" cs
      WHERE EXISTS (
        SELECT 1 FROM "ChatMessage" cm
        WHERE cm."sessionId" = cs.id
        AND cm.role = 'user'
        AND cm."createdAt" > NOW() - INTERVAL '24 hours'
        AND NOT EXISTS (
          SELECT 1 FROM "ChatMessage" cm2
          WHERE cm2."sessionId" = cs.id
          AND cm2.role = 'assistant'
          AND cm2."createdAt" > cm."createdAt"
        )
      )
    `;

    const count = sessionsNeedingReply[0]?.count 
      ? Number(sessionsNeedingReply[0].count) 
      : unreadSessions;

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    // Return 0 on error to not break the UI
    return NextResponse.json({ count: 0 });
  }
}

